// Journey progress engine: derives the state of each timeline step on /painel
// from data the user actually gave us — never from hardcoded states alone.
//
// Signals a step can be marked "feito" by:
//   - school: the user picked a SEVP school on /escolas (profiles.chosen_school)
//   - itens:  checklist item ids from the journey's kit; an item is satisfied
//             when the user checked it OR attached a file to it in the vault
//   - algum:  like itens, but ANY one satisfied is enough — for steps built on
//             alternative evidence categories (O-1/NIW), not a fixed doc list

export interface DoneWhen {
  school?: boolean;
  itens?: string[];
  algum?: string[];
}

export interface ProgressSignals {
  hasSchool: boolean;
  /** Checklist item ids satisfied — checked in the kit or with a file attached. */
  satisfeitos: Set<string>;
}

export type EtapaEstado = "feito" | "agora" | "proximo" | "futuro" | "alerta";

interface EtapaLike {
  estado: EtapaEstado;
  doneWhen?: DoneWhen;
}

export function isEtapaDone(doneWhen: DoneWhen | undefined, signals: ProgressSignals): boolean {
  if (!doneWhen) return false;
  if (doneWhen.school && !signals.hasSchool) return false;
  if (doneWhen.itens && !doneWhen.itens.every((id) => signals.satisfeitos.has(id))) return false;
  if (doneWhen.algum?.length && !doneWhen.algum.some((id) => signals.satisfeitos.has(id))) return false;
  return Boolean(doneWhen.school || doneWhen.itens?.length || doneWhen.algum?.length);
}

/**
 * Recomputes step states: completed steps become "feito", the first
 * incomplete step becomes "agora" (that's where the user should act), and
 * later steps keep their authored state — except an authored "agora" that
 * was overtaken, which is demoted to "proximo".
 */
export function applyProgress<T extends EtapaLike>(etapas: T[], signals: ProgressSignals): T[] {
  // Choice-style journeys (parallel options A/B/C, all authored "agora")
  // have no doneWhen at all — leave them exactly as authored.
  if (etapas.every((e) => !e.doneWhen)) return etapas;

  let agoraAssigned = false;
  return etapas.map((etapa) => {
    if (isEtapaDone(etapa.doneWhen, signals)) {
      return { ...etapa, estado: "feito" as const };
    }
    if (!agoraAssigned && etapa.estado !== "alerta") {
      agoraAssigned = true;
      return { ...etapa, estado: "agora" as const };
    }
    return etapa.estado === "agora" ? { ...etapa, estado: "proximo" as const } : etapa;
  });
}
