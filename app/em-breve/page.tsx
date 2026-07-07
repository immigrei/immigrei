import type { Metadata } from "next";
import Link from "next/link";
import WaitlistForm from "./WaitlistForm";

export const metadata: Metadata = {
  metadataBase: new URL("https://immigrei.com"),
  title: "Immigrei — Sua jornada migratória nos EUA, com clareza.",
  description:
    "O companheiro completo da sua jornada de imigração nos EUA. Em português, construído por imigrantes, para imigrantes. Em breve.",
  alternates: { canonical: "/" },
  openGraph: {
    title: "Immigrei — Sua jornada migratória nos EUA, com clareza.",
    description:
      "Não só onde seu caso está — mas para onde você vai. Em português, feito por quem já viveu isso. Entre na lista de espera.",
    url: "https://immigrei.com",
    siteName: "Immigrei",
    locale: "pt_BR",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Immigrei — Sua jornada migratória nos EUA, com clareza.",
    description:
      "Não só onde seu caso está — mas para onde você vai. Em português, feito por quem já viveu isso.",
  },
};

const faq = [
  {
    q: "A Immigrei é um escritório de advocacia?",
    a: "Não — e isso é proposital. A Immigrei organiza a informação da sua jornada: onde seu caso está, o que vem a seguir e o que é preciso em cada etapa, tudo em português. Não damos aconselhamento jurídico. Quando o seu caso pedir um profissional, conectamos você a advogados e consultores verificados — na hora certa, nos seus termos.",
  },
  {
    q: "Meus dados estão seguros? Vocês compartilham com alguém?",
    a: "Seus dados são criptografados e nunca são vendidos ou compartilhados com terceiros — nem com o governo. Sabemos que confiança é tudo em um momento como o atual. Sem sigilo não existe Immigrei; esse é o nosso compromisso número um.",
  },
  {
    q: "Quanto vai custar?",
    a: "A Immigrei terá um plano gratuito — você poderá começar a organizar a sua jornada sem pagar nada. Os detalhes dos planos completos serão anunciados no lançamento, e quem estiver na lista de espera fica sabendo primeiro (com condições especiais).",
  },
  {
    q: "Quando lança?",
    a: "Estamos construindo agora, com atualizações toda semana. Quem está na lista de espera recebe acesso antecipado antes da abertura ao público — entre na lista e acompanhe de perto.",
  },
  {
    q: "Serve para o meu tipo de visto?",
    a: "Começamos pelos caminhos mais comuns de brasileiros nos EUA: turista (B1/B2), estudante (F-1/M-1), mudança de status e acompanhamento de casos no USCIS. A partir daí, expandimos para mais categorias — conte na lista de espera qual é o seu momento.",
  },
  {
    q: "Já uso um app de tracking. Qual a diferença?",
    a: "Os apps que existem mostram um status — em inglês — e param aí. A Immigrei mostra a jornada completa: onde você está, para onde vai, o que precisa em cada etapa e quem pode ajudar. Em português, feito por quem já viveu isso.",
  },
  {
    q: "Meu status está vencendo (ou vencido). A Immigrei é para mim?",
    a: "Sim — e sem julgamento. Acreditamos que informação clara é ainda mais importante para quem está em um momento delicado. A Immigrei ajuda você a entender sua situação e as opções que existem, com sigilo total, e a encontrar ajuda profissional de confiança quando você decidir.",
  },
  {
    q: "Ainda estou no Brasil. Posso usar?",
    a: "Pode — e planejar antes de partir é o melhor momento. A Immigrei vai mostrar os caminhos possíveis e o que preparar desde já.",
  },
];

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

