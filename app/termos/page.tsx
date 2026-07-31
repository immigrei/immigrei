import type { Metadata } from "next";
import Link from "next/link";
import Logo from "../components/Logo";

export const metadata: Metadata = {
  metadataBase: new URL("https://immigrei.com"),
  title: "Termos de Uso — immigrei",
  description: "Termos de uso da plataforma immigrei.",
  alternates: { canonical: "/termos" },
};

// Minuta para revisão do advogado parceiro antes do lançamento pago.
// Mesclado em 31 jul 2026: base completa da revisão do Felipe (teto de
// responsabilidade, propriedade intelectual, conteúdo da comunidade,
// profissionais parceiros, reembolso, foro) + a adição de compliance
// USCIS do César (branch feat/uscis-compliance-landing-page, commit
// 8f00ff8) — consentimento ativo em vez de aviso passivo na seção 6.
const LAST_UPDATED = "31 de julho de 2026";

const sections: { title: string; body: string[] }[] = [
  {
    title: "1. O que a immigrei é — e o que não é",
    body: [
      "A immigrei é uma plataforma de tecnologia que organiza informação pública sobre processos de imigração nos EUA: mostra etapas, requisitos objetivos, prazos e documentos, e permite acompanhar o andamento do seu caso junto a fontes oficiais (USCIS, Departamento de Estado, consulados).",
      "A immigrei NÃO é um escritório de advocacia, não presta aconselhamento jurídico e não substitui a orientação de um advogado licenciado. A plataforma nunca recomenda qual caminho migratório você deve seguir, não avalia o mérito do seu caso e não prevê resultados. Validações exibidas no app verificam apenas requisitos técnicos objetivos publicados pelas agências federais americanas, sempre com citação da fonte oficial.",
      "Quando o app indicar que algo \"requer análise individual\", isso significa que a questão depende de julgamento jurídico — procure um profissional licenciado. A immigrei pode conectar você a profissionais independentes verificados; eles não são empregados nem representantes da immigrei, e a relação profissional é estabelecida diretamente entre você e eles.",
      "A immigrei é construída e operada por uma equipe de tecnologia — não temos advogados no quadro societário nem no time. Não damos, e não temos capacidade de dar, aconselhamento jurídico em nenhuma circunstância; nosso trabalho é organizar informação pública e construir as ferramentas para você usá-la, nada além disso.",
    ],
  },
  {
    title: "2. Sua conta",
    body: [
      "Você é responsável pela veracidade das informações que insere e por manter o acesso à sua conta seguro. A immigrei processa os fatos que VOCÊ declara; resultados baseados em dados incorretos serão incorretos.",
      "Você deve ter pelo menos 18 anos para criar uma conta.",
    ],
  },
  {
    title: "3. Planos e pagamento",
    body: [
      "A immigrei oferece um plano gratuito e planos pagos por assinatura, processados pela Stripe. Você pode cancelar a qualquer momento; o acesso pago permanece até o fim do período já pago. Valores e benefícios de cada plano são os exibidos na página de planos no momento da contratação.",
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
      "O conteúdo da immigrei é baseado em fontes oficiais e revisado com cuidado, mas regras de imigração mudam com frequência e cada caso tem particularidades. O serviço é fornecido \"como está\", sem garantia de completude, atualidade ou adequação ao seu caso específico.",
      "Na máxima extensão permitida em lei, a immigrei não se responsabiliza por decisões tomadas com base no conteúdo da plataforma, por decisões de agências governamentais sobre o seu caso, nem por danos indiretos. Nada nestes termos limita responsabilidades que não possam ser limitadas por lei.",
      "Quando a lei permitir um teto, nossa responsabilidade total por qualquer reclamação é limitada ao maior valor entre US$100 e o que você pagou à immigrei nos 12 meses anteriores ao fato que originou a reclamação. [Rascunho — teto sugerido pelo Claude; o advogado deve confirmar o valor e se é executável na jurisdição escolhida.]",
    ],
  },
  {
    title: "6. Suspensão, encerramento e alterações",
    body: [
      "Você pode encerrar sua conta a qualquer momento e solicitar a exclusão dos seus dados (ver Política de Privacidade). Se mudarmos estes termos de forma relevante, pedimos seu consentimento ativo antes de você continuar usando a immigrei, junto com um resumo em linguagem simples do que mudou.",
      "Também podemos suspender ou encerrar sua conta em caso de uso indevido da plataforma (ver seção 4), fraude, não pagamento, ou por exigência legal — nesses casos avisaremos você, exceto quando a lei ou o risco de fraude não permitir.",
    ],
  },
  {
    title: "7. Propriedade intelectual",
    body: [
      "O software, design, marca e conteúdo editorial da immigrei (os guias, manuais e textos que nós escrevemos) pertencem à immigrei. Você recebe uma licença pessoal, não exclusiva e não transferível para usar a plataforma enquanto sua conta estiver ativa.",
      "O que você insere (respostas do questionário, documentos que envia ao cofre, dados do seu caso) continua seu. Você nos dá uma licença limitada para usar esses dados apenas para operar o serviço para você.",
    ],
  },
  {
    title: "8. Conteúdo que você publica na comunidade",
    body: [
      "Você é responsável pelo que publica nos relatos da comunidade. Relatos passam por aprovação manual antes de aparecer publicamente, mas isso não é uma verificação de veracidade — a immigrei não garante a exatidão do que outros usuários escrevem e não recomenda nem endossa nenhum relato.",
      "Você mantém os direitos sobre o que escreve, mas nos dá licença para exibi-lo na plataforma. Podemos remover qualquer relato que viole estes termos ou que você nos peça para remover.",
    ],
  },
  {
    title: "9. Profissionais parceiros",
    body: [
      "A immigrei pode receber uma taxa de indicação de profissionais parceiros quando você é conectado a eles — isso nunca muda o preço que você paga ao profissional. [Rascunho — confirmar com o Felipe/César se essa estrutura de indicação já existe ou é hipotética, e ajustar a redação conforme o fato.]",
      "A immigrei verifica credenciais básicas dos profissionais listados, mas a relação e a responsabilidade profissional são inteiramente entre você e o profissional escolhido.",
    ],
  },
  {
    title: "10. Reembolsos",
    body: [
      "Não fazemos reembolso proporcional de períodos já iniciados — ao cancelar, seu acesso pago continua até o fim do período já pago (ver seção 3), e a cobrança seguinte simplesmente não acontece. [Rascunho — confirmar se querem oferecer garantia de reembolso nos primeiros dias, comum em produtos de assinatura.]",
    ],
  },
  {
    title: "11. Lei aplicável e foro",
    body: [
      "Estes termos são regidos pelas leis do Estado de Wyoming, EUA — onde a Hash Vantage Group LLC é registrada — e qualquer disputa será resolvida nos tribunais desse estado. [Rascunho — falta advogado confirmar se faz sentido prever arbitragem antes de ação judicial, dado que o público é majoritariamente brasileiro.]",
    ],
  },
  {
    title: "12. Contato",
    body: [
      "Dúvidas sobre estes termos: ola@immigrei.com.",
    ],
  },
];

export default function TermosPage() {
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
          Termos de Uso
        </h1>
        <p className="text-ink-faint text-sm mb-1">
          Última atualização: {LAST_UPDATED}
        </p>
        <p className="text-ink-faint text-sm mb-10">
          immigrei é operado por Hash Vantage Group LLC.
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
