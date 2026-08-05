import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { supabaseAdmin } from "@/lib/supabase";
import { getUserPlan } from "@/lib/plan";

// Calculadora de custos: lembra quais taxas oficiais o usuário marcou/
// desmarcou, os custos extras que ele adicionou manualmente (tradução,
// advogado…) e a cotação preferida — persistido para voltar igual entre
// sessões.

const UpsertItemSchema = z.union([
  // Taxa do catálogo (data.ts): toggla seleção e opcionalmente ajusta o
  // valor (ex: taxa com opção online/papel).
  z.object({ itemId: z.string(), selecionado: z.boolean(), valorUsd: z.number().positive() }),
  // Custo manual novo (tradução, advogado etc.).
  z.object({ titulo: z.string().min(1).max(200), valorUsd: z.number().positive() }),
]);
const SettingsSchema = z.object({ cambioBrl: z.number().positive() });
const DeleteBodySchema = z.object({ id: z.string() });

export async function GET() {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const [itemsRes, settingsRes] = await Promise.all([
    supabaseAdmin.from("user_cost_items").select("*").eq("user_id", userId),
    supabaseAdmin.from("user_cost_settings").select("cambio_brl").eq("user_id", userId).maybeSingle(),
  ]);

  if (itemsRes.error) {
    console.error("List cost items error:", itemsRes.error);
    return NextResponse.json({ error: "Failed to list" }, { status: 500 });
  }

  return NextResponse.json({
    items: itemsRes.data ?? [],
    cambioBrl: settingsRes.data?.cambio_brl ?? 5.6,
  });
}

// POST: upsert a catalog fee toggle/value, or create a manual cost item.
export async function POST(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const plan = await getUserPlan(userId);
  if (plan === "free") {
    return NextResponse.json(
      { error: "A calculadora de custos é exclusiva para assinantes." },
      { status: 403 },
    );
  }

  const body = await req.json().catch(() => null);
  const parsed = UpsertItemSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Dados inválidos" }, { status: 400 });
  }

  if ("itemId" in parsed.data) {
    const { itemId, selecionado, valorUsd } = parsed.data;
    const { data, error } = await supabaseAdmin
      .from("user_cost_items")
      .upsert(
        { user_id: userId, item_id: itemId, selecionado, valor_usd: valorUsd, updated_at: new Date().toISOString() },
        { onConflict: "user_id,item_id" },
      )
      .select()
      .single();
    if (error || !data) {
      console.error("Upsert cost item error:", error);
      return NextResponse.json({ error: "Failed to save" }, { status: 500 });
    }
    return NextResponse.json({ item: data });
  }

  const { titulo, valorUsd } = parsed.data;
  const { data, error } = await supabaseAdmin
    .from("user_cost_items")
    .insert({ user_id: userId, titulo, valor_usd: valorUsd, selecionado: true })
    .select()
    .single();
  if (error || !data) {
    console.error("Insert cost item error:", error);
    return NextResponse.json({ error: "Failed to save" }, { status: 500 });
  }
  return NextResponse.json({ item: data });
}

// PATCH: update the exchange rate preference.
export async function PATCH(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json().catch(() => null);
  const parsed = SettingsSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "cambioBrl required" }, { status: 400 });
  }

  const { error } = await supabaseAdmin
    .from("user_cost_settings")
    .upsert(
      { user_id: userId, cambio_brl: parsed.data.cambioBrl, updated_at: new Date().toISOString() },
      { onConflict: "user_id" },
    );
  if (error) {
    console.error("Update cost settings error:", error);
    return NextResponse.json({ error: "Failed to save" }, { status: 500 });
  }
  return NextResponse.json({ success: true });
}

// DELETE { id }: remove a saved item (manual cost, or a catalog toggle row
// to reset it back to its default unselected state).
export async function DELETE(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json().catch(() => ({}));
  const parsed = DeleteBodySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "id required" }, { status: 400 });
  }

  const { error } = await supabaseAdmin
    .from("user_cost_items")
    .delete()
    .eq("id", parsed.data.id)
    .eq("user_id", userId);
  if (error) {
    console.error("Delete cost item error:", error);
    return NextResponse.json({ error: "Failed to delete" }, { status: 500 });
  }
  return NextResponse.json({ success: true });
}
