import type { Metadata } from "next";
import Link from "next/link";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import Logo from "./components/Logo";
import Eyebrow from "./components/Eyebrow";
import SectionHeading from "./components/SectionHeading";
import Card from "./components/Card";
import CtaButton from "./components/CtaButton";
import Faq from "./components/Faq";
import Footer from "./components/Footer";

export const metadata: Metadata = {
  metadataBase: new URL("https://immigrei.com"),
  title: "immigrei — Sua jornada migratória nos EUA, com clareza.",
  description:
    "O companheiro completo da sua jornada de imigração nos EUA. Em português, construído por imigrantes que já viveram isso na pele.",
  alternates: { canonical: "/" },
  openGraph: {
    title: "immigrei — Sua jornada migratória nos EUA, com clareza.",
    description:
      "Não só onde seu caso está — mas para onde você vai. Em português, feito por quem já viveu isso.",
    url: "https://immigrei.com",
    siteName: "immigrei",
    locale: "pt_BR",
    type: "website",
  },
};

const pillars = [
  {
    title: "Caminho completo",
    text: "Não só onde seu caso está — mas para onde você vai e o que é preciso em cada etapa.",
  },
  {
    title: "No seu idioma",
    text: "Português primeiro. Sem juridiquês, sem respostas contraditórias do Google.",
  },
  {
    title: "Rede de confiança",
    text: "Profissionais verificados a um toque de distância, quando você estiver pronto.",
  },
];

const trustChips = [
  {
    title: "Criptografado, sempre",
    text: "Seus dados são criptografados em trânsito e em repouso.",
  },
  {
    title: "Só você acessa os seus dados",
    text: "Isolamento por usuário garantido no nível do banco de dados.",
  },
  {
    title: "Status oficial, direto da fonte",
    text: "Consultamos a USCIS diretamente — nunca enviamos ou assinamos nada em seu nome.",
  },
];

const faq = [
  {
    q: "A immigrei é um escritório de advocacia?",
    a: "Não — e isso é proposital. A immigrei organiza a informação da sua jornada: onde seu caso está, o que vem a seguir e o que é preciso em cada etapa, tudo em português. Não damos aconselhamento jurídico. Quando o seu caso pedir um profissional, conectamos você a advogados e consultores verificados.",
  },
  {
    q: "Quanto custa usar a immigrei?",
    a: "Tem plano gratuito — você já começa a organizar a sua jornada sem pagar nada. Se quiser mais profundidade (acompanhamento de caso, cofre de documentos, rede de profissionais), os planos pagos começam em poucos dólares por mês.",
  },
  {
    q: "Como sei que isso não é golpe?",
    a: "Entendemos a desconfiança — o mercado de imigração está cheio disso. Somos dois brasileiros que passamos pelo mesmo processo e construímos a immigrei porque sentimos a falta dela. Seus dados são criptografados, isolados por usuário, e o status do seu caso vem direto da fonte oficial (USCIS) — nunca inventado.",
  },
  {
    q: "Ainda preciso de um advogado?",
    a: "Depende do seu caso — e é exatamente isso que a immigrei ajuda você a entender. Para muitas situações, clareza e organização já resolvem. Quando o caso pede um profissional, conectamos você a alguém verificado, no momento certo.",
  },
  {
    q: "Funciona para o meu tipo de visto?",
    a: "Cobrimos os caminhos mais comuns de brasileiros nos EUA — de estudante (F-1, M-1) a trabalho (H-1B, O-1, L-1), negócios, green card e mais.",
  },
  {
    q: "É em português mesmo, ou só a interface?",
    a: "Tudo — as explicações, os próximos passos, o suporte. Sabemos que sua vida não deveria depender de entender juridiquês em inglês.",
  },
];

