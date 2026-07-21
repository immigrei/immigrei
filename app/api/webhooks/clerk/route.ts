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
import { z } from "zod";
import { supabaseAdmin } from "@/lib/supabase";

// Validated AFTER svix signature verification — the signature proves the
// event came from Clerk, this just confirms the shape matches what the
// handler below actually reads (previously an unchecked `as ClerkUserEvent`).
const EventEnvelopeSchema = z.object({ type: z.string(), data: z.unknown() });
const DeletedEventDataSchema = z.object({ id: z.string() });
const UserEventDataSchema = z.object({
  id: z.string(),
  first_name: z.string().nullable(),
  last_name: z.string().nullable(),
  email_addresses: z.array(z.object({ email_address: z.string(), id: z.string() })),
  primary_email_address_id: z.string().nullable(),
  image_url: z.string().nullable(),
});

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

  let rawEvent: unknown;
  try {
    const wh = new Webhook(secret);
    rawEvent = wh.verify(body, {
      "svix-id":        svixId,
      "svix-timestamp": svixTimestamp,
      "svix-signature": svixSignature,
    });
  } catch {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  const envelope = EventEnvelopeSchema.safeParse(rawEvent);
  if (!envelope.success) {
    return NextResponse.json({ error: "Unexpected payload" }, { status: 400 });
  }
  const { type, data } = envelope.data;

  if (type === "user.deleted") {
    const parsedDeleted = DeletedEventDataSchema.safeParse(data);
    if (!parsedDeleted.success) {
      return NextResponse.json({ error: "Unexpected payload" }, { status: 400 });
    }
    await supabaseAdmin.from("profiles").delete().eq("clerk_user_id", parsedDeleted.data.id);
    return NextResponse.json({ received: true });
  }

  // Only user.created/user.updated are configured in the Clerk dashboard
  // (see file header) — anything else is acknowledged and ignored rather
  // than treated as an error, in case Clerk ever sends more than expected.
  if (type !== "user.created" && type !== "user.updated") {
    return NextResponse.json({ received: true });
  }

  const parsedUser = UserEventDataSchema.safeParse(data);
  if (!parsedUser.success) {
    return NextResponse.json({ error: "Unexpected payload" }, { status: 400 });
  }
  const userData = parsedUser.data;

  const primaryEmail = userData.email_addresses.find(
    (e) => e.id === userData.primary_email_address_id
  )?.email_address ?? userData.email_addresses[0]?.email_address ?? null;

  const fullName = [userData.first_name, userData.last_name].filter(Boolean).join(" ") || null;

  const { error } = await supabaseAdmin.from("profiles").upsert(
    {
      clerk_user_id: userData.id,
      full_name:     fullName,
      email:         primaryEmail,
      avatar_url:    userData.image_url,
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
