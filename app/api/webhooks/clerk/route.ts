/**
 * POST /api/webhooks/clerk
 *
 * Syncs Clerk user events to Supabase.
 * Events handled: user.created, user.updated, user.deleted
 *
 * Setup required:
 * 1. Add CLERK_WEBHOOK_SECRET to .env.local
 * 2. In Clerk Dashboard → Webhooks → add endpoint:
 *    https://immigrei.vercel.app/api/webhooks/clerk
 *    Events: user.created, user.updated, user.deleted
 */

import { NextRequest, NextResponse } from "next/server";
import { Webhook } from "svix";
import { supabaseAdmin } from "@/lib/supabase";

type ClerkUserEvent = {
  type: "user.created" | "user.updated" | "user.deleted";
  data: {
    id: string;
    first_name: string | null;
    last_name: string | null;
    email_addresses: { email_address: string; id: string }[];
    primary_email_address_id: string | null;
    image_url: string | null;
    created_at: number;
    updated_at: number;
  };
};

export async function POST(req: NextRequest) {
  const secret = process.env.CLERK_WEBHOOK_SECRET;
  if (!secret) {
    return NextResponse.json({ error: "Webhook secret not configured" }, { status: 500 });
  }

  const svixId        = req.headers.get("svix-id");
  const svixTimestamp = req.headers.get("svix-timestamp");
  const svixSignature = req.headers.get("svix-signature");

  if (!svixId || !svixTimestamp || !svixSignature) {
    return NextResponse.json({ error: "Missing svix headers" }, { status: 400 });
  }

  const body = await req.text();

  let event: ClerkUserEvent;
  try {
    const wh = new Webhook(secret);
    event = wh.verify(body, {
      "svix-id":        svixId,
      "svix-timestamp": svixTimestamp,
      "svix-signature": svixSignature,
    }) as ClerkUserEvent;
  } catch {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  const { type, data } = event;

  if (type === "user.deleted") {
    await supabaseAdmin.from("profiles").delete().eq("clerk_user_id", data.id);
    return NextResponse.json({ received: true });
  }

  const primaryEmail = data.email_addresses.find(
    (e) => e.id === data.primary_email_address_id
  )?.email_address ?? data.email_addresses[0]?.email_address ?? null;

  const fullName = [data.first_name, data.last_name].filter(Boolean).join(" ") || null;

  const { error } = await supabaseAdmin.from("profiles").upsert(
    {
      clerk_user_id: data.id,
      full_name:     fullName,
      email:         primaryEmail,
      avatar_url:    data.image_url,
      updated_at:    new Date().toISOString(),
    },
    { onConflict: "clerk_user_id" }
  );

  if (error) {
    console.error("Supabase upsert error:", error);
    return NextResponse.json({ error: "Failed to sync user" }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}
