import type { Metadata } from "next";
import Link from "next/link";
import Logo from "../components/Logo";
import Footer from "../components/Footer";
import LanguageToggle from "../components/LanguageToggle";

export const metadata: Metadata = {
  metadataBase: new URL("https://immigrei.com"),
  title: "Segurança — immigrei",
  description: "Como a immigrei protege seus dados e o status do seu caso.",
  alternates: {
    canonical: "/seguranca",
    languages: { "pt-BR": "/seguranca", en: "/seguranca/en" },
  },
};

const sections: { title: string; titleNode?: React.ReactNode; body: string[] }[] = [
  {
    title: "Criptografia em trânsito e em repouso",
    body: [
      "Todo o tráfego entre você e a immigrei é criptografado (HTTPS/TLS). Os dados armazenados no nosso banco também ficam criptografados em repouso.",
    ],
  },
  {
    title: "Acesso por usuário (Row-Level Security)",
    body: [
      "Cada usuário só acessa os próprios dados. Isso é imposto no nível do banco de dados (RLS no Supabase), não só na tela — nenhuma consulta consegue vazar dados de um usuário pra outro.",
    ],
  },
  {
    title: "Consulta de status junto à USCIS",
    body: [
      "Quando você adiciona um número de recibo em \"Meu Caso\", consultamos oficialmente a Case Status API da USCIS (programa Torch, developer.uscis.gov) via OAuth 2.0. Nunca simulamos ou inventamos um status — o que aparece vem direto da fonte oficial, e mostramos a data da última verificação.",
      "A immigrei apenas consulta o status do seu próprio caso. Não enviamos, assinamos nem submetemos nada em seu nome à USCIS — isso continua sendo algo entre você (ou seu advogado) e a agência.",
    ],
  },
  {
    title: "Limite de consultas",
    body: [
      "Para proteger o sistema da USCIS e o nosso, limitamos o número de verificações de status por usuário em um período curto. Isso é automático e raramente perceptível no uso normal.",
    ],
  },
  {
    title: "Autenticação",
    body: [
      "O login é processado pelo Clerk (login social ou e-mail), um provedor especializado em autenticação — a immigrei nunca armazena sua senha diretamente.",
    ],
  },
  {
    title: "Pagamentos",
    body: [
      "Pagamentos são processados pela Stripe. A immigrei nunca vê nem armazena o número do seu cartão.",
    ],
  },
  {
    title: "Rotação de credenciais",
    body: [
      "As credenciais que usamos para falar com sistemas oficiais (como a API da USCIS) são rotacionadas periodicamente e nunca ficam no código-fonte — apenas em variáveis de ambiente protegidas.",
    ],
  },
  {
    title: "Encontrou um bug de segurança?",
    titleNode: (
      <>
        Encontrou um <em>bug</em> de segurança?
      </>
    ),
    body: [
      "Se você identificar um problema de segurança, escreva para ola@immigrei.com. Levamos qualquer relato a sério e respondemos o mais rápido possível.",
    ],
  },
];

export default function SegurancaPage() {
  return (
    <main className="min-h-screen bg-cream">
      <header className="flex items-center justify-between px-6 py-6 max-w-3xl mx-auto">
        <Link href="/" aria-label="immigrei — início">
          <Logo variant="lockup" className="text-4xl" />
        </Link>
        <LanguageToggle ptHref="/seguranca" enHref="/seguranca/en" lang="pt" />
      </header>
      <article className="max-w-2xl mx-auto px-6 pb-20">
        <h1
          className="text-3xl md:text-4xl font-semibold text-ink mb-2"
          style={{ fontFamily: "var(--font-display)" }}
        >
          Segurança
        </h1>
        <p className="text-ink-soft text-base leading-relaxed mb-10">
          Dados de imigração são sensíveis. Isto é o que fazemos, na prática,
          pra proteger os seus.
        </p>
        {sections.map((s) => (
          <section key={s.title} className="mb-8">
            <h2 className="text-ink font-bold text-lg mb-3">{s.titleNode ?? s.title}</h2>
            {s.body.map((p) => (
              <p key={p.slice(0, 40)} className="text-ink-soft text-base leading-relaxed mb-3">
                {p}
              </p>
            ))}
          </section>
        ))}
        <p className="text-ink-faint text-sm mt-10">
          Veja também a nossa{" "}
          <Link href="/privacidade" className="text-pine underline underline-offset-4">
            Política de Privacidade
          </Link>
          .
        </p>
      </article>
      <Footer />
    </main>
  );
}