export default async function HomePage() {
  const { userId } = await auth();
  if (userId) redirect("/dashboard");

  return (
    <main className="min-h-screen bg-cream flex flex-col">
      <header className="flex items-center justify-between px-6 py-5">
        <Link href="/">
          <Logo variant="lockup" className="text-4xl" />
        </Link>
        <Link
          href="/sign-in"
          className="text-sm font-medium text-pine hover:text-pine-deep transition-colors"
        >
          Entrar
        </Link>
      </header>

      {/* Hero */}
      <section className="flex flex-col items-center text-center px-6 py-20">
        <Eyebrow className="mb-6">Construído por imigrantes, para imigrantes</Eyebrow>
        <SectionHeading as="h1" size="hero" className="mb-6 max-w-2xl">
          Sua jornada migratória nos EUA,{" "}
          <span className="text-pine">com clareza.</span>
        </SectionHeading>
        <p className="text-ink-soft text-lg md:text-xl max-w-xl mb-10 leading-relaxed">
          Não só onde você está — mas para onde você vai, o que precisa fazer e
          com quem pode contar.
        </p>
        <CtaButton href="/onboarding">Começar agora — é gratuito</CtaButton>
        <p className="text-ink-faint text-sm mt-4">
          Sem cartão de crédito. Leva menos de 5 minutos.
        </p>
      </section>

      {/* Founders / skin-in-the-game credibility */}
      <section className="px-6 pb-20">
        <div className="max-w-2xl mx-auto bg-pine-tint rounded-2xl p-8 text-center">
          <Eyebrow tone="pine" className="mb-3">
            Quem está construindo
          </Eyebrow>
          <p className="text-ink-soft text-base leading-relaxed mb-4">
            A immigrei nasceu de dois brasileiros —{" "}
            <strong className="text-ink">Cesar</strong>, que imigrou para a
            Austrália, e <strong className="text-ink">Felipe</strong>, para os
            Estados Unidos — que viveram na pele a falta de um mapa: formulário
            confuso, prazo apertado, e ligação de US$ 300 com advogado que
            terminava com mais dúvida do que resposta. Construímos a
            ferramenta que procuramos e não encontramos.
          </p>
          <div className="flex items-center justify-center gap-6 mb-4 text-sm text-ink-soft">
            <span>🇦🇺 Cesar — Austrália</span>
            <span>🇺🇸 Felipe — Estados Unidos</span>
          </div>
          <Link
            href="/nossa-historia"
            className="text-pine font-semibold underline underline-offset-4 hover:text-pine-deep transition-colors"
          >
            Leia a nossa história →
          </Link>
        </div>
      </section>

      {/* Trust / security */}
      <section className="px-6 pb-20">
        <div className="max-w-4xl mx-auto text-center">
          <SectionHeading size="subsection" className="mb-8">
            Seu caso é sensível. Tratamos assim.
          </SectionHeading>
          <div className="grid sm:grid-cols-3 gap-4 text-left mb-6">
            {trustChips.map((t) => (
              <div key={t.title} className="flex flex-col gap-1">
                <p className="text-ink font-bold text-sm">{t.title}</p>
                <p className="text-ink-soft text-sm leading-relaxed">{t.text}</p>
              </div>
            ))}
          </div>
          <Link
            href="/seguranca"
            className="text-pine font-semibold underline underline-offset-4 hover:text-pine-deep transition-colors text-sm"
          >
            Saiba mais sobre segurança →
          </Link>
        </div>
      </section>

      {/* Pillars */}
      <section className="px-6 pb-20">
        <div className="grid sm:grid-cols-3 gap-6 max-w-3xl mx-auto">
          {pillars.map((p) => (
            <Card key={p.title}>
              <h3 className="text-ink font-bold text-base mb-2">{p.title}</h3>
              <p className="text-ink-soft text-sm leading-relaxed">{p.text}</p>
            </Card>
          ))}
        </div>
      </section>

      {/* FAQ */}
      <section className="px-6 pb-20">
        <div className="max-w-2xl mx-auto">
          <SectionHeading size="section" className="mb-8 text-center">
            Perguntas frequentes
          </SectionHeading>
          <Faq items={faq} />
        </div>
      </section>

      {/* Final CTA */}
      <section className="px-6 pb-20 flex flex-col items-center text-center">
        <SectionHeading size="subsection" className="mb-4">
          Pronto para ver o seu caminho?
        </SectionHeading>
        <CtaButton href="/onboarding">Começar agora — é gratuito</CtaButton>
      </section>

      <Footer />
    </main>
  );
}
