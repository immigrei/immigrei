import Link from "next/link";

const etapas = [
  { numero: "01", titulo: "USCIS aprova a petição", descricao: "Após a aprovação do I-130 ou I-140, o caso é transferido automaticamente para o NVC." },
  { numero: "02", titulo: "NVC abre o processo", descricao: "O NVC cria um número de caso consular e notifica o peticionário por e-mail (pode levar semanas)." },
  { numero: "03", titulo: "Pagamento das taxas", descricao: "Duas taxas separadas: AOS fee (processamento do solicitante) e IV fee (processamento do visto)." },
  { numero: "04", titulo: "Upload de documentos", descricao: "Envio do formulário DS-260, documentos civis (certidão de nascimento, casamento, antecedentes) e comprovantes financeiros." },
  { numero: "05", titulo: "Checklist e revisão", descricao: "O NVC revisa tudo. Se faltou algo, envia um aviso. O processo fica em espera até a documentação estar completa." },
  { numero: "06", titulo: "Número de visto disponível", descricao: "Para vistos de preferência, o caso só avança quando um número de visto está disponível no Boletim de Vistos." },
  { numero: "07", titulo: "Entrevista na embaixada", descricao: "O NVC agenda a entrevista consular. É feita na embaixada americana — no Brasil, em São Paulo ou Brasília." },
];

const documentos = [
  { nome: "DS-260", descricao: "Formulário de solicitação de visto de imigrante — preenchido online no portal CEAC" },
  { nome: "Certidão de nascimento", descricao: "Original com tradução juramentada para inglês" },
  { nome: "Certidão de casamento / divórcio", descricao: "Se aplicável — original com tradução juramentada" },
  { nome: "Antecedentes criminais", descricao: "Do Brasil e de outros países onde viveu por +6 meses após os 16 anos" },
  { nome: "Comprovante financeiro (I-864)", descricao: "Demonstração de que o patrocinador tem renda suficiente para sustentar o imigrante" },
  { nome: "Fotos no padrão americano", descricao: "2 fotos recentes no formato exigido pelo consulado" },
  { nome: "Exame médico", descricao: "Feito por médico autorizado pelo consulado — agendado separadamente" },
];

const alertas = [
  {
    tipo: "warning" as const,
    titulo: "Tempo de espera pode ser longo",
    texto: "Para categorias de preferência (família / emprego), o processo pode levar anos — depende da fila e do Boletim de Vistos mensal. Vistos imediatos (cônjuge de cidadão americano) são mais rápidos.",
  },
  {
    tipo: "info" as const,
    titulo: "NVC é só para processo consular",
    texto: "Se você já está nos EUA e vai pedir o green card por ajuste de status (I-485), o NVC não entra no processo. Ele é exclusivo para quem está fora dos EUA.",
  },
  {
    tipo: "warning" as const,
    titulo: "E-mail do NVC vai para spam",
    texto: "As notificações do NVC são enviadas por e-mail e frequentemente caem no spam. Configure seu e-mail para aceitar mensagens de nvccase@state.gov.",
  },
];

