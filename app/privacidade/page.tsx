import type { Metadata } from "next";
import Link from "next/link";
import Logo from "../components/Logo";
import Footer from "../components/Footer";

export const metadata: Metadata = {
  metadataBase: new URL("https://immigrei.com"),
  title: "Política de Privacidade — immigrei",
  description: "Como a immigrei coleta, usa e protege os seus dados.",
  alternates: { canonical: "/privacidade" },
};

// Minuta para revisão do advogado parceiro antes do lançamento pago.
const LAST_UPDATED = "1 de agosto de 2026";

const sections: { title: string; body: string[] }[] = [
  {
    title: "1. O que coletamos",
    body: [
      "Dados de conta: nome e e-mail, via nosso provedor de autenticação (Clerk).",
      "Dados do seu caso: as informações migratórias que VOCÊ decide informar (datas de entrada, números de recibo, I-94, SEVIS etc.). Você controla o que insere.",
      "Lista de espera: e-mail e, se você escolher informar, o momento da sua jornada.",
      "Dados técnicos mínimos de uso (logs de acesso) para segurança e operação.",
    ],
  },
  {
    title: "2. Para que usamos",
    body: [
      "Para operar o serviço: mostrar sua jornada, validar requisitos técnicos, enviar os alertas que você ativou (mudanças no caso, visa bulletin, consulados).",
      "Nunca usamos seus dados para publicidade de terceiros e nunca vendemos seus dados. Ponto.",
    ],
  },
  {
    title: "3. Com quem compartilhamos",
    body: [
      "Somente com os processadores necessários para o serviço funcionar: Clerk (autenticação), Supabase (banco de dados), Vercel (hospedagem), Stripe (pagamentos — a immigrei não vê nem armazena seu cartão) e Resend (envio de e-mails). Todos sob contrato e padrões de segurança de mercado.",
      "Não compartilhamos seus dados voluntariamente com nenhuma autoridade governamental. Somente uma ordem judicial válida e vinculante poderia nos obrigar — nesse caso, quando a lei permitir, notificaremos você antes de qualquer resposta.",
      "Se você optar por ser conectado a um profissional parceiro, compartilharemos com ele apenas o que você autorizar expressamente naquele momento.",
    ],
  },
  {
    title: "4. Segurança",
    body: [
      "Seus dados trafegam criptografados (TLS) e são armazenados com criptografia em repouso. O acesso ao banco é protegido por regras de acesso por usuário (RLS) — cada usuário só acessa os próprios dados.",
    ],
  },
  {
    title: "5. Retenção e exclusão",
    body: [
      "Mantemos seus dados enquanto sua conta existir. Se sua conta ficar inativa por mais de 24 meses sem uso, podemos excluir automaticamente os dados não essenciais, avisando você por e-mail antes.",
      "Você pode pedir a exclusão completa a qualquer momento pelo e-mail abaixo — removemos seus dados dos nossos sistemas em até 30 dias, exceto o que a lei exigir manter (ex.: registros fiscais de pagamento).",
    ],
  },
  {
    title: "6. Seus direitos",
    body: [
      "Você pode acessar, corrigir, exportar ou excluir seus dados. Atendemos os direitos previstos na LGPD (Brasil) e nas leis de privacidade aplicáveis dos EUA, incluindo a California Consumer Privacy Act (CCPA) para residentes da Califórnia. Basta escrever para o e-mail de contato.",
    ],
  },
  {
    title: "7. Se houver um vazamento de dados",
    body: [
      "Se identificarmos um incidente de segurança que exponha seus dados pessoais, vamos avisar você por e-mail assim que possível, explicando o que aconteceu, quais dados foram afetados e o que fazer a respeito. Também cumpriremos qualquer obrigação legal de notificação aplicável.",
    ],
  },
  {
    title: "8. Se a immigrei mudar de dono",
    body: [
      "Se a immigrei for vendida, incorporada ou encerrar as atividades, seus dados podem ser transferidos como parte desse processo. Vamos avisar você antes disso acontecer, e a nova empresa (se houver) precisará seguir uma política de privacidade pelo menos tão protetiva quanto esta — ou te dar a opção de exportar ou excluir seus dados antes da transferência.",
    ],
  },
  {
    title: "9. Crianças",
    body: ["A immigrei não é destinada a menores de 18 anos."],
  },
  {
    title: "10. Mudanças nesta política",
    body: [
      "Se mudarmos esta política de forma relevante, pedimos seu consentimento ativo antes de você continuar usando a immigrei — não é só um aviso passivo. Junto com o pedido, mostramos um resumo em linguagem simples do que mudou, pra você não precisar reler o documento inteiro.",
    ],
  },
  {
    title: "11. Contato",
    body: ["Dúvidas sobre esta política: ola@immigrei.com."],
  },
];

export default function PrivacidadePage() {
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
          Política de Privacidade
        </h1>
        <p className="text-ink-faint text-sm mb-1">
          Última atualização: {LAST_UPDATED}
        </p>
        <p className="text-ink-faint text-sm mb-6">
          immigrei é operado por Hash Vantage Group LLC.
        </p>
        <p className="text-ink-soft text-base leading-relaxed mb-10">
          Sabemos que dados migratórios são sensíveis — para muitos de nós,
          são a coisa mais sensível que existe. Esta política é curta e sem
          juridiquês de propósito: você merece entender exatamente o que
          acontece com os seus dados.
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
          Veja também os nossos{" "}
          <Link href="/termos" className="text-pine underline underline-offset-4">
            Termos de Uso
          </Link>
          .
        </p>
      </article>
      <Footer />
    </main>
  );
}
