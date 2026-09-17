// Official-sources block shared by every public content page — /vistos/[id]
// and the explainers (/status, /entenda) all end with the same citation
// list + "verificado em" line.
export function FontesOficiaisSection({
  fontesOficiais,
  verificadoEm,
}: {
  fontesOficiais: { label: string; url: string }[];
  verificadoEm: string;
}) {
  return (
    <section className="mb-6">
      <p
        className="text-xs font-bold uppercase tracking-widest text-ink-faint mb-3"
        style={{ letterSpacing: "0.1em" }}
      >
        Fontes oficiais
      </p>
      <ul className="space-y-1.5">
        {fontesOficiais.map((f) => (
          <li key={f.url}>
            <a
              href={f.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-pine underline underline-offset-2"
            >
              {f.label} ↗
            </a>
          </li>
        ))}
      </ul>
      <p className="text-[10px] text-ink-faint mt-2">
        Conteúdo verificado contra as fontes oficiais em {verificadoEm}.
      </p>
    </section>
  );
}
