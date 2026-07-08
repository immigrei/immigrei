import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  metadataBase: new URL("https://immigrei.com"),
  title: "Termos de Uso — Immigrei",
  description: "Termos de uso da plataforma Immigrei.",
  alternates: { canonical: "/termos" },
};

// Minuta para revisão do advogado parceiro antes do lançamento pago.
const LAST_UPDATED = "7 de julho de 2026";

const sections: { title: string; body: string[] }[] = [
  {
    title: "1. O que a Immigrei é — e o que não é",
    body: [
      "A Immigrei é uma plataforma de tecnologia que organiza informação pública sobre processos de imigração nos EUA: mostra etapas, requisitos objetivos, prazos e documentos, e permite acompanhar o andamento do seu caso junto a fontes oficiais (USCIS, Departamento de Estado, consulados).",
      "A Immigrei NÃO é um escritório de advocacia, não presta aconselhamento jurídico e não substitui a orientação de um advogado licenciado. A plataforma nunca recomenda qual caminho migratório você deve seguir, não avalia o mérito do seu caso e não prevê resultados. Validações exibidas no app verificam apenas requisitos técnicos objetivos publicados pelas agências federais americanas, sempre com citação da fonte oficial.",
      "Quando o app indicar que algo \"requer análise individual\", isso significa que a questão depende de julgamento jurídico — procure um profissional licenciado. A Immigrei pode conectar você a profissionais independentes verificados; eles não são empregados nem representantes da Immigrei, e a relação profissional é estabelecida diretamente entre você e eles.",
    ],
  },
  {
    title: "2. Sua conta",
    body: [
      "Você é responsável pela veracidade das informações que insere e por manter o acesso à sua conta seguro. A Immigrei processa os fatos que VOCÊ declara; resultados baseados em dados incorretos serão incorretos.",
      "Você deve ter pelo menos 18 anos para criar uma conta.",
    ],
  },
  {
    title: "3. Planos e pagamento",
    body: [
      "A Immigrei oferece um plano gratuito e planos pagos por assinatura, processados pela Stripe. Você pode cancelar a qualquer momento; o acesso pago permanece até o fim do período já pago. Valores e benefícios de cada plano são os exibidos na página de planos no momento da contratação.",
    ],
  },
  {
    title: "4. Uso aceitável",
    body: [
      "Você concorda em não usar a plataforma para fins ilegais, não tentar acessar dados de outros usuários, não fazer engenharia reversa e não sobrecarregar deliberadamente o serviço.",
    ],
  },
  {
    title: "5. Conteúdo informativo e limitação de responsabilidade",
    body: [
      "O conteúdo da Immigrei é baseado em fontes oficiais e revisado com cuidado, mas regras de imigração mudam com frequência e cada caso tem particularidades. O serviço é fornecido \"como está\", sem garantia de completude, atualidade ou adequação ao seu caso específico.",
      "Na máxima extensão permitida em lei, a Immigrei não se responsabiliza por decisões tomadas com base no conteúdo da plataforma, por decisões de agências governamentais sobre o seu caso, nem por danos indiretos. Nada nestes termos limita responsabilidades que não possam ser limitadas por lei.",
    ],
  },
  {
    title: "6. Encerramento e alterações",
    body: [
      "Você pode encerrar sua conta a qualquer momento e solicitar a exclusão dos seus dados (ver Política de Privacidade). Podemos alterar estes termos; mudanças relevantes serão comunicadas por e-mail com antecedência razoável.",
    ],
  },
  {
    title: "7. Contato",
    body: [
      "Dúvidas sobre estes termos: visaemdia2026@gmail.com (e-mail oficial da Immigrei durante o período de lançamento).",
    ],
  },
];

export default function TermosPage() {
  return (
    <main className="min-h-screen bg-cream">
      <header className="flex items-center px-6 py-6 max-w-3xl mx-auto">
        <Link
          href="/"
          className="text-2xl font-semibold text-pine"
          style={{ fontFamily: "var(--font-display)" }}
        >
          Immigrei
        </Link>
      </header>
      <article className="max-w-2xl mx-auto px-6 pb-20">
        <h1
          className="text-3xl md:text-4xl font-semibold text-ink mb-2"
          style={{ fontFamily: "var(--font-display)" }}
        >
          Termos de Uso
        </h1>
        <p className="text-ink-faint text-sm mb-10">
          Última atualização: {LAST_UPDATED}
        </p>
        {sections.map((s) => (
          <section key={s.title} className="mb-8">
            <h2 className="text-ink font-bold text-lg mb-3">{s.title}</h2>
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
    </main>
  );
}
