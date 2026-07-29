import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { getUserPlan } from "@/lib/plan";
import VistoIdClient from "./VistoIdClient";

/**
 * Kit de protocolo (checklist, upload no cofre, link para os formulários em
 * PT). Gated: requer login e assinatura ativa — mesmo padrão de /painel e
 * /caminhos/[slug]. Plano grátis vê o cabeçalho + uma prévia borrada do
 * checklist com CTA para /planos.
 */
export default async function DocumentosVistoPage() {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const plan = await getUserPlan(userId);
  return <VistoIdClient hasAccess={plan !== "free"} />;
}
