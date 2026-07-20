import { auth, currentUser } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { getUserPlan } from "@/lib/plan";
import { vistosEstudo, vistosNegocios } from "@/lib/vistosCatalog";
import {
  AUTHOR_STATES,
  BODY_MAX,
  BODY_MIN,
  CONTACT_BLOCKED_MESSAGE,
  MAX_REPORTS_PER_DAY,
  MAX_VISAS_PER_REPORT,
  TITLE_MAX,
  findContactInfo,
} from "@/lib/community";

// Closed community: reading requires login; publishing requires an active
// subscription. Every report enters as "pending" and only shows up in the
// feed after manual approval.

const VALID_VISAS = new Set(
  [...vistosEstudo, ...vistosNegocios].map((v) => v.id)
);
const VALID_STATES = new Set<string>(AUTHOR_STATES);

interface ReportRow {
  id: string;
  user_id: string;
  title: string;
  body: string;
  is_anonymous: boolean;
  author_name: string | null;
  author_state: string;
  status: string;
  created_at: string;
  report_visas: { visto_id: string }[];
  report_reactions: { count: number }[];
}

function toPublicReport(row: ReportRow, viewerId: string, myReactions: Set<string>) {
  return {
    id: row.id,
    title: row.title,
    body: row.body,
    author: row.is_anonymous ? "Membro immigrei" : row.author_name ?? "Membro immigrei",
    isAnonymous: row.is_anonymous,
    authorState: row.author_state,
    status: row.status,
    isMine: row.user_id === viewerId,
    createdAt: row.created_at,
    visas: row.report_visas.map((v) => v.visto_id),
    helpedCount: row.report_reactions[0]?.count ?? 0,
    helpedByMe: myReactions.has(row.id),
  };
}

// GET ?vistoId=f1 (optional filter) → approved reports + the viewer's own
// pending/rejected ones, newest first.
export async function GET(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const vistoId = req.nextUrl.searchParams.get("vistoId");

  let query = supabaseAdmin
    .from("community_reports")
    .select(
      "id, user_id, title, body, is_anonymous, author_name, author_state, status, created_at, report_visas(visto_id), report_reactions(count)"
    )
    .or(`status.eq.approved,user_id.eq.${userId}`)
    .order("created_at", { ascending: false })
    .limit(50);

  if (vistoId) {
    const { data: ids } = await supabaseAdmin
      .from("report_visas")
      .select("report_id")
      .eq("visto_id", vistoId);
    const reportIds = (ids ?? []).map((r) => r.report_id);
    if (reportIds.length === 0) return NextResponse.json({ reports: [], plan: await getUserPlan(userId) });
    query = query.in("id", reportIds);
  }

  const [{ data, error }, { data: mine }, plan] = await Promise.all([
    query,
    supabaseAdmin.from("report_reactions").select("report_id").eq("user_id", userId),
    getUserPlan(userId),
  ]);

  if (error) {
    console.error("List reports error:", error);
    return NextResponse.json({ error: "Failed to list" }, { status: 500 });
  }

  const myReactions = new Set((mine ?? []).map((r) => r.report_id));
  const reports = ((data ?? []) as unknown as ReportRow[]).map((row) =>
    toPublicReport(row, userId, myReactions)
  );

  return NextResponse.json({ reports, plan });
}

// POST { title, body, visas: string[], isAnonymous, authorState }
export async function POST(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const plan = await getUserPlan(userId);
  if (plan === "free") {
    return NextResponse.json(
      { error: "Publicar relatos é exclusivo para assinantes." },
      { status: 403 }
    );
  }

  const payload = await req.json().catch(() => null);
  const title = typeof payload?.title === "string" ? payload.title.trim() : "";
  const body = typeof payload?.body === "string" ? payload.body.trim() : "";
  const visas: unknown = payload?.visas;
  const isAnonymous = payload?.isAnonymous !== false; // default true
  const authorState = typeof payload?.authorState === "string" ? payload.authorState : "";

  if (!title || title.length > TITLE_MAX) {
    return NextResponse.json(
      { error: `O título precisa ter entre 1 e ${TITLE_MAX} caracteres.` },
      { status: 400 }
    );
  }
  if (body.length < BODY_MIN || body.length > BODY_MAX) {
    return NextResponse.json(
      { error: `O relato precisa ter entre ${BODY_MIN} e ${BODY_MAX} caracteres.` },
      { status: 400 }
    );
  }
  if (
    !Array.isArray(visas) ||
    visas.length === 0 ||
    visas.length > MAX_VISAS_PER_REPORT ||
    !visas.every((v) => typeof v === "string" && VALID_VISAS.has(v))
  ) {
    return NextResponse.json(
      { error: `Marque de 1 a ${MAX_VISAS_PER_REPORT} vistos relacionados.` },
      { status: 400 }
    );
  }
  if (!VALID_STATES.has(authorState)) {
    return NextResponse.json({ error: "Selecione seu estado." }, { status: 400 });
  }

  const violation = findContactInfo(`${title}\n${body}`);
  if (violation) {
    return NextResponse.json(
      { error: CONTACT_BLOCKED_MESSAGE, violation },
      { status: 400 }
    );
  }

  // Rate limit: a handful of reports per day keeps the moderation queue sane.
  const since = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
  const { count } = await supabaseAdmin
    .from("community_reports")
    .select("id", { count: "exact", head: true })
    .eq("user_id", userId)
    .gte("created_at", since);
  if ((count ?? 0) >= MAX_REPORTS_PER_DAY) {
    return NextResponse.json(
      { error: "Você atingiu o limite de relatos por dia. Tente novamente amanhã." },
      { status: 429 }
    );
  }

  // Profile row must exist before the FK kicks in (same as user-documents).
  const user = await currentUser();
  const fullName = `${user?.firstName ?? ""} ${user?.lastName ?? ""}`.trim();
  await supabaseAdmin.from("profiles").upsert(
    {
      clerk_user_id: userId,
      email: user?.emailAddresses[0]?.emailAddress ?? null,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "clerk_user_id" }
  );

  // Public display name: first name + last initial ("Juliana R.").
  const authorName = isAnonymous
    ? null
    : `${user?.firstName ?? "Membro"} ${(user?.lastName ?? "").charAt(0)}`.trim().replace(/ (\w)$/, " $1.");

  const { data: report, error: insertError } = await supabaseAdmin
    .from("community_reports")
    .insert({
      user_id: userId,
      title,
      body,
      is_anonymous: isAnonymous,
      author_name: authorName || fullName || null,
      author_state: authorState,
    })
    .select("id")
    .single();

  if (insertError || !report) {
    console.error("Insert report error:", insertError);
    return NextResponse.json({ error: "Failed to save" }, { status: 500 });
  }

  const { error: visasError } = await supabaseAdmin
    .from("report_visas")
    .insert(visas.map((vistoId) => ({ report_id: report.id, visto_id: vistoId })));
  if (visasError) {
    await supabaseAdmin.from("community_reports").delete().eq("id", report.id);
    console.error("Insert report visas error:", visasError);
    return NextResponse.json({ error: "Failed to save" }, { status: 500 });
  }

  return NextResponse.json({ success: true, reportId: report.id });
}
