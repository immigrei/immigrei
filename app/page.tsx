import type { Metadata } from "next";
import Link from "next/link";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import Logo from "./components/Logo";
import Eyebrow from "./components/Eyebrow";
import SectionHeading from "./components/SectionHeading";
import Card from "./components/Card";
import CtaButton from "./components/CtaButton";
import Faq, { type FaqItem } from "./components/Faq";
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

function IconPath() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="5" cy="19" r="1.6" fill="currentColor" opacity="0.35" />
      <circle cx="10" cy="14" r="1.6" fill="currentColor" opacity="0.6" />
      <circle cx="15" cy="9" r="1.8" fill="currentColor" />
      <path d="M15 5h4v4" stroke="currentColor" strokeWidth="1.8" />
    </svg>
  );
}

function IconSpeech() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 5h16v10H9l-4 4v-4H4z" stroke="currentColor" strokeWidth="1.8" />
    </svg>
  );
}

function IconPeople() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="8.5" cy="8" r="3" stroke="currentColor" strokeWidth="1.8" />
      <path d="M2.5 19c0-3.3 2.7-5.5 6-5.5s6 2.2 6 5.5" stroke="currentColor" strokeWidth="1.8" />
      <circle cx="17.5" cy="9" r="2.3" stroke="currentColor" strokeWidth="1.8" opacity="0.55" />
      <path d="M15.2 13.7c2.5.3 4.3 2.1 4.3 5" stroke="currentColor" strokeWidth="1.8" opacity="0.55" />
    </svg>
  );
}

// As duas respostas de q_location, a primeira pergunta do questionário
// (ver questionMap em app/onboarding/page.tsx). Os valores precisam bater
// com as opções de lá — é o que o param ?q_location= carrega.
const startOptions = [
  { value: "in_us", flag: "🇺🇸", label: "Estou nos EUA" },
  { value: "outside", flag: "🌍", label: "Estou fora dos EUA" },
];