export default function EmBrevePage() {
  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faq.map((item) => ({
      "@type": "Question",
      name: item.q,
      acceptedAnswer: { "@type": "Answer", text: item.a },
    })),
  };

  return (
    <main className="min-h-screen bg-cream flex flex-col">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />
      <header className="flex items-center justify-center px-6 py-6">
        <span
          className="text-2xl font-semibold text-pine"
          style={{ fontFamily: "var(--font-display)" }}
        >
          Immigrei
        </span>
      </header>

      <section className="flex-1 flex flex-col items-center justify-center px-6 text-center py-16">
        <p className="text-xs font-bold uppercase tracking-widest text-amber mb-6">
          Construído por imigrantes, para imigrantes
        </p>
        <h1
          className="text-5xl md:text-6xl font-semibold text-ink leading-tight mb-6 max-w-2xl"
          style={{ fontFamily: "var(--font-display)" }}
        >
          Sua jornada migratória nos EUA,{" "}
          <span className="text-pine">com clareza.</span>
        </h1>
        <p className="text-ink-soft text-lg md:text-xl max-w-xl mb-10 leading-relaxed">
          Estamos construindo o companheiro completo da sua jornada de
          imigração — em português, feito por quem já viveu isso. Deixe seu
          e-mail e seja avisado em primeira mão.
        </p>

        <WaitlistForm />

        <div className="grid sm:grid-cols-3 gap-6 max-w-3xl mt-16 text-left">
          {pillars.map((p) => (
            <div key={p.title} className="bg-cream-2 border border-pine-tint rounded-2xl p-6">
              <h3 className="text-ink font-bold text-base mb-2">{p.title}</h3>
              <p className="text-ink-soft text-sm leading-relaxed">{p.text}</p>
            </div>
          ))}
        </div>

        {/* Pain — voice of customer */}
        <div className="max-w-2xl mt-20 text-center">
          <h2
            className="text-2xl md:text-3xl font-semibold text-ink mb-6"
            style={{ fontFamily: "var(--font-display)" }}
          >
            Você conhece essas perguntas de madrugada?
          </h2>
          <div className="space-y-3 text-left">
            {[
              "“Onde meu caso realmente está?”",
              "“O que vem a seguir — e quais são minhas opções?”",
              "“Preciso mesmo pagar US$ 300 por 15 minutos com um advogado só para entender isso?”",
            ].map((q) => (
              <p
                key={q}
                className="bg-cream-2 border border-pine-tint rounded-xl px-5 py-4 text-ink-soft text-base italic"
              >
                {q}
              </p>
            ))}
          </div>
          <p className="text-ink text-lg mt-6 font-medium">
            A Immigrei existe para responder as três — em português, sem
            juridiquês.
          </p>
        </div>

        {/* Founders / credibility */}
        <div className="max-w-2xl mt-16 bg-pine-tint rounded-2xl p-8 text-center">
          <p className="text-xs font-bold uppercase tracking-widest text-pine mb-3">
            Quem está construindo
          </p>
          <p className="text-ink-soft text-base leading-relaxed mb-4">
            A Immigrei nasceu de dois brasileiros — <strong className="text-ink">Cesar</strong>,
            que imigrou para a Austrália, e <strong className="text-ink">Felipe</strong>,
            para os EUA — que viveram na pele a falta de um mapa. Construímos a
            ferramenta que procuramos e não encontramos.
          </p>
          <Link
            href="/nossa-historia"
            className="text-pine font-semibold underline underline-offset-4 hover:text-pine-deep transition-colors"
          >
            Leia a nossa história →
          </Link>
        </div>

        {/* FAQ */}
        <div className="max-w-2xl w-full mt-20 text-left">
          <h2
            className="text-2xl md:text-3xl font-semibold text-ink mb-6 text-center"
            style={{ fontFamily: "var(--font-display)" }}
          >
            Perguntas frequentes
          </h2>
          <div className="space-y-3">
            {faq.map((item) => (
              <details
                key={item.q}
                className="group bg-cream-2 border border-pine-tint rounded-xl px-5 py-4"
              >
                <summary className="cursor-pointer list-none flex items-center justify-between gap-4 text-ink font-semibold text-base">
                  {item.q}
                  <span className="text-pine transition-transform group-open:rotate-45 text-xl leading-none">
                    +
                  </span>
                </summary>
                <p className="text-ink-soft text-sm leading-relaxed mt-3">
                  {item.a}
                </p>
              </details>
            ))}
          </div>
        </div>

        {/* Final CTA */}
        <div className="max-w-md w-full mt-16 flex flex-col items-center">
          <h2
            className="text-2xl font-semibold text-ink mb-4 text-center"
            style={{ fontFamily: "var(--font-display)" }}
          >
            Seja avisado em primeira mão.
          </h2>
          <WaitlistForm />
        </div>
      </section>

      <footer className="text-center px-6 py-8 text-ink-faint text-xs leading-relaxed">
        <p>Imigrando com clareza. Em breve.</p>
        <p className="mt-1">© {new Date().getFullYear()} Immigrei. Não somos um escritório de advocacia.</p>
        <p className="mt-1">
          <Link href="/termos" className="underline underline-offset-2">Termos de Uso</Link>
          {" · "}
          <Link href="/privacidade" className="underline underline-offset-2">Privacidade</Link>
        </p>
      </footer>
    </main>
  );
}
