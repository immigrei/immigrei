import { UserButton } from "@clerk/nextjs";
import { auth, currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { createServiceClient } from "@/lib/supabase";

const VISA_LABELS: Record<string, string> = {
  f1: "F-1 — Estudante",
  h1b: "H-1B — Trabalho especializado",
  o1: "O-1 — Talento extraordinário",
  l1: "L-1 — Transferência intraempresarial",
  b1b2: "B-1/B-2 — Turismo ou negócios",
  green_card: "Green Card",
  asylee: "Asilo ou refugiado",
  outro: "Outro",
};

const GOAL_LABELS: Record<string, string> = {
  regularizar_status: "Regularizar minha situação",
  renovar_visto: "Renovar meu visto",
  green_card: "Solicitar o Green Card",
  trazer_familia: "Trazer minha família",
  entender_direitos: "Entender meus direitos",
  cidadania: "Buscar a cidadania americana",
  outro: "Outro",
};

function formatDate(dateStr: string) {
  const [year, month, day] = dateStr.split("-");
  return new Date(Number(year), Number(month) - 1, Number(day)).toLocaleDateString("pt-BR", {
    month: "long",
    year: "numeric",
  });
}

function yearsInUS(dateStr: string): string {
  const arrival = new Date(dateStr);
  const now = new Date();
  const diff = now.getTime() - arrival.getTime();
  const years = Math.floor(diff / (1000 * 60 * 60 * 24 * 365));
  const months = Math.floor((diff % (1000 * 60 * 60 * 24 * 365)) / (1000 * 60 * 60 * 24 * 30));
  if (years === 0) return `${months} ${months === 1 ? "mês" : "meses"}`;
  return `${years} ${years === 1 ? "ano" : "anos"}${months > 0 ? ` e ${months} ${months === 1 ? "mês" : "meses"}` : ""}`;
}

export default async function DashboardPage() {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const user = await currentUser();
  const firstName = user?.firstName ?? "você";

  const supabase = createServiceClient();
  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("clerk_user_id", userId)
    .single();

  if (!profile?.onboarding_completed) redirect("/onboarding");

  return (
    <main className="min-h-screen bg-cream">
      <header className="flex items-center justify-between px-6 py-4 bg-cream-2 border-b border-pine-tint">
        <span
          className="text-2xl font-semibold text-pine"
          style={{ fontFamily: "var(--font-display)" }}
        >
          Immigrei
        </span>
        <UserButton afterSignOutUrl="/" />
      </header>

      <div className="max-w-2xl mx-auto px-6 py-10">
        <h1
          className="text-3xl font-semibold text-ink mb-1"
          style={{ fontFamily: "var(--font-display)" }}
        >
          Olá, {firstName} 👋
        </h1>
        <p className="text-ink-soft text-base mb-8">
          Aqui está um resumo da sua jornada migratória.
        </p>

        {/* Journey card */}
        <div className="bg-cream-2 rounded-2xl border border-pine-tint overflow-hidden mb-5">
          <div className="px-6 py-4 border-b border-pine-tint">
            <p className="text-xs font-bold uppercase tracking-widest text-ink-faint">
              Sua situação
            </p>
          </div>
          <div className="divide-y divide-pine-tint">
            <InfoRow
              label="Tipo de visto"
              value={VISA_LABELS[profile.visa_type] ?? profile.visa_type}
            />
            <InfoRow
              label="Chegada nos EUA"
              value={`${formatDate(profile.arrival_date)} — há ${yearsInUS(profile.arrival_date)}`}
            />
            <InfoRow
              label="Objetivo principal"
              value={GOAL_LABELS[profile.main_goal] ?? profile.main_goal}
            />
          </div>
        </div>

        {/* Next steps placeholder */}
        <div className="bg-amber-tint rounded-2xl p-6 border border-amber mb-5">
          <p className="text-xs font-bold uppercase tracking-widest text-amber-deep mb-2">
            Próximos passos
          </p>
          <p className="text-ink text-sm leading-relaxed">
            Estamos montando o mapa completo da sua jornada com base nas suas respostas. Em breve você verá seus próximos passos aqui.
          </p>
        </div>

        {/* Edit profile link */}
        <p className="text-center text-xs text-ink-faint">
          Informações erradas?{" "}
          <a href="/onboarding/edit" className="text-pine underline underline-offset-2">
            Editar perfil
          </a>
        </p>
      </div>
    </main>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="px-6 py-4 flex flex-col gap-0.5">
      <span className="text-xs font-bold uppercase tracking-widest text-ink-faint">
        {label}
      </span>
      <span className="text-ink text-base font-medium">{value}</span>
    </div>
  );
}
