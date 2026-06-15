/**
 * GET /api/cron/consulados
 *
 * Monthly cron — 1st of each month at 09:00 UTC.
 * Scrapes Brazilian consulate websites (Miami + NYC),
 * saves new events to Supabase, and emails subscribed users.
 *
 * Protected by CRON_SECRET.
 */

import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { scrapeAllConsulados, type ConsuladoEvent } from "@/lib/consulados";
import { sendConsuladoAlert } from "@/lib/notifications";
import { clerkClient } from "@clerk/nextjs/server";

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const startedAt = new Date().toISOString();
  let scraped = 0, inserted = 0, notified = 0, errors = 0;

  // 1. Scrape consulate websites
  let events: ConsuladoEvent[] = [];
  try {
    events = await scrapeAllConsulados();
    scraped = events.length;
  } catch (err) {
    console.error("[consulados] Scrape failed:", err);
    return NextResponse.json({ error: "Scrape failed", details: String(err) }, { status: 500 });
  }

  // 2. Insert new events (upsert by consulado + titulo + data_inicio)
  const newEvents: ConsuladoEvent[] = [];
  for (const event of events) {
    const { data: existing } = await supabaseAdmin
      .from("consulate_events")
      .select("id")
      .eq("consulado", event.consulado)
      .eq("titulo", event.titulo.slice(0, 120))
      .eq("data_inicio", event.data_inicio ?? "")
      .maybeSingle();

    if (existing) continue;

    const { error } = await supabaseAdmin.from("consulate_events").insert({
      consulado:   event.consulado,
      titulo:      event.titulo.slice(0, 120),
      descricao:   event.descricao.slice(0, 800),
      data_inicio: event.data_inicio,
      data_fim:    event.data_fim,
      cidade:      event.cidade,
      estado:      event.estado,
      servicos:    event.servicos,
      url_fonte:   event.url_fonte,
      tipo:        event.tipo,
      scraped_at:  event.scraped_at,
    });

    if (error) {
      console.error("[consulados] Insert error:", error.message);
      errors++;
    } else {
      inserted++;
      newEvents.push(event);
    }
  }

  // 3. Notify subscribed users about new itinerant events only
  if (newEvents.length > 0) {
    const itinerantes = newEvents.filter(e => e.tipo === "itinerante");

    if (itinerantes.length > 0) {
      const { data: subs } = await supabaseAdmin
        .from("consulate_subscriptions")
        .select("user_id, consulados")
        .eq("active", true);

      if (subs && subs.length > 0) {
        const clerk = await clerkClient();

        for (const sub of subs) {
          const relevant = itinerantes.filter(
            e => (sub.consulados as string[]).includes(e.consulado)
          );
          if (relevant.length === 0) continue;

          try {
            const user  = await clerk.users.getUser(sub.user_id);
            const email = user.emailAddresses?.[0]?.emailAddress;
            const name  = user.firstName ?? "";

            if (email) {
              await sendConsuladoAlert({ to: email, userName: name, events: relevant });
              notified++;
            }
          } catch (err) {
            console.error(`[consulados] Notify error for ${sub.user_id}:`, err);
          }
        }
      }
    }
  }

  const summary = { startedAt, finishedAt: new Date().toISOString(), scraped, inserted, notified, errors };
  console.log("[consulados] Completed:", summary);
  return NextResponse.json(summary);
}
