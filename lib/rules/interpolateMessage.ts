// lib/rules/interpolateMessage.ts — interpola placeholders {chave} nas
// strings pré-aprovadas de messages.pt.ts (RFC-001 §3.3/§3.4). Pura: só
// substitui texto — quem decide os valores (formatar data, calcular dias,
// escolher a tradução) é a camada de UI, nunca esta função.
export function interpolateMessage(template: string, values: Record<string, string>): string {
  return template.replace(/\{(\w+)\}/g, (match, key: string) =>
    Object.prototype.hasOwnProperty.call(values, key) ? values[key] : match,
  );
}
