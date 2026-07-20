import type { Metadata } from "next";
import Link from "next/link";
import WaitlistForm from "../em-breve/WaitlistForm";
import Logo from "../components/Logo";

export const metadata: Metadata = {
  metadataBase: new URL("https://immigrei.com"),
  title: "Nossa história — immigrei",
  description:
    "Dois brasileiros, dois países, a mesma pergunta: qual é o meu próximo passo? A história de por que a immigrei existe.",
  alternates: { canonical: "/nossa-historia" },
  openGraph: {
    title: "Nossa história — immigrei",
    description:
      "Dois brasileiros, dois países, a mesma pergunta: qual é o meu próximo passo?",
    url: "https://immigrei.com/nossa-historia",
    siteName: "immigrei",
    locale: "pt_BR",
    type: "article",
  },
};

const valores = [
  {
    title: "Português primeiro",
    text: "Sua vida não deveria depender de entender juridiquês em inglês. Aqui, o idioma nunca é barreira.",
  },
  {
    title: "Sem enrolação",
    text: "Traduzimos complexidade em passos claros. O próximo passo é sempre visível.",
  },
  {
    title: "Quem já viveu, entende",
    text: "Não simulamos empatia — a carregamos. Cada tela foi pensada por quem já sentiu esse frio na barriga.",
  },
  {
    title: "Ajuda de confiança",
    text: "Quando você precisar de um profissional, ele estará a um toque — verificado, transparente, nos seus termos.",
  },
];

export default function NossaHistoriaPage() {
  return (
    <main className="min-h-screen bg-cream">
      <header className="flex items-center justify-between px-6 py-6 max-w-3xl mx-auto">
        <Link href="/" aria-label="immigrei — início">
          <Logo variant="wordmark" className="text-2xl" />
        </Link>
      </header>

      <article className="max-w-2xl mx-auto px-6 pb-20">
        <p className="text-xs font-bold uppercase tracking-widest text-amber mb-6 mt-8">
          Nossa história
        </p>
        <h1
          className="text-4xl md:text-5xl font-semibold text-ink leading-tight mb-10"
          style={{ fontFamily: "var(--font-display)" }}
        >
          Dois brasileiros. Dois países.{" "}
          <span className="text-pine">A mesma pergunta.</span>
        </h1>

        <div className="space-y-6 text-ink-soft text-lg leading-relaxed">
          <p>
            O <strong className="text-ink">Cesar</strong> foi para a Austrália.
            O <strong className="text-ink">Felipe</strong>, para os Estados
            Unidos. Dois caminhos diferentes, a mesma experiência: a
            desorientação de chegar num lugar novo e descobrir que ninguém tem
            um mapa para o que vem a seguir.
          </p>
          <p>
            Renovação de visto. Protocolo de prorrogação. Portais do governo
            que parecem feitos para confundir. O Google devolvendo respostas
            contraditórias. Advogados cobrando US$ 300 por uma ligação de 15
            minutos que termina com mais dúvidas do que começou. E aquela
            pergunta que não sai da cabeça, de dia e de madrugada:
          </p>
          <p
            className="text-2xl text-pine font-semibold py-2"
            style={{ fontFamily: "var(--font-display)" }}
          >
            &ldquo;Qual é o meu próximo passo?&rdquo;
          </p>
          <p>
            Em algum momento, caiu a ficha: o problema não era falta de
            informação. Era falta de <strong className="text-ink">caminho</strong>.
            Os apps que existem mostram um status e param aí. Ninguém te mostra
            onde você está, para onde vai, o que precisa em cada etapa — e quem
            pode ajudar quando chegar a hora.
          </p>
          <p>
            Então construímos a ferramenta que procuramos e não encontramos.
            Não uma barra de status. Não um site de indicação de advogados. Um
            companheiro de jornada completo — que fala português, conhece o seu
            caso e mostra o caminho inteiro.
          </p>
          <p>
            A immigrei não foi construída de fora para dentro. Foi construída
            de dentro da jornada.
          </p>
        </div>

        <h2
          className="text-2xl md:text-3xl font-semibold text-ink mt-14 mb-6"
          style={{ fontFamily: "var(--font-display)" }}
        >
          No que a gente acredita
        </h2>
        <div className="grid sm:grid-cols-2 gap-4">
          {valores.map((v) => (
            <div
              key={v.title}
              className="bg-cream-2 border border-pine-tint rounded-2xl p-6"
            >
              <h3 className="text-ink font-bold text-base mb-2">{v.title}</h3>
              <p className="text-ink-soft text-sm leading-relaxed">{v.text}</p>
            </div>
          ))}
        </div>

        <div className="mt-14 bg-pine rounded-2xl p-8 text-center flex flex-col items-center">
          <h2
            className="text-2xl md:text-3xl font-semibold text-cream-2 mb-3"
            style={{ fontFamily: "var(--font-display)" }}
          >
            Sua jornada merece um mapa.
          </h2>
          <p className="text-pine-tint text-base mb-6 max-w-md">
            Estamos construindo a immigrei agora. Entre na lista e seja avisado
            em primeira mão.
          </p>
          <WaitlistForm />
        </div>

        <p className="text-center text-ink-faint text-xs mt-10 leading-relaxed">
          © {new Date().getFullYear()} immigrei. Não somos um escritório de
          advocacia.
        </p>
      </article>
    </main>
  );
}
