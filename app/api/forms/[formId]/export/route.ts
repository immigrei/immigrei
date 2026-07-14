/**
 * POST /api/forms/[formId]/export
 *
 * Fills the official PDF with the user's answers, attaches it to the document
 * vault (user_documents) under the form's checklist item, marks the draft as
 * exported, and streams the PDF back so the browser also downloads it.
 *
 * The user is the author: we only transcribe what they entered. The generated
 * PDF keeps its fields editable so they can still adjust and must sign by hand.
 */

import { auth, currentUser } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { getForm } from "@/lib/forms/registry";
import { fillPdf } from "@/lib/forms/fillPdf";
import { allQuestions, isVisible, type Answers } from "@/lib/forms/types";

export const runtime = "nodejs";

const BUCKET = "user-documents";

function missingRequired(formId: string, answers: Answers): string[] {
  const form = getForm(formId)!;
  return allQuestions(form)
    .filter((q) => q.required && isVisible(q, answers))
    .filter((q) => {
      const v = answers[q.id];
      return v === undefined || v === null || v === "";
    })
    .map((q) => q.labelPt);
}

export async function POST(req: NextRequest, ctx: { params: Promise<{ formId: string }> }) {
  const { formId } = await ctx.params;
  const form = getForm(formId);
  if (!form) return NextResponse.json({ error: "Formulário não encontrado." }, { status: 404 });

  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Não autenticado." }, { status: 401 });

  const body = await req.json().catch(() => ({}));
  const answers = (body?.answers ?? null) as Answers | null;
  if (!answers || typeof answers !== "object") {
    return NextResponse.json({ error: "Respostas ausentes." }, { status: 400 });
  }

  const missing = missingRequired(formId, answers);
  if (missing.length > 0) {
    return NextResponse.json(
      { error: "Faltam campos obrigatórios.", missing },
      { status: 400 }
    );
  }

  // Fill the official PDF.
  let pdfBytes: Uint8Array;
  try {
    pdfBytes = await fillPdf(form, answers);
  } catch (err) {
    console.error("fillPdf error:", err);
    return NextResponse.json({ error: "Falha ao gerar o formulário." }, { status: 500 });
  }
  const buffer = Buffer.from(pdfBytes);

  // Profile row must exist for the user_documents FK.
  const user = await currentUser();
  await supabaseAdmin.from("profiles").upsert(
    {
      clerk_user_id: userId,
      email: user?.emailAddresses[0]?.emailAddress ?? null,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "clerk_user_id" }
  );

  const { vistoId, documentoId } = form.attachTo;
  const stamp = new Date().toISOString().slice(0, 10);
  const fileName = `${form.code}-${stamp}.pdf`;
  const storagePath = `${userId}/${vistoId}/${documentoId}/${crypto.randomUUID()}-${fileName}`;

  const { error: uploadError } = await supabaseAdmin.storage
    .from(BUCKET)
    .upload(storagePath, buffer, { contentType: "application/pdf" });
  if (uploadError) {
    console.error("Export storage upload error:", uploadError);
    return NextResponse.json({ error: "Falha ao anexar no cofre." }, { status: 500 });
  }

  const { error: insertError } = await supabaseAdmin.from("user_documents").insert({
    user_id: userId,
    visto_id: vistoId,
    documento_id: documentoId,
    file_name: fileName,
    storage_path: storagePath,
    mime_type: "application/pdf",
    size_bytes: buffer.byteLength,
  });
  if (insertError) {
    await supabaseAdmin.storage.from(BUCKET).remove([storagePath]);
    console.error("Export insert document error:", insertError);
    return NextResponse.json({ error: "Falha ao anexar no cofre." }, { status: 500 });
  }

  // Persist answers + mark the draft exported (best-effort, non-blocking).
  await supabaseAdmin
    .from("form_submissions")
    .upsert(
      {
        user_id: userId,
        form_id: formId,
        visto_id: vistoId,
        answers,
        status: "exported",
        exported_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      { onConflict: "user_id,form_id" }
    );

  return new NextResponse(buffer, {
    status: 200,
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${fileName}"`,
      "Cache-Control": "no-store",
    },
  });
}