export default function NVCPage() {
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
            className="text-xs px-2.5 py-1 rounded-full font-semibold bg-amber-tint text-amber-deep"
            style={{ fontSize: "11px", letterSpacing: "0.05em" }}
          >
            Vistos Consulares
          </span>
        </div>
        <p className="text-xs font-bold uppercase tracking-widest text-ink-faint mb-2">NVC</p>
        <h1
          className="text-3xl md:text-4xl text-ink mb-4 leading-tight"
          style={{ fontFamily: "var(--font-display)", fontWeight: 600 }}
        >
          Centro Nacional de Vistos
        </h1>
        <p className="text-ink-soft text-lg leading-relaxed">
          O NVC é a ponte entre o USCIS e a embaixada americana. Quando sua petição é
          aprovada nos EUA mas você ainda está no Brasil, é o NVC que coordena a
          documentação e prepara tudo para a entrevista consular.
        </p>
      </section>

      {/* Contexto — onde o NVC entra */}
      <section className="max-w-3xl mx-auto mb-10">
        <div className="bg-cream-2 rounded-2xl p-6 border border-pine-tint">
          <p className="text-xs font-bold uppercase tracking-widest text-ink-faint mb-3">
            Quando o NVC entra no seu caso
          </p>
          <div className="flex flex-col md:flex-row gap-4 text-sm text-ink-soft leading-relaxed">
            <div className="flex-1">
              <p className="font-semibold text-ink mb-1">✓ NVC faz parte do processo</p>
              <ul className="space-y-1 list-disc list-inside text-ink-soft">
                <li>Green card por família (I-130) — de fora dos EUA</li>
                <li>Green card por emprego (I-140) — de fora dos EUA</li>
                <li>Visto de imigrante via processo consular</li>
              </ul>
            </div>
            <div className="w-px bg-pine-tint hidden md:block" />
            <div className="flex-1">
              <p className="font-semibold text-ink mb-1">✗ NVC não entra no processo</p>
              <ul className="space-y-1 list-disc list-inside text-ink-soft">
                <li>Ajuste de status dentro dos EUA (I-485)</li>
                <li>Vistos de não-imigrante (F-1, H-1B, etc.)</li>
                <li>Renovações de status dentro dos EUA</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Etapas */}
      <section className="max-w-3xl mx-auto mb-12">
        <h2
          className="text-xl text-ink font-semibold mb-6"
          style={{ fontFamily: "var(--font-display)" }}
        >
          Etapas do processo NVC
        </h2>
        <div className="relative">
          <div className="absolute left-[2.25rem] top-6 bottom-6 w-px bg-pine-tint hidden md:block" />
          <div className="flex flex-col gap-3">
            {etapas.map((etapa, i) => (
              <div key={i} className="bg-cream-2 rounded-2xl px-6 py-5 flex gap-4 items-start">
                <span
                  className="text-amber-deep font-bold text-sm flex-shrink-0 mt-0.5 w-6 text-center"
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
        </div>
      </section>

      {/* Documentos */}
      <section className="max-w-3xl mx-auto mb-12">
        <h2
          className="text-xl text-ink font-semibold mb-2"
          style={{ fontFamily: "var(--font-display)" }}
        >
          Documentos necessários
        </h2>
        <p className="text-ink-soft text-sm mb-6">O que o NVC pede para enviar ao portal CEAC antes da entrevista.</p>
        <div className="flex flex-col gap-3">
          {documentos.map((doc) => (
            <div key={doc.nome} className="bg-cream-2 rounded-xl px-5 py-4 flex gap-3 items-start">
              <div className="w-5 h-5 rounded-full bg-amber-tint flex items-center justify-center flex-shrink-0 mt-0.5">
                <svg className="w-3 h-3 text-amber-deep" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <div>
                <p className="font-semibold text-ink text-sm">{doc.nome}</p>
                <p className="text-xs text-ink-soft leading-relaxed">{doc.descricao}</p>
              </div>
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
            <p className="font-semibold text-cream mb-1">Consulte o Boletim de Vistos</p>
            <p className="text-cream/80 text-sm leading-relaxed">
              Para vistos de preferência, o número de visto precisa estar disponível antes
              da entrevista. O Boletim é publicado mensalmente pelo Departamento de Estado.
            </p>
          </div>
          <a
            href="https://travel.state.gov/content/travel/en/legal/visa-law0/visa-bulletin.html"
            target="_blank"
            rel="noopener noreferrer"
            className="flex-shrink-0 bg-amber text-ink font-semibold text-sm px-5 py-3 rounded-xl hover:bg-amber-deep transition-colors"
          >
            Ver boletim →
          </a>
        </div>
      </section>
    </main>
  );
}
