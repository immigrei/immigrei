/**
 * GET /api/perfil/export?locale=pt|en
 *
 * Gera e devolve "Meu Perfil immigrei" — feature do plano grátis (Retrato):
 * é uma foto do perfil atual, não um recurso da Jornada paga. Sem gate de
 * plano de propósito.
 */

import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { generatePerfilPdf, type Locale } from "@/lib/perfilExport";
import { checkRateLimit } from "@/lib/rate-limit";

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const allowed = await checkRateLimit(`perfil-export:${userId}`, { max: 10, windowMs: 10 * 60_000 });
  if (!allowed) {
    return NextResponse.json({ error: "Muitas exportações seguidas. Tente novamente em instantes." }, { status: 429 });
  }

  const localeParam = req.nextUrl.searchParams.get("locale");
  const locale: Locale = localeParam === "en" ? "en" : "pt";

  const { data: profile, error } = await supabaseAdmin
    .from("profiles")
    .select("*")
    .eq("clerk_user_id", userId)
    .single();

  if (error || !profile) {
    return NextResponse.json({ error: "Perfil não encontrado." }, { status: 404 });
  }

  let pdfBytes: Uint8Array;
  try {
    pdfBytes = await generatePerfilPdf(profile, locale);
  } catch (err) {
    console.error("generatePerfilPdf error:", err);
    return NextResponse.json({ error: "Falha ao gerar o documento." }, { status: 500 });
  }

  const fileName = locale === "en" ? "my-immigrei-profile.pdf" : "meu-perfil-immigrei.pdf";

  return new NextResponse(Buffer.from(pdfBytes), {
    status: 200,
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${fileName}"`,
    },
  });
}
