import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { getUserPlan } from "@/lib/plan";
import CosB2F1Client from "./CosB2F1Client";

/**
 * GPS de mudança de status B1/B2 → F-1. Gated: requer login e assinatura
 * ativa — mesmo padrão de /painel. Plano grátis vê só o cabeçalho com CTA
 * para /planos (sem carregar o caso).
 */
export default async function CosB2F1Page() {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const plan = await getUserPlan(userId);
  return <CosB2F1Client hasAccess={plan !== "free"} />;
}
