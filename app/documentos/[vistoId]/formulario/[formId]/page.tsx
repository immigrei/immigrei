import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { getUserPlan } from "@/lib/plan";
import FormularioClient from "./FormularioClient";

/**
 * Wizard de preenchimento de formulário oficial em PT-BR. Gated: requer
 * login e assinatura ativa — mesmo padrão de /painel. Plano grátis vê só o
 * cabeçalho do formulário com CTA para /planos (sem campos, sem autosave).
 */
export default async function FormularioPage() {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const plan = await getUserPlan(userId);
  return <FormularioClient hasAccess={plan !== "free"} />;
}
