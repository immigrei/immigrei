import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { getUserPlan } from "@/lib/plan";
import GuiasClient from "./GuiasClient";

// Guias de integração nos EUA: conteúdo editorial (SSN, DMV, crédito, saúde)
// — sem status pessoal, sem API, só texto curado com fonte oficial.
export default async function GuiasPage() {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const plan = await getUserPlan(userId);

  return <GuiasClient hasAccess={plan !== "free"} />;
}
