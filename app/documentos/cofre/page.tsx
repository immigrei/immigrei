import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { getUserPlan } from "@/lib/plan";
import CofreClient from "./CofreClient";

/**
 * Cofre de documentos — guardar arquivos é recurso de assinante. No plano
 * grátis a página mostra uma prévia ilustrativa do cofre com CTA para
 * /planos, já que sem assinatura não existe upload e o cofre estaria vazio.
 */
export default async function CofrePage() {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const plan = await getUserPlan(userId);

  return <CofreClient hasAccess={plan !== "free"} />;
}
