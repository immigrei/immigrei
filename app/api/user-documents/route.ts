import { auth, currentUser } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import checklists from "@/app/documentos/[vistoId]/data";

// Document vault: users attach files (passport scans, bank statements…) to
// checklist items. The bucket is private — every download goes through a
// short-lived signed URL minted here after an ownership check.

const BUCKET = "user-documents";
const MAX_BYTES = 10 * 1024 * 1024; // 10 MB
const ALLOWED_TYPES = new Set([
  "application/pdf",
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/heic",
]);

function isValidTarget(vistoId: string, documentoId: string): boolean {
  const kit = checklists[vistoId];
  if (!kit) return false;
  return kit.grupos.some((g) => g.documentos.some((d) => d.id === documentoId));
}

// GET ?vistoId=f1        → list of the user's attachments for that kit
// GET ?fileId=<uuid>     → { url } signed for 5 minutes
export async function GET(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const fileId = req.nextUrl.searchParams.get("fileId");
  if (fileId) {
    const { data: row } = await supabaseAdmin
      .from("user_documents")
      .select("storage_path")
      .eq("id", fileId)
      .eq("user_id", userId)
      .single();
    if (!row) return NextResponse.json({ error: "Not found" }, { status: 404 });

    const { data, error } = await supabaseAdmin.storage
      .from(BUCKET)
      .createSignedUrl(row.storage_path, 300);
    if (error || !data) {
      console.error("Signed URL error:", error);
      return NextResponse.json({ error: "Failed to sign URL" }, { status: 500 });
    }
    return NextResponse.json({ url: data.signedUrl });
  }

  const vistoId = req.nextUrl.searchParams.get("vistoId");
  if (!vistoId) return NextResponse.json({ error: "vistoId required" }, { status: 400 });

  const { data, error } = await supabaseAdmin
    .from("user_documents")
    .select("id, documento_id, file_name, size_bytes, created_at")
    .eq("user_id", userId)
    .eq("visto_id", vistoId)
    .order("created_at", { ascending: true });

  if (error) {
    console.error("List documents error:", error);
    return NextResponse.json({ error: "Failed to list" }, { status: 500 });
  }
  return NextResponse.json({ documents: data ?? [] });
}

// POST multipart/form-data: file, vistoId, documentoId
export async function POST(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const form = await req.formData().catch(() => null);
  const file = form?.get("file");
  const vistoId = form?.get("vistoId");
  const documentoId = form?.get("documentoId");

  if (!(file instanceof File) || typeof vistoId !== "string" || typeof documentoId !== "string") {
    return NextResponse.json({ error: "file, vistoId and documentoId required" }, { status: 400 });
  }
  if (!isValidTarget(vistoId, documentoId)) {
    return NextResponse.json({ error: "Unknown checklist item" }, { status: 400 });
  }
  if (file.size === 0 || file.size > MAX_BYTES) {
    return NextResponse.json(
      { error: "O arquivo precisa ter até 10 MB." },
      { status: 400 }
    );
  }
  if (!ALLOWED_TYPES.has(file.type)) {
    return NextResponse.json(
      { error: "Formato não suportado. Envie PDF, JPG, PNG, WEBP ou HEIC." },
      { status: 400 }
    );
  }

  // Signed-in users may not have completed onboarding yet — make sure the
  // profile row exists before the FK on user_documents kicks in.
  const user = await currentUser();
  await supabaseAdmin.from("profiles").upsert(
    {
      clerk_user_id: userId,
      email: user?.emailAddresses[0]?.emailAddress ?? null,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "clerk_user_id" }
  );

  const safeName = file.name.replace(/[^\w.\-()\s]/g, "_").slice(-100);
  const storagePath = `${userId}/${vistoId}/${documentoId}/${crypto.randomUUID()}-${safeName}`;

  const { error: uploadError } = await supabaseAdmin.storage
    .from(BUCKET)
    .upload(storagePath, Buffer.from(await file.arrayBuffer()), {
      contentType: file.type,
    });
  if (uploadError) {
    console.error("Storage upload error:", uploadError);
    return NextResponse.json({ error: "Failed to upload" }, { status: 500 });
  }

  const { data: row, error: insertError } = await supabaseAdmin
    .from("user_documents")
    .insert({
      user_id: userId,
      visto_id: vistoId,
      documento_id: documentoId,
      file_name: file.name,
      storage_path: storagePath,
      mime_type: file.type,
      size_bytes: file.size,
    })
    .select("id, documento_id, file_name, size_bytes, created_at")
    .single();

  if (insertError || !row) {
    // Don't leave orphan files behind if the row failed.
    await supabaseAdmin.storage.from(BUCKET).remove([storagePath]);
    console.error("Insert document error:", insertError);
    return NextResponse.json({ error: "Failed to save" }, { status: 500 });
  }

  return NextResponse.json({ document: row });
}

// DELETE { id }
export async function DELETE(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await req.json().catch(() => ({}));
  if (typeof id !== "string") {
    return NextResponse.json({ error: "id required" }, { status: 400 });
  }

  const { data: row } = await supabaseAdmin
    .from("user_documents")
    .select("id, storage_path")
    .eq("id", id)
    .eq("user_id", userId)
    .single();
  if (!row) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const { error: removeError } = await supabaseAdmin.storage
    .from(BUCKET)
    .remove([row.storage_path]);
  if (removeError) {
    console.error("Storage remove error:", removeError);
    return NextResponse.json({ error: "Failed to delete file" }, { status: 500 });
  }

  const { error: deleteError } = await supabaseAdmin
    .from("user_documents")
    .delete()
    .eq("id", row.id);
  if (deleteError) {
    console.error("Delete row error:", deleteError);
    return NextResponse.json({ error: "Failed to delete" }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