const pillars = [
  {
    title: "Caminho completo",
    text: "Não só onde seu caso está — mas para onde você vai e o que é preciso em cada etapa.",
    icon: <IconPath />,
  },
  {
    title: "No seu idioma",
    text: "Português primeiro. Sem juridiquês, sem respostas contraditórias do Google.",
    icon: <IconSpeech />,
  },
  {
    title: "Comunidade real",
    text: "Relatos de brasileiros que já passaram pelo que você está vivendo agora.",
    icon: <IconPeople />,
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

// Os domínios oficiais realmente citados nas 15 páginas de visto (ver
// fontesOficiais em lib/vistoPages.ts e a whitelist em content/leis/fontes.md).
// Texto, nunca logo/selo: citar uma fonte é fato verificável, exibir o brasão
// de uma agência federal sugere vínculo que não existe — e o selo do
// USCIS/DHS é protegido por lei.
const fontesOficiais = [
  "uscis.gov",
  "travel.state.gov",
  "ecfr.gov",
  "cbp.gov",
  "studyinthestates.dhs.gov",
];

// Contraste com a experiência que a pessoa já teve — não com produtos
// nomeados. A coluna da esquerda descreve a vivência do imigrante (o que ele
// reconhece de imediato), não afirmações sobre concorrentes: claim sobre
// preço/idioma de marca alheia envelhece e vira risco jurídico. O lastro da
// pesquisa está em docs/competitive-intel (SimpleCitizen, mai/2026).
const comparisons = [
  {
    antes: "Você abre o site do USCIS, lê “Case Was Received” em inglês e continua sem saber o que isso significa pra você.",
    depois: "O mesmo status, explicado em português — o que é, o que significa no seu caso e o que costuma vir depois.",
  },
  {
    antes: "Você descobre que existia um prazo depois que ele já passou.",
    depois: "Avisos dos seus prazos antes, não depois — I-94, extensões e mudanças de status.",
  },
  {
    antes: "US$ 300 por 15 minutos com advogado só pra entender o básico do seu próprio caso.",
    depois: "O básico você entende sozinho, em português. O advogado entra quando o caso realmente pede.",
  },
  {
    antes: "Os apps mostram um status e param aí. Você segue sem saber qual é o próximo passo.",
    depois: "A jornada inteira: onde você está, para onde vai e o que preparar em cada etapa.",
  },
  {
    antes: "Centenas de dólares por aplicação, cobrados de uma vez.",
    depois: "Rastreamento do seu caso grátis para sempre. A jornada completa por US$ 29,90/mês.",
  },
];

const faq: FaqItem[] = [
  {
    q: "A immigrei é um escritório de advocacia?",
    a: "Não — e isso é proposital. A immigrei organiza a sua jornada: onde seu caso está, o que vem a seguir e o que é preciso em cada etapa, tudo em português. Não damos aconselhamento jurídico — isso continua sendo trabalho de advogado.",
  },
  {
    q: "Quanto custa usar a immigrei?",
    a: (
      <>
        O plano <strong className="text-ink">Retrato</strong> é gratuito para
        sempre: rastreamento do seu caso em tempo real, alertas de status e
        prazos — sem pagar nada. Se quiser ver para onde a sua jornada vai
        (kits por tipo de visto, cofre de documentos, comunidade), isso é a{" "}
        <strong className="text-ink">Jornada</strong>, nosso único plano
        pago.{" "}
        <Link href="/planos" className="text-pine underline underline-offset-4">
          Veja os planos →
        </Link>
      </>
    ),
    aText:
      "O plano Retrato é gratuito para sempre: rastreamento do seu caso em tempo real, alertas de status e prazos — sem pagar nada. Se quiser ver para onde a sua jornada vai (kits por tipo de visto, cofre de documentos, comunidade), isso é a Jornada, nosso único plano pago.",
  },
  {
    q: "Já uso um app de acompanhamento de caso. Qual é a diferença?",
    a: "Acompanhar o status é o começo, não o fim — e isso a immigrei faz de graça, no plano Retrato. A diferença está no que vem depois: em vez de parar no status, mostramos para onde aquele caso pode ir, o que preparar em cada etapa e quais prazos vêm pela frente. Tudo em português, do aviso ao formulário.",
  },
  {
    q: "Como sei que isso não é golpe?",
    a: "Entendemos a desconfiança — o mercado de imigração está cheio disso. A immigrei nasceu de imigrantes brasileiros que passaram pelo mesmo processo e sentiram a falta dela. Seus dados são criptografados, isolados por usuário, e o status do seu caso vem direto da fonte oficial (USCIS) — nunca inventado.",
  },
  {
    q: "Ainda preciso de um advogado?",
    a: "Essa decisão continua sendo sua, com base em orientação jurídica licenciada — a immigrei não avalia se o seu caso precisa de um advogado. O que fazemos é organizar onde você está e o que vem a seguir, para que uma eventual conversa com um profissional seja mais rápida, mais barata e com as perguntas certas na mão.",
  },
  {
    q: "Funciona para o meu tipo de visto?",
    a: "Provavelmente sim. Hoje cobrimos os caminhos mais comuns de brasileiros nos EUA: estudante (F-1, M-1), trabalho (H-1B, O-1, L-1), negócios (E-1, E-2), ajuste de status, extensões e green card. Se o seu ainda não estiver na lista, avisamos assim que adicionarmos — e você já pode começar pelo caminho geral, que serve de base para qualquer visto.",
  },
  {
    q: "“Em português” é só a interface, ou é tudo mesmo?",
    a: "É tudo. As explicações, os próximos passos, o suporte — pensado em português desde o início, não traduzido em cima da hora. Sua vida não deveria depender de entender juridiquês em inglês.",
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
      <section className="flex flex-col items-center text-center px-6 pt-10 pb-16 sm:pt-14 sm:pb-20">
        <Eyebrow className="mb-5">Construído por imigrantes, para imigrantes</Eyebrow>
        <SectionHeading as="h1" size="hero" className="mb-5 max-w-2xl">
          Sua jornada migratória nos EUA,{" "}
          <span className="text-pine">com clareza.</span>
        </SectionHeading>
        <p className="text-ink-soft text-lg md:text-xl max-w-xl mb-10 leading-relaxed">
          Não só onde você está — mas para onde você vai, o que precisa fazer e
          com quem pode contar.
        </p>

        {/* A primeira pergunta do questionário, trazida para a dobra. Escolher
            aqui já responde "Onde você está agora?" e pula a tela de
            boas-vindas — ver ?q_location= em app/onboarding/page.tsx. */}
        <div className="w-full max-w-md">
          <p className="text-ink font-semibold text-base mb-3">
            Onde você está agora?
          </p>
          <div className="grid sm:grid-cols-2 gap-3">
            {startOptions.map((o) => (
              <Link
                key={o.value}
                href={`/onboarding?q_location=${o.value}`}
                className="flex items-center justify-center gap-2.5 bg-cream-2 border-2 border-pine text-ink font-semibold rounded-xl px-5 py-4 hover:bg-pine hover:text-cream transition-colors"
              >
                <span aria-hidden className="text-xl">
                  {o.flag}
                </span>
                {o.label}
              </Link>
            ))}
          </div>
          <p className="text-ink-faint text-sm mt-4">
            Gratuito, sem cartão de crédito. Leva menos de 2 minutos.
          </p>
        </div>
      </section>

      {/* Faixa de autoridade — o equivalente honesto ao mural de logos: não
          temos clientes para exibir, mas temos a procedência do conteúdo,
          que é o que essa pessoa precisa confiar. */}
      <section className="bg-cream-2 border-y border-pine-tint px-6 py-8 mb-20">
        <div className="max-w-3xl mx-auto text-center">
          <p className="text-ink-soft text-sm mb-5 max-w-lg mx-auto leading-relaxed">
            Cada informação aqui vem de uma fonte oficial do governo americano —
            e a gente mostra qual, em cada página, com a data da última
            verificação.
          </p>
          <ul className="flex flex-wrap items-center justify-center gap-2.5">
            {fontesOficiais.map((f) => (
              <li
                key={f}
                className="flex items-center gap-2 rounded-full border border-pine-tint bg-pine-tint/40 px-4 py-2 text-pine text-sm md:text-base font-bold tracking-tight"
              >
                <span
                  aria-hidden
                  className="h-1.5 w-1.5 rounded-full bg-sage shrink-0"
                />
                {f}
              </li>
            ))}
          </ul>
          <p className="text-ink-soft text-sm mt-6">
            Já tem visto? Veja nossos{" "}
            <Link
              href="/documentos/guias"
              className="text-pine font-semibold underline underline-offset-4 hover:text-pine-deep transition-colors"
            >
              guias de integração nos EUA
            </Link>{" "}
            — SSN, carteira de motorista, crédito, ITIN e mais.
          </p>
        </div>
      </section>

      {/* Founders / skin-in-the-game credibility */}
      <section className="px-6 pb-20">
        <div className="max-w-2xl mx-auto bg-pine-tint rounded-2xl p-8 text-center">
          <Eyebrow tone="pine" className="mb-3">
            Quem está construindo
          </Eyebrow>
          <p className="text-ink-soft text-base leading-relaxed mb-4">
            A immigrei nasceu de dois amigos brasileiros — um imigrou para a
            Austrália, o outro para os Estados Unidos — que viveram na pele a
            falta de um mapa: formulário confuso, prazo apertado, e ligação de
            US$ 300 com advogado que terminava com mais dúvida do que
            resposta. Construímos a ferramenta que procuramos e não
            encontramos.
          </p>
          <div className="flex items-center justify-center gap-6 mb-4 text-sm text-ink-soft">
            <span>🇦🇺 Um de nós, na Austrália</span>
            <span>🇺🇸 O outro, nos Estados Unidos</span>
          </div>
          <Link
            href="/nossa-historia"
            className="text-pine font-semibold underline underline-offset-4 hover:text-pine-deep transition-colors"
          >
            Leia a nossa história →
          </Link>
        </div>
      </section>

      {/* Diferenciação — responde "por que não continuar como estou?" logo
          depois da credibilidade dos fundadores, que é quando a objeção
          aparece. */}
      <section className="px-6 pb-20">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-10">
            <Eyebrow className="mb-3">Por que a immigrei</Eyebrow>
            <SectionHeading size="section" className="mb-3">
              Você já tentou resolver isso sozinho.
            </SectionHeading>
            <p className="text-ink-soft text-base leading-relaxed max-w-xl mx-auto">
              A gente sabe como costuma ser — passamos por isso antes de
              construir a immigrei.
            </p>
          </div>

          {/* Cabeçalho das colunas: só no desktop. No celular cada linha
              carrega o próprio rótulo, logo abaixo. */}
          <div className="hidden sm:grid sm:grid-cols-2 gap-4 mb-3 px-1">
            <p className="text-xs font-bold uppercase tracking-widest text-ink-faint">
              Como costuma ser
            </p>
            <p className="text-xs font-bold uppercase tracking-widest text-pine">
              Com a immigrei
            </p>
          </div>

          <ul className="space-y-3">
            {comparisons.map((c) => (
              <li key={c.antes} className="grid sm:grid-cols-2 gap-3">
                <div className="rounded-2xl border border-ink/10 bg-cream px-5 py-4">
                  <p className="sm:hidden text-[11px] font-bold uppercase tracking-widest text-ink-faint mb-1.5">
                    Como costuma ser
                  </p>
                  <p className="text-ink-soft text-sm leading-relaxed">{c.antes}</p>
                </div>
                <div className="rounded-2xl border border-pine-tint bg-cream-2 px-5 py-4">
                  <p className="sm:hidden text-[11px] font-bold uppercase tracking-widest text-pine mb-1.5">
                    Com a immigrei
                  </p>
                  <p className="text-ink text-sm leading-relaxed font-medium">
                    {c.depois}
                  </p>
                </div>
              </li>
            ))}
          </ul>
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
            <Card key={p.title} icon={p.icon}>
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
