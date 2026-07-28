import type { Metadata } from "next";
import Link from "next/link";
import PricingToggle from "./PricingToggle";

export const metadata: Metadata = {
  title: "Planos — immigrei",
  description: "Escolha o plano certo para a sua jornada migratória nos EUA.",
};

const freeFeatures = [
  "Onboarding personalizado e login",
  "Prévia do seu caso no USCIS",
  "Prévia da sua jornada completa",
];

export default function PlanosPage() {
  return (
    <main className="min-h-screen bg-cream px-6 py-12">
      <div className="max-w-3xl mx-auto">
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

        <div className="grid md:grid-cols-2 gap-6 items-stretch">
          <div className="flex flex-col bg-cream-2 rounded-2xl p-8 border border-pine-tint">
            <h2 className="text-ink font-bold text-xl mb-1">Grátis</h2>
            <p className="text-ink-faint text-sm mb-4">Para começar a sua jornada</p>
            <p className="mb-6">
              <span
                className="text-4xl font-semibold text-ink"
                style={{ fontFamily: "var(--font-display)" }}
              >
                US$ 0
              </span>
            </p>
            <ul className="space-y-3 mb-8 flex-1">
              {freeFeatures.map((f) => (
                <li key={f} className="flex gap-2 text-sm text-ink-soft">
                  <span className="text-sage font-bold">✓</span>
                  {f}
                </li>
              ))}
            </ul>
            <Link
              href="/onboarding"
              className="w-full text-center font-semibold text-base px-6 py-4 rounded-xl border border-pine text-pine hover:bg-pine-tint transition-colors"
            >
              Começar grátis
            </Link>
          </div>

          <PricingToggle />
        </div>

        <p className="text-center text-ink-faint text-sm mt-10">
          Cancele quando quiser. Pagamento seguro via Stripe.
        </p>
      </div>
    </main>
  );
}
