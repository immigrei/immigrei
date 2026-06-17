import { auth, currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { supabaseAdmin } from "@/lib/supabase";
import { ensureProfile } from "@/lib/profile";
import { getJourney } from "@/lib/visa-journeys";
import JourneyTimeline from "./JourneyTimeline";
import CaseStatusCard, { UserCase } from "./CaseStatusCard";
import VisaBulletinWidget from "./VisaBulletinWidget";
import CaseTracker from "./CaseTracker";
import ConsuladosWidget from "./ConsuladosWidget";
import AppShell from "@/app/components/AppShell";

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

  // Guarantee the user exists in Supabase even if the Clerk webhook never
  // fired (e.g. local dev). Idempotent — won't clobber onboarding fields.
  await ensureProfile(userId);

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
    <AppShell>
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

        {/* Case tracker */}
        <CaseTracker />

        {/* Consulados widget */}
        <ConsuladosWidget />

        {/* Next steps */}
        <NextSteps visaType={profile.visa_type} mainGoal={profile.main_goal} />


        {/* Edit profile link */}
        <p className="text-center text-xs text-ink-faint">
          Informações erradas?{" "}
          <a href="/onboarding" className="text-pine underline underline-offset-2">
            Refazer onboarding
          </a>
        </p>
      </div>
    </AppShell>
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

const NEXT_STEPS: Record<string, { goal: string; steps: string[] }[]> = {
  f1: [
    {
      goal: "renovar_visto",
      steps: [
        "Verifique a data de expiração do seu I-20 com o DSO da sua escola",
        "Solicite a extensão do I-20 com pelo menos 30 dias de antecedência",
        "Renove o visto F-1 no consulado antes de viajar ao exterior",
      ],
    },
    {
      goal: "green_card",
      steps: [
        "Explore o Green Card por emprego (EB-2 NIW se tiver mestrado/doutorado)",
        "Converse com um advogado sobre patrocínio pelo empregador (EB-2 ou EB-3)",
        "Verifique as datas de corte no Boletim de Vistos para sua categoria",
      ],
    },
  ],
  h1b: [
    {
      goal: "renovar_visto",
      steps: [
        "Peça ao seu empregador para iniciar o processo de extensão do H-1B com 6 meses de antecedência",
        "O I-797 de extensão aprovado permite continuar trabalhando legalmente",
        "Se precisar viajar, renove o visto H-1B no consulado antes de sair dos EUA",
      ],
    },
    {
      goal: "green_card",
      steps: [
        "Converse com seu empregador sobre patrocínio para Green Card (EB-2 ou EB-3)",
        "O processo começa com o PERM Labor Certification — pode levar 1 a 2 anos",
        "Monitore o Boletim de Vistos mensalmente para saber quando seu número estará disponível",
      ],
    },
  ],
  green_card: [
    {
      goal: "cidadania",
      steps: [
        "Após 5 anos como residente permanente (3 anos se casado com cidadão americano), você pode pedir cidadania",
        "Preencha o formulário N-400 e pague a taxa no site do USCIS",
        "Prepare-se para a entrevista de naturalização — inglês básico e história dos EUA",
      ],
    },
    {
      goal: "renovar_visto",
      steps: [
        "Renove o Green Card 6 meses antes do vencimento com o formulário I-90",
        "O Green Card de condicional (2 anos) deve ser convertido com o I-751 antes de expirar",
      ],
    },
  ],
};

function NextSteps({ visaType, mainGoal }: { visaType: string; mainGoal: string }) {
  const visaSteps = NEXT_STEPS[visaType] ?? [];
  const match = visaSteps.find((s) => s.goal === mainGoal) ?? visaSteps[0];

  if (!match) {
    return (
      <div className="bg-amber-tint rounded-2xl p-6 border border-amber mb-5">
        <p className="text-xs font-bold uppercase tracking-widest text-amber-deep mb-2">
          Próximos passos
        </p>
        <p className="text-ink text-sm leading-relaxed">
          Estamos mapeando os próximos passos para o seu perfil. Em breve aparecerão aqui.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-amber-tint rounded-2xl border border-amber overflow-hidden mb-5">
      <div className="px-6 py-4 border-b border-amber/30">
        <p className="text-xs font-bold uppercase tracking-widest text-amber-deep">
          Próximos passos
        </p>
      </div>
      <ul className="divide-y divide-amber/20">
        {match.steps.map((step, i) => (
          <li key={i} className="px-6 py-3 flex gap-3 items-start">
            <span className="flex-shrink-0 w-5 h-5 rounded-full bg-amber text-cream-2 text-xs font-bold flex items-center justify-center mt-0.5">
              {i + 1}
            </span>
            <p className="text-ink text-sm leading-relaxed">{step}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}
