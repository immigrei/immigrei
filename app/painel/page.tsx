import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { getUserPlan } from "@/lib/plan";
import PainelClient from "./PainelClient";

/**
 * Painel estratégico. O plano é resolvido no servidor: no plano grátis a
 * timeline da jornada aparece como prévia borrada com CTA para /planos
 * (ver PaywallGate); assinantes veem o painel inteiro.
 */
export default async function PainelPage() {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const plan = await getUserPlan(userId);

  return <PainelClient hasAccess={plan !== "free"} />;
}
