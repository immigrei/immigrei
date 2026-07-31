/**
 * PATCH  /api/user-processes/[id] — edit label/status/deadline
 * DELETE /api/user-processes/[id] — soft delete (user stopped pursuing it)
 */

import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@clerk/nextjs/server";
import { supabaseAdmin } from "@/lib/supabase";

const DateStringSchema = z.string().regex(/^\d{4}-\d{2}-\d{2}$/);

const PatchBodySchema = z.object({
  label: z.string().min(1).optional(),
  status: z.enum(["ativo", "consideracao"]).optional(),
  deadlineDate: DateStringSchema.nullable().optional(),
  deadlineLabel: z.string().nullable().optional(),
});

export async function PATCH(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await ctx.params;
  const rawBody = await req.json().catch(() => ({}));
  const parsed = PatchBodySchema.safeParse(rawBody);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }
  const { label, status, deadlineDate, deadlineLabel } = parsed.data;

  const row: Record<string, unknown> = { updated_at: new Date().toISOString() };
  if (label !== undefined) row.label = label;
  if (status !== undefined) row.status = status;
  if (deadlineDate !== undefined) row.deadline_date = deadlineDate;
  if (deadlineLabel !== undefined) row.deadline_label = deadlineLabel;

  const { data, error } = await supabaseAdmin
    .from("user_processes")
    .update(row)
    .eq("id", id)
    .eq("user_id", userId)
    .select()
    .single();

  if (error) {
    console.error("Update user_processes error:", error);
    return NextResponse.json({ error: "Failed to save" }, { status: 500 });
  }
  return NextResponse.json({ process: data });
}

export async function DELETE(_req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await ctx.params;

  const { error } = await supabaseAdmin
    .from("user_processes")
    .update({ is_active: false, updated_at: new Date().toISOString() })
    .eq("id", id)
    .eq("user_id", userId);

  if (error) {
    console.error("Delete user_processes error:", error);
    return NextResponse.json({ error: "Failed to remove" }, { status: 500 });
  }
  return NextResponse.json({ success: true });
}
