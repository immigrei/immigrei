import { UserButton } from "@clerk/nextjs";
import { auth, currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { supabaseAdmin } from "@/lib/supabase";
import { getJourney } from "@/lib/visa-journeys";
import JourneyTimeline from "./JourneyTimeline";
import CaseStatusCard, { UserCase } from "./CaseStatusCard";
import VisaBulletinWidget from "./VisaBulletinWidget";

const VISA_LABELS: Record<string, string> = {
  f1: "F-1 — Estudante",
  m1: "M-1 — Estudante técnico",
  j1: "J-1 — Intercâmbio",
  h1b: "H-1B — Trabalho especializado",
  o1: "O-1 — Talento extraordinário",
  l1: "L-1 — Transferência intraempresarial",
  b1: "B-1 — Visitante de negócios",
  b1b2: "B-1/B-2 — Turismo ou negócios",
  e1: "E-1 — Comércio por tratado",
  e2: "E-2 — Investidor por tratado",
  eb2niw: "EB-2 NIW — Green Card por mérito",
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

  const supabase = supabaseAdmin;
  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("clerk_user_id", userId)
    .single();

  if (!profile?.onboarding_completed) redirect("/onboarding");

  const journey = getJourney(profile.visa_type);

  const { data: userCases } = await supabase
    .from("user_cases")
    .select("id, receipt_number, label, visa_type, last_status, last_status_date, last_checked_at")
    .eq("user_id", userId)
    .eq("is_active", true)
    .order("created_at", { ascending: false });

  const { data: bulletin } = await supabase
    .from("visa_bulletin")
    .select("bulletin_month, bulletin_url, family_dates, employment_dates")
    .order("bulletin_month", { ascending: false })
    .limit(1)
    .maybeSingle();

  return (
    <main className="min-h-screen bg-cream">
      <header className="flex items-center justify-between px-6 py-4 bg-cream-2 border-b border-pine-tint">
        <span
          className="text-2xl font-semibold text-pine"
          style={{ fontFamily: "var(--font-display)" }}
        >
          Immigrei
        </span>
        <UserButton />
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
              label="Caminho escolhido"
              value={VISA_LABELS[profile.visa_type] ?? profile.visa_type}
            />
            {profile.arrival_date && (
              <InfoRow
                label="Chegada nos EUA"
                value={`${formatDate(profile.arrival_date)} — há ${yearsInUS(profile.arrival_date)}`}
              />
            )}
            {profile.main_goal && (
              <InfoRow
                label="Objetivo principal"
                value={GOAL_LABELS[profile.main_goal] ?? profile.main_goal}
              />
            )}
          </div>
        </div>

        {/* USCIS case tracking */}
        <CaseStatusCard initialCases={(userCases ?? []) as UserCase[]} />

        {/* Journey timeline */}
        {journey ? (
          <JourneyTimeline journey={journey} />
        ) : (
          <div className="bg-amber-tint rounded-2xl p-6 border border-amber mb-5">
            <p className="text-xs font-bold uppercase tracking-widest text-amber-deep mb-2">
              Próximos passos
            </p>
            <p className="text-ink text-sm leading-relaxed">
              Estamos montando o mapa completo da sua jornada com base nas suas respostas. Em breve você verá seus próximos passos aqui.
            </p>
          </div>
        )}

        {/* Visa Bulletin */}
        <VisaBulletinWidget bulletin={bulletin} mainGoal={profile.main_goal} />


        {/* Edit profile link */}
        <p className="text-center text-xs text-ink-faint">
          Informações erradas?{" "}
          <a href="/onboarding" className="text-pine underline underline-offset-2">
            Refazer onboarding
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
