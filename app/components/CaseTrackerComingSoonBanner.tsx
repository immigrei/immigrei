/**
 * Sits above the USCIS case-status UI while automatic tracking is still
 * pending USCIS production access (Torch sandbox only — see CLAUDE.md
 * "Known gaps" for the underlying access requirement).
 */
export default function CaseTrackerComingSoonBanner() {
  return (
    <div className="bg-pine-tint border border-pine/30 rounded-2xl px-5 py-4 mb-5">
      <p
        className="text-xs font-bold uppercase tracking-widest text-pine mb-1.5"
        style={{ letterSpacing: "0.1em" }}
      >
        Em breve
      </p>
      <p className="text-sm font-semibold text-ink mb-1">
        Seu caso, atualizado sozinho
      </p>
      <p className="text-xs text-ink-soft leading-relaxed">
        O <span className="font-semibold">status do caso</span> é o estágio oficial
        que o USCIS atribui ao seu processo (recebido, em análise, aprovado,
        negado...) — ele muda várias vezes até o fim da jornada, e cada mudança
        pode significar um próximo passo diferente pra você. Hoje você confere
        isso manualmente com o número do recibo. Estamos liberando com o USCIS o
        acesso pra consultar esse status automaticamente e te avisar assim que
        ele mudar, sem você precisar checar.
      </p>
    </div>
  );
}
