import type { Metadata } from "next";
import Link from "next/link";
import PlanButton from "./PlanButton";

export const metadata: Metadata = {
  title: "Planos — immigrei",
  description: "Escolha o plano certo para a sua jornada migratória nos EUA.",
};

const tiers = [
  {
    id: "free",
    name: "Grátis",
    price: "US$ 0",
    period: "",
    tagline: "Para começar a sua jornada",
    features: [
      "Mapa da jornada de vistos",
      "Onboarding personalizado",
      "Conteúdo sobre órgãos e consulados",
    ],
  },
  {
    id: "base",
    name: "Base",
    price: "US$ 9",
    period: "/mês",
    tagline: "Para acompanhar seu caso de perto",
    features: [
      "Tudo do Grátis",
      "Rastreamento de caso USCIS",
      "Alertas por e-mail a cada mudança",
      "Histórico completo do caso",
    ],
  },
  {
    id: "core",
    name: "Core",
    price: "US$ 29",
    period: "/mês",
    tagline: "A jornada completa, sem surpresas",
    highlight: true,
    features: [
      "Tudo do Base",
      "Kits de visto passo a passo",
      "Alertas de consulados itinerantes",
      "Visa Bulletin acompanhado por você",
    ],
  },
] as const;

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
            Comece grátis. Evolua quando a sua jornada pedir.
          </p>
        </header>

        <div className="grid md:grid-cols-3 gap-6 items-stretch">
          {tiers.map((tier) => (
            <div
              key={tier.id}
              className={`flex flex-col bg-cream-2 rounded-2xl p-8 border ${
                "highlight" in tier && tier.highlight
                  ? "border-amber shadow-lg"
                  : "border-pine-tint"
              }`}
            >
              {"highlight" in tier && tier.highlight && (
                <span className="self-start text-[11px] font-bold uppercase tracking-widest text-amber-deep bg-amber-tint px-3 py-1 rounded-full mb-4">
                  Mais escolhido
                </span>
              )}
              <h2 className="text-ink font-bold text-xl mb-1">{tier.name}</h2>
              <p className="text-ink-faint text-sm mb-4">{tier.tagline}</p>
              <p className="mb-6">
                <span
                  className="text-4xl font-semibold text-ink"
                  style={{ fontFamily: "var(--font-display)" }}
                >
                  {tier.price}
                </span>
                <span className="text-ink-faint text-sm">{tier.period}</span>
              </p>
              <ul className="space-y-3 mb-8 flex-1">
                {tier.features.map((f) => (
                  <li key={f} className="flex gap-2 text-sm text-ink-soft">
                    <span className="text-sage font-bold">✓</span>
                    {f}
                  </li>
                ))}
              </ul>
              {tier.id === "free" ? (
                <Link
                  href="/onboarding"
                  className="w-full text-center font-semibold text-base px-6 py-4 rounded-xl border border-pine text-pine hover:bg-pine-tint transition-colors"
                >
                  Começar grátis
                </Link>
              ) : (
                <PlanButton
                  plan={tier.id as "base" | "core"}
                  highlight={"highlight" in tier && tier.highlight}
                />
              )}
            </div>
          ))}
        </div>

        <p className="text-center text-ink-faint text-sm mt-10">
          Cancele quando quiser. Pagamento seguro via Stripe.
        </p>
      </div>
    </main>
  );
}
