import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { getUserPlan } from "@/lib/plan";
import CustosClient from "./CustosClient";

// Calculadora de custos: taxas oficiais são pré-carregadas do checklist do
// visto (data.ts, campo taxaUsd); custos extras (tradução, advogado…) o
// usuário adiciona manualmente. Recurso de assinante, como o Cofre.
export default async function CustosPage() {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const plan = await getUserPlan(userId);

  return <CustosClient hasAccess={plan !== "free"} />;
}
