import Link from "next/link";

const formsprincipais = [
  { codigo: "I-130", nome: "Petição para familiar", uso: "Trazer cônjuge, filhos ou pais para os EUA" },
  { codigo: "I-140", nome: "Petição de emprego", uso: "Green card por emprego — patrocinado pelo empregador ou NIW" },
  { codigo: "I-485", nome: "Ajuste de status", uso: "Mudar para residente permanente dentro dos EUA" },
  { codigo: "I-765", nome: "Autorização de trabalho (EAD)", uso: "Permissão para trabalhar enquanto o caso está pendente" },
  { codigo: "I-131", nome: "Advance Parole / Travel Doc", uso: "Viajar fora dos EUA sem perder o caso pendente" },
  { codigo: "I-90", nome: "Renovação do green card", uso: "Renovar ou repor o cartão de residente permanente" },
  { codigo: "N-400", nome: "Naturalização", uso: "Solicitar a cidadania americana" },
  { codigo: "I-539", nome: "Extensão de status", uso: "Estender o visto de estudante, turista ou dependente" },
];

const etapas = [
  { numero: "01", titulo: "Petição protocolada", descricao: "Você ou seu advogado envia o formulário com documentos e taxa ao USCIS." },
  { numero: "02", titulo: "Recibo (Receipt Notice)", descricao: "O USCIS envia um aviso de recebimento com o número do caso para acompanhamento." },
  { numero: "03", titulo: "Biometria (se necessário)", descricao: "Para alguns casos, o USCIS agenda coleta de impressões digitais e foto." },
  { numero: "04", titulo: "Entrevista (se necessário)", descricao: "Casos de green card e cidadania geralmente exigem entrevista presencial." },
  { numero: "05", titulo: "Decisão", descricao: "Aprovação, pedido de evidência adicional (RFE/NOID) ou negativa. RFE não é o fim — dá para responder." },
];

const alertas = [
  {
    tipo: "warning" as const,
    titulo: "RFE — Pedido de Evidência",
    texto: "Se o USCIS precisar de mais informações, envia um RFE. Você tem prazo para responder — geralmente 87 dias. Não responder significa negativa automática.",
  },
  {
    tipo: "info" as const,
    titulo: "Prazo de processamento varia muito",
    texto: "O tempo do USCIS não é fixo. Muda com a categoria do visto, o escritório, e o volume de casos. Consulte sempre o site do USCIS para o prazo atual da sua forma.",
  },
  {
    tipo: "warning" as const,
    titulo: "Não perca seu status",
    texto: "Se seu visto expira enquanto o caso está pendente, você pode entrar em situação irregular. Certifique-se de protocollar extensão ou ajuste antes do vencimento.",
  },
];

export default function USCISPage() {
  return (
    <main className="min-h-screen bg-cream px-4 py-12 md:py-16">
      {/* Back */}
      <div className="max-w-3xl mx-auto mb-8">
        <Link
          href="/orgaos"
          className="inline-flex items-center gap-1.5 text-sm text-ink-soft hover:text-ink transition-colors"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
          Todos os órgãos
        </Link>
      </div>

      {/* Header */}
      <section className="max-w-3xl mx-auto mb-12">
        <div className="flex items-center gap-3 mb-4">
          <span
            className="text-xs px-2.5 py-1 rounded-full font-semibold bg-pine-tint text-pine"
            style={{ fontSize: "11px", letterSpacing: "0.05em" }}
          >
            Petições & Status
          </span>
        </div>
        <p className="text-xs font-bold uppercase tracking-widest text-ink-faint mb-2">USCIS</p>
        <h1
          className="text-3xl md:text-4xl text-ink mb-4 leading-tight"
          style={{ fontFamily: "var(--font-display)", fontWeight: 600 }}
        >
          Serviço de Cidadania e Imigração dos EUA
        </h1>
        <p className="text-ink-soft text-lg leading-relaxed">
          O USCIS é o órgão federal responsável pela maioria das petições de imigração nos EUA.
          Se você está pedindo um visto, ajustando seu status, renovando autorização de trabalho
          ou buscando a cidadania — provavelmente seu caso passa por aqui.
        </p>
      </section>

      {/* Etapas */}
      <section className="max-w-3xl mx-auto mb-12">
        <h2
          className="text-xl text-ink font-semibold mb-6"
          style={{ fontFamily: "var(--font-display)" }}
        >
          Como funciona o processo
        </h2>
        <div className="flex flex-col gap-3">
          {etapas.map((etapa, i) => (
            <div key={i} className="bg-cream-2 rounded-2xl px-6 py-5 flex gap-4 items-start">
              <span
                className="text-pine font-bold text-sm flex-shrink-0 mt-0.5 w-6 text-center"
                style={{ fontFamily: "var(--font-sans)" }}
              >
                {etapa.numero}
              </span>
              <div>
                <p className="font-semibold text-ink text-sm mb-0.5">{etapa.titulo}</p>
                <p className="text-ink-soft text-sm leading-relaxed">{etapa.descricao}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Formulários */}
      <section className="max-w-3xl mx-auto mb-12">
        <h2
          className="text-xl text-ink font-semibold mb-2"
          style={{ fontFamily: "var(--font-display)" }}
        >
          Principais formulários
        </h2>
        <p className="text-ink-soft text-sm mb-6">Os formulários mais usados por brasileiros no sistema USCIS.</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {formsprincipais.map((form) => (
            <div key={form.codigo} className="bg-cream-2 rounded-xl px-5 py-4">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs font-bold text-pine bg-pine-tint px-2 py-0.5 rounded-md">
                  {form.codigo}
                </span>
                <span className="text-sm font-semibold text-ink">{form.nome}</span>
              </div>
              <p className="text-xs text-ink-soft leading-relaxed">{form.uso}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Alertas */}
      <section className="max-w-3xl mx-auto mb-12">
        <h2
          className="text-xl text-ink font-semibold mb-6"
          style={{ fontFamily: "var(--font-display)" }}
        >
          O que você precisa saber
        </h2>
        <div className="flex flex-col gap-4">
          {alertas.map((alerta, i) => (
            <div
              key={i}
              className={[
                "rounded-2xl px-5 py-4 flex gap-3 items-start",
                alerta.tipo === "warning" ? "bg-amber-tint" : "bg-pine-tint",
              ].join(" ")}
            >
              <span className="text-lg flex-shrink-0 mt-0.5">
                {alerta.tipo === "warning" ? "⚠️" : "💡"}
              </span>
              <div>
                <p className={`font-semibold text-sm mb-1 ${alerta.tipo === "warning" ? "text-amber-deep" : "text-pine"}`}>
                  {alerta.titulo}
                </p>
                <p className="text-ink-soft text-sm leading-relaxed">{alerta.texto}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-3xl mx-auto">
        <div className="bg-pine rounded-2xl px-6 py-6 flex flex-col md:flex-row items-start md:items-center gap-4">
          <div className="flex-1">
            <p className="font-semibold text-cream mb-1">Acompanhe seu caso no USCIS</p>
            <p className="text-cream/80 text-sm leading-relaxed">
              Com o número do seu recibo (Receipt Number), você consegue verificar o status
              do caso direto no site do USCIS — sem precisar ligar ou contratar ninguém.
            </p>
          </div>
          <a
            href="https://egov.uscis.gov/casestatus/landing.do"
            target="_blank"
            rel="noopener noreferrer"
            className="flex-shrink-0 bg-amber text-ink font-semibold text-sm px-5 py-3 rounded-xl hover:bg-amber-deep transition-colors"
          >
            Verificar status →
          </a>
        </div>
      </section>
    </main>
  );
}
