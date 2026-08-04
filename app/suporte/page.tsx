import type { Metadata } from "next";
import Link from "next/link";
import Logo from "../components/Logo";
import Footer from "../components/Footer";

export const metadata: Metadata = {
  metadataBase: new URL("https://immigrei.com"),
  title: "Suporte — immigrei",
  description: "Como falar com a immigrei, gerenciar sua assinatura e tirar dúvidas sobre o app.",
  alternates: { canonical: "/suporte" },
};

export default function SuportePage() {
  return (
    <main className="min-h-screen bg-cream">
      <header className="flex items-center px-6 py-6 max-w-3xl mx-auto">
        <Link href="/" aria-label="immigrei — início">
          <Logo variant="lockup" className="text-4xl" />
        </Link>
      </header>
      <article className="max-w-2xl mx-auto px-6 pb-20">
        <h1
          className="text-3xl md:text-4xl font-semibold text-ink mb-2"
          style={{ fontFamily: "var(--font-display)" }}
        >
          Suporte
        </h1>
        <p className="text-ink-soft text-base leading-relaxed mb-10">
          Precisa de ajuda? Aqui estão os caminhos mais rápidos, dependendo do que você precisa.
        </p>

        <section className="mb-8">
          <h2 className="text-ink font-bold text-lg mb-3">Fale com a gente</h2>
          <p className="text-ink-soft text-base leading-relaxed mb-3">
            Escreva pra{" "}
            <a href="mailto:ola@immigrei.com" className="text-pine underline underline-offset-4">
              ola@immigrei.com
            </a>{" "}
            — respondemos o mais rápido possível, em português.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-ink font-bold text-lg mb-3">Gerenciar ou cancelar sua assinatura</h2>
          <p className="text-ink-soft text-base leading-relaxed mb-3">
            Você cancela quando quiser, direto no app — sem precisar nos escrever. Acesse{" "}
            <Link href="/perfil" className="text-pine underline underline-offset-4">
              Perfil
            </Link>{" "}
            e toque em &ldquo;Gerenciar ou cancelar assinatura&rdquo;. Você continua com acesso até o
            fim do período já pago, mesmo depois de cancelar.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-ink font-bold text-lg mb-3">Dúvidas sobre cobrança</h2>
          <p className="text-ink-soft text-base leading-relaxed mb-3">
            Pagamentos são processados pela Stripe — a immigrei nunca vê nem armazena o número do
            seu cartão. Se uma cobrança parecer errada, escreva pra{" "}
            <a href="mailto:ola@immigrei.com" className="text-pine underline underline-offset-4">
              ola@immigrei.com
            </a>{" "}
            com a data e o valor, e a gente confere com você.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-ink font-bold text-lg mb-3">Dúvidas sobre o seu caso ou visto</h2>
          <p className="text-ink-soft text-base leading-relaxed mb-3">
            A immigrei organiza a sua jornada e explica o que cada status significa — não somos um
            escritório de advocacia e não damos aconselhamento jurídico individual. Pra decisões
            específicas do seu caso, converse com um{" "}
            <Link href="/profissionais" className="text-pine underline underline-offset-4">
              profissional verificado
            </Link>
            .
          </p>
        </section>

        <p className="text-ink-faint text-sm mt-10">
          Veja também{" "}
          <Link href="/termos" className="text-pine underline underline-offset-4">
            Termos de Uso
          </Link>
          ,{" "}
          <Link href="/privacidade" className="text-pine underline underline-offset-4">
            Política de Privacidade
          </Link>{" "}
          e{" "}
          <Link href="/seguranca" className="text-pine underline underline-offset-4">
            Segurança
          </Link>
          .
        </p>
      </article>
      <Footer />
    </main>
  );
}
