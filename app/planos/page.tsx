import type { Metadata } from "next";
import Link from "next/link";
import { PLANS } from "@/lib/stripe";
import PlanButton from "./PlanButton";

export const metadata: Metadata = {
  title: "Planos — immigrei",
  description: "Escolha o plano certo para a sua jornada migratória nos EUA.",
};

/**
 * Três cards: Retrato (grátis) e Jornada em duas cadências.
 *
 * A divisão segue a tese da marca — o grátis mostra ONDE VOCÊ ESTÁ
 * (rastreamento, alertas e comunidade, que hoje não têm gate nenhum no
 * código), e o pago mostra PARA ONDE VOCÊ VAI (jornada, kits, cofre — o que
 * está de fato bloqueado por getUserPlan).
 */

const retrato = [
  "Rastreamento do seu caso no USCIS em tempo real",
  "Alertas por e-mail a cada mudança de status",
  "Aviso dos prazos do seu I-94",
  "Visa Bulletin acompanhado por você",
  "Comunidade: publique e participe dos relatos",
  "Prévia da sua jornada completa",
];

const jornada = [
  "Tudo do Retrato",
  "Sua jornada completa, etapa por etapa",
  "Kits e manuais passo a passo, por tipo de visto",
  "Preencha em português, exporte pronto em inglês — sem traduzir nada",
  "Cofre de documentos, ligado a cada checklist",
];

// Só o plano anual tem itens próprios; o resto do card repete a lista da
// Jornada mensal, para as duas nunca divergirem.
const jornadaAnualExtra = [
  "Preço travado por 12 meses",
];

// Tudo derivado de lib/stripe.ts — os valores exibidos são os mesmos que o
// checkout cobra, sem chance de divergirem quando o preço mudar.
const MENSAL = PLANS.monthly.amount;
const ANUAL = PLANS.annual.amount;
const ANUAL_POR_MES = ANUAL / 12;
const ECONOMIA_VALOR = MENSAL * 12 - ANUAL;
const ECONOMIA_PCT = Math.round((ECONOMIA_VALOR / (MENSAL * 12)) * 100);

function usd(valor: number) {
  return `US$ ${valor.toLocaleString("pt-BR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

const ECONOMIA = usd(ECONOMIA_VALOR);

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
            Comece de graça. Avance quando fizer sentido.
          </h1>
          <p className="text-ink-soft text-lg max-w-xl mx-auto">
            O <strong className="text-ink">Retrato</strong> mostra onde você
            está. A <strong className="text-ink">Jornada</strong> mostra aonde
            você pode chegar.
          </p>
        </header>

        <div className="grid md:grid-cols-3 gap-6 items-stretch">

          {/* Retrato — grátis */}
          <div className="flex flex-col bg-cream-2 rounded-2xl p-8 border border-pine-tint">
            <h2 className="text-ink font-bold text-xl mb-1">Retrato</h2>
            <div className="h-7 mb-4" aria-hidden="true" />
            <p className="text-ink-faint text-sm mb-4">Onde você está agora</p>
            <p className="mb-2 flex items-baseline gap-x-2 flex-wrap min-h-[2.75rem]">
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
            <p className="mb-2 flex items-baseline gap-x-2 flex-wrap min-h-[2.75rem]">
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
            <PlanButton plan="monthly" label="Assinar mensal" />
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
            {/* O número que fecha a decisão é o mensal equivalente: só assim a
                pessoa compara com os {usd(MENSAL)} do card ao lado sem fazer
                conta de cabeça. O valor cobrado vem logo abaixo, explícito. */}
            <p className="mb-2 flex items-baseline gap-x-2 gap-y-0 flex-wrap min-h-[2.75rem]">
              <span
                className="text-4xl font-semibold text-ink"
                style={{ fontFamily: "var(--font-display)" }}
              >
                {usd(ANUAL_POR_MES)}
              </span>
              <span className="text-ink-faint text-sm">/mês</span>
              <span className="text-ink-faint text-sm line-through decoration-clay/60">
                {usd(MENSAL)}
              </span>
            </p>
            <p className="text-sage text-sm font-semibold mb-6 h-5">
              Cobrado {usd(ANUAL)} por ano
            </p>
            <ul className="space-y-3 mb-8 flex-1">
              {jornada.map((f) => (
                <Feature key={f}>{f}</Feature>
              ))}
              {jornadaAnualExtra.map((f) => (
                <Feature key={f}>{f}</Feature>
              ))}
              <Feature>
                Você economiza <strong className="text-ink">{ECONOMIA}</strong> por
                ano — {ECONOMIA_PCT}% a menos
              </Feature>
            </ul>
            <PlanButton
              plan="annual"
              highlight
              label={`Assinar anual e economizar ${ECONOMIA_PCT}%`}
            />
          </div>

        </div>

        {/* Selo de pagamento — asset oficial da Stripe, servido sem
            modificação (as brand guidelines deles exigem a marca intacta,
            por isso o roxo #635BFF do arquivo não vira variável da marca). */}
        <div className="mt-10 flex flex-col items-center gap-3">
          {/* eslint-disable-next-line @next/next/no-img-element -- SVG estático
              de 9 KB: next/image não otimiza SVG, só adicionaria wrapper e a
              necessidade de liberar dangerouslyAllowSVG. */}
          <img
            src="/brand/powered-by-stripe.svg"
            alt="Powered by Stripe"
            width={132}
            height={30}
            className="h-[30px] w-auto"
          />
          <p className="text-center text-ink-faint text-sm">
            Cancele quando quiser. A immigrei nunca vê nem armazena o número do
            seu cartão.
          </p>
        </div>
      </div>
    </main>
  );
}
