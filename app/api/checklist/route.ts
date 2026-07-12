import { auth, currentUser } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import checklists from "@/app/documentos/[vistoId]/data";

// Persisted checklist checkmarks. Each row = one item the user marked as
// done in a kit. Read by the kit page (survive reload) and by /painel
// (journey steps only turn green from real user input).

function isValidTarget(vistoId: string, documentoId: string): boolean {
  const kit = checklists[vistoId];
  if (!kit) return false;
  return kit.grupos.some((g) => g.documentos.some((d) => d.id === documentoId));
}

// GET ?vistoId=f1-cos → { items: ["status-valido", ...] }
export async function GET(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const vistoId = req.nextUrl.searchParams.get("vistoId");
  if (!vistoId) return NextResponse.json({ error: "vistoId required" }, { status: 400 });

  const { data, error } = await supabaseAdmin
    .from("user_checklist_items")
    .select("documento_id")
    .eq("user_id", userId)
    .eq("visto_id", vistoId);

  if (error) {
    console.error("List checklist items error:", error);
    return NextResponse.json({ error: "Failed to list" }, { status: 500 });
  }
  return NextResponse.json({ items: (data ?? []).map((r) => r.documento_id) });
}

// POST { vistoId, documentoId, checked } → marks/unmarks one item
export async function POST(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json().catch(() => ({}));
  const { vistoId, documentoId, checked } = body as {
    vistoId?: unknown; documentoId?: unknown; checked?: unknown;
  };

  if (typeof vistoId !== "string" || typeof documentoId !== "string" || typeof checked !== "boolean") {
    return NextResponse.json({ error: "vistoId, documentoId and checked required" }, { status: 400 });
  }
  if (!isValidTarget(vistoId, documentoId)) {
    return NextResponse.json({ error: "Unknown checklist item" }, { status: 400 });
  }

  if (checked) {
    // Signed-in users may not have completed onboarding yet — make sure the
    // profile row exists before the FK on user_checklist_items kicks in.
    const user = await currentUser();
    await supabaseAdmin.from("profiles").upsert(
      {
        clerk_user_id: userId,
        email: user?.emailAddresses[0]?.emailAddress ?? null,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "clerk_user_id" }
    );

    const { error } = await supabaseAdmin.from("user_checklist_items").upsert(
      { user_id: userId, visto_id: vistoId, documento_id: documentoId },
      { onConflict: "user_id,visto_id,documento_id" }
    );
    if (error) {
      console.error("Check item error:", error);
      return NextResponse.json({ error: "Failed to save" }, { status: 500 });
    }
  } else {
    const { error } = await supabaseAdmin
      .from("user_checklist_items")
      .delete()
      .eq("user_id", userId)
      .eq("visto_id", vistoId)
      .eq("documento_id", documentoId);
    if (error) {
      console.error("Uncheck item error:", error);
      return NextResponse.json({ error: "Failed to save" }, { status: 500 });
    }
  }

  return NextResponse.json({ success: true });
}
