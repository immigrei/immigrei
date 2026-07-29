import type { Metadata } from "next";
import Link from "next/link";
import PlanButton from "./PlanButton";

export const metadata: Metadata = {
  title: "Planos — immigrei",
  description: "Escolha o plano certo para a sua jornada migratória nos EUA.",
};

/**
 * Três cards: Retrato (grátis) e Jornada em duas cadências.
 *
 * A divisão segue a tese da marca — o grátis mostra ONDE VOCÊ ESTÁ
 * (rastreamento e alertas, que hoje não têm gate nenhum no código), e o pago
 * mostra PARA ONDE VOCÊ VAI (jornada, kits, cofre, comunidade — o que está
 * de fato bloqueado por getUserPlan).
 */

const retrato = [
  "Rastreamento do seu caso no USCIS em tempo real",
  "Alertas por e-mail a cada mudança de status",
  "Aviso dos prazos do seu I-94",
  "Visa Bulletin acompanhado por você",
  "Prévia da sua jornada completa",
];

const jornada = [
  "Tudo do Retrato",
  "Sua jornada completa, etapa por etapa",
  "Kits e manuais passo a passo, por tipo de visto",
  "Preencha em português, exporte pronto em inglês — sem traduzir nada",
  "Cofre de documentos, ligado a cada checklist",
  "Comunidade: publique e participe dos relatos",
];

const ECONOMIA = "US$ 89,80";

function Feature({ children }: { children: React.ReactNode }) {
  return (
    <li className="flex gap-2 text-sm text-ink-soft">
      <span aria-hidden className="text-sage font-bold">✓</span>
      {children}
    </li>
  );
}

export default function PlanosPage() {
  return (
    <main className="min-h-screen bg-cream px-6 py-12">
      <div className="max-w-5xl mx-auto">
        <header className="text-center mb-12">
          <p className="text-xs font-bold uppercase tracking-widest text-amber mb-4">
            Planos
          </p>
          <h1
            className="text-4xl md:text-5xl font-semibold text-ink mb-4"
            style={{ fontFamily: "var(--font-display)" }}
          >
            Clareza tem um plano para você
          </h1>
          <p className="text-ink-soft text-lg max-w-xl mx-auto">
            Comece sabendo onde você está. Evolua para saber aonde vai.
          </p>
        </header>

        <div className="grid md:grid-cols-3 gap-6 items-stretch">

          {/* Retrato — grátis */}
          <div className="flex flex-col bg-cream-2 rounded-2xl p-8 border border-pine-tint">
            <h2 className="text-ink font-bold text-xl mb-1">Retrato</h2>
            <div className="h-7 mb-4" aria-hidden="true" />
            <p className="text-ink-faint text-sm mb-4">Onde você está agora</p>
            <p className="mb-2">
              <span
                className="text-4xl font-semibold text-ink"
                style={{ fontFamily: "var(--font-display)" }}
              >
                US$ 0
              </span>
            </p>
            <p className="text-ink-faint text-sm mb-6 h-5">Para sempre</p>
            <ul className="space-y-3 mb-8 flex-1">
              {retrato.map((f) => (
                <Feature key={f}>{f}</Feature>
              ))}
            </ul>
            <Link
              href="/onboarding"
              className="w-full text-center font-semibold text-base px-6 py-4 rounded-xl border border-pine text-pine hover:bg-pine-tint transition-colors"
            >
              Começar grátis
            </Link>
          </div>

          {/* Jornada — mensal */}
          <div className="flex flex-col bg-cream-2 rounded-2xl p-8 border border-pine-tint">
            <h2 className="text-ink font-bold text-xl mb-1">Jornada</h2>
            <div className="h-7 mb-4" aria-hidden="true" />
            <p className="text-ink-faint text-sm mb-4">Aonde você vai chegar</p>
            <p className="mb-2">
              <span
                className="text-4xl font-semibold text-ink"
                style={{ fontFamily: "var(--font-display)" }}
              >
                US$ 29,90
              </span>
              <span className="text-ink-faint text-sm">/mês</span>
            </p>
            <p className="text-ink-faint text-sm mb-6 h-5">Cobrado todo mês</p>
            <ul className="space-y-3 mb-8 flex-1">
              {jornada.map((f) => (
                <Feature key={f}>{f}</Feature>
              ))}
            </ul>
            <PlanButton plan="monthly" />
          </div>

          {/* Jornada — anual (destaque) */}
          <div className="flex flex-col bg-cream-2 rounded-2xl p-8 border border-amber shadow-lg">
            <h2 className="text-ink font-bold text-xl mb-1">Jornada anual</h2>
            <div className="h-7 mb-4">
              <span className="inline-block self-start text-[11px] font-bold uppercase tracking-widest text-amber-deep bg-amber-tint px-3 py-1 rounded-full">
                3 meses de graça
              </span>
            </div>
            <p className="text-ink-faint text-sm mb-4">A mesma jornada, pagando menos</p>
            <p className="mb-2">
              <span
                className="text-4xl font-semibold text-ink"
                style={{ fontFamily: "var(--font-display)" }}
              >
                US$ 269
              </span>
              <span className="text-ink-faint text-sm">/ano</span>
            </p>
            <p className="text-sage text-sm font-semibold mb-6 h-5">
              Equivale a 9 meses
            </p>
            <ul className="space-y-3 mb-8 flex-1">
              <Feature>Tudo da Jornada mensal</Feature>
              <Feature>
                Economia de <strong className="text-ink">{ECONOMIA}</strong> por ano
              </Feature>
              <Feature>Preço travado por 12 meses</Feature>
            </ul>
            <PlanButton plan="annual" highlight />
          </div>

        </div>

        <p className="text-center text-ink-faint text-sm mt-10">
          Cancele quando quiser. Pagamento seguro via Stripe.
        </p>
      </div>
    </main>
  );
}
