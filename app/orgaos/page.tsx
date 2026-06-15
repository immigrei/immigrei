import Link from "next/link";

const orgaos = [
  {
    slug: "uscis",
    sigla: "USCIS",
    nome: "Serviço de Cidadania e Imigração",
    descricao:
      "O principal órgão federal de imigração dos EUA. Processa petições, status, autorizações de trabalho, green cards e cidadania.",
    badge: "Petições & Status",
    cor: "pine",
    icone: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6">
        <path d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
    ),
    processos: ["Petições de visto", "Autorização de trabalho (EAD)", "Ajuste de status (I-485)", "Green card", "Cidadania (N-400)"],
  },
  {
    slug: "nvc",
    sigla: "NVC",
    nome: "Centro Nacional de Vistos",
    descricao:
      "A ponte entre o USCIS e a embaixada americana. Coleta documentos e taxas para vistos de imigrante de quem está fora dos EUA.",
    badge: "Vistos Consulares",
    cor: "amber",
    icone: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6">
        <path d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064" />
        <path d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    processos: ["Processamento consular", "Coleta de documentos", "Pagamento de taxas AOS/IV", "Entrevista na embaixada", "Imigração familiar"],
  },
  {
    slug: "eoir",
    sigla: "EOIR",
    nome: "Tribunal de Imigração",
    descricao:
      "O tribunal federal que decide sobre casos de remoção, asilo e apelações. É aqui onde se luta pela permanência nos EUA na Justiça.",
    badge: "Tribunal & Remoção",
    cor: "clay",
    icone: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6">
        <path d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" />
      </svg>
    ),
    processos: ["Processos de remoção", "Pedidos de asilo", "Audiências de imigração", "Apelações (BIA)", "Defesa contra deportação"],
  },
];

const corMap: Record<string, { badge: string; bg: string; hover: string; icon: string }> = {
  pine: {
    badge: "bg-pine-tint text-pine",
    bg: "bg-pine-tint/60",
    hover: "hover:border-pine/40",
    icon: "text-pine",
  },
  amber: {
    badge: "bg-amber-tint text-amber-deep",
    bg: "bg-amber-tint/60",
    hover: "hover:border-amber/40",
    icon: "text-amber-deep",
  },
  clay: {
    badge: "bg-clay/10 text-clay",
    bg: "bg-clay/5",
    hover: "hover:border-clay/30",
    icon: "text-clay",
  },
};

export default function OrgaosPage() {
  return (
    <main className="min-h-screen bg-cream px-4 py-12 md:py-16">
      <section className="max-w-2xl mx-auto text-center mb-14">
        <span
          className="inline-block text-xs font-bold uppercase tracking-widest text-pine mb-4"
          style={{ letterSpacing: "0.15em", fontFamily: "var(--font-sans)" }}
        >
          Sistema de imigração americano
        </span>
        <h1
          className="text-4xl md:text-5xl text-ink mb-4 leading-tight"
          style={{ fontFamily: "var(--font-display)", fontWeight: 600 }}
        >
          Os órgãos que decidem <br className="hidden md:block" />
          o seu futuro aqui
        </h1>
        <p className="text-ink-soft text-lg leading-relaxed">
          Três órgãos diferentes, com papéis distintos. Entender quem faz o quê
          é o primeiro passo para navegar o sistema com clareza.
        </p>
      </section>

      <div className="max-w-3xl mx-auto flex flex-col gap-5">
        {orgaos.map((orgao) => {
          const estilos = corMap[orgao.cor];
          return (
            <Link
              key={orgao.slug}
              href={`/orgaos/${orgao.slug}`}
              className={[
                "group bg-cream-2 rounded-2xl border-2 border-transparent p-6 md:p-8",
                "flex flex-col md:flex-row gap-5 md:gap-8 transition-all duration-200",
                "hover:shadow-lg hover:-translate-y-0.5",
                estilos.hover,
              ].join(" ")}
            >
              {/* Icon */}
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${estilos.bg}`}>
                <span className={estilos.icon}>{orgao.icone}</span>
              </div>

              {/* Content */}
              <div className="flex-1">
                <div className="flex flex-wrap items-center gap-2 mb-2">
                  <span
                    className={`text-xs px-2.5 py-1 rounded-full font-semibold ${estilos.badge}`}
                    style={{ fontSize: "11px", letterSpacing: "0.05em" }}
                  >
                    {orgao.badge}
                  </span>
                </div>
                <p className="text-xs font-bold uppercase tracking-widest text-ink-faint mb-1">
                  {orgao.sigla}
                </p>
                <h2
                  className="text-xl text-ink leading-snug mb-2"
                  style={{ fontFamily: "var(--font-display)", fontWeight: 600 }}
                >
                  {orgao.nome}
                </h2>
                <p className="text-ink-soft text-sm leading-relaxed mb-4">
                  {orgao.descricao}
                </p>
                <div className="flex flex-wrap gap-2">
                  {orgao.processos.map((p) => (
                    <span
                      key={p}
                      className="text-xs bg-cream px-2.5 py-1 rounded-full text-ink-soft font-medium"
                    >
                      {p}
                    </span>
                  ))}
                </div>
              </div>

              {/* Arrow */}
              <div className="hidden md:flex items-center self-center">
                <svg
                  className="w-5 h-5 text-ink-faint group-hover:text-ink-soft group-hover:translate-x-1 transition-all"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </Link>
          );
        })}
      </div>

      {/* Footer note */}
      <div className="max-w-3xl mx-auto mt-10">
        <div className="bg-pine text-cream rounded-2xl px-6 py-5 flex gap-4 items-start">
          <span className="text-xl flex-shrink-0 mt-0.5">💡</span>
          <div>
            <p className="font-semibold text-cream mb-1 text-sm uppercase tracking-wide" style={{ fontFamily: "var(--font-sans)" }}>
              Nem todo caso passa pelos três
            </p>
            <p className="text-cream/80 text-sm leading-relaxed">
              A maioria dos brasileiros interage principalmente com o USCIS. O NVC entra quando o processo
              é consular — ou seja, o visto vem de fora dos EUA. O EOIR é o tribunal, ativado quando há
              processo de remoção ou pedido de asilo.
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
