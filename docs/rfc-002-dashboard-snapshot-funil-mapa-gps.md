# RFC-002 — Dashboard Snapshot, página /fontes e funil Mapa ➔ GPS

- **Status:** Proposto
- **Data:** 2026-07-04
- **Autor:** Arquitetura Immigrei
- **Depende de:** RFC-001 (motor de regras B1/B2 ➔ F-1, PR #2)

## Problema

O dashboard atual falha como snapshot (auditoria visual de 2026-07-04):

1. **Mente sobre o estado.** A "Jornada" mostra conteúdo educacional estático
   do visto escolhido no onboarding, com checkmarks decorativos e "VOCÊ ESTÁ
   AQUI" que não refletem nada do caso real do usuário.
2. **Duas fontes de verdade em conflito** na mesma tela: "Caminho escolhido:
   H-1B" (onboarding) ao lado do card "B1/B2 ➔ F-1 VALIDADO" (caso real).
3. **Widget "Próximos Passos" dá conselho estratégico hardcoded** ("Peça ao
   seu empregador para..."), fora do MESSAGES_PT e invisível ao guard UPL —
   violação real do modelo ministerial (gatilho de compliance acionado e
   resolvido por este RFC).
4. Benchmark (Lawfully, Boundless, Atlys): os líderes mostram o **estado
   real do caso** e o **que falta**, nunca conteúdo genérico. Nosso valor de
   assinatura é vigilância contínua — o dashboard é onde ela aparece.

## Princípio norteador

> O dashboard responde **"como estou AGORA e o que me falta?"** com fatos do
> banco. Educação mora em /vistos. Conselho não mora em lugar nenhum.

## Entregável 1 — Dashboard Snapshot

Wireframe (ordem vertical, mobile-first):

```
┌─────────────────────────────────────────┐
│ ⏱ SEUS PRAZOS                    (hero) │
│ I-94 vence em 117 dias — 29/10/2026     │
│ [anel de progresso neutro]              │
│ fonte: dado do seu caso · i94.cbp.gov → │
├─────────────────────────────────────────┤
│ 📋 SEU PROCESSO ATIVO                   │
│ Mudança de status B1/B2 → F-1           │
│ ▓▓▓▓▓▓ 6/6 verificações · VALIDADO      │
│ Pendência factual (se houver):          │
│ "Falta: comprovante I-901" → link caso  │
├─────────────────────────────────────────┤
│ 📡 RADAR                                │
│ · Caso USCIS (receipt) — status/data    │
│ · Consulados — próximo atendimento      │
│ (uma seção, dois blocos colapsáveis)    │
└─────────────────────────────────────────┘
```

**Regras semânticas (inegociáveis):**
- Barra/anel medem **completude** ("6/6 verificações"), nunca probabilidade
  de aprovação. Proibido qualquer % que possa ler-se como "chance".
- Prazos são fatos + aritmética de calendário (dado do caso, com fonte).
- Pendências vêm de `case_rule_results` e falam via `uiMessageKey`
  (MESSAGES_PT) — zero texto novo fora do guard.

**Estados vazios:**
- Sem caso: hero vira CTA "Comece seu processo" → /casos/cos-b2-f1;
  radar mostra os CTAs existentes de adicionar receipt/consulado.
- Sem I-94 preenchido: hero mostra "Informe seu I-94 para ver seus prazos".

**Remoções:**
- Widget "Sua Jornada" sai do dashboard (o conteúdo permanece em /vistos).
- Widget "Próximos Passos" (strategies.ts) morre. Substituto: "Pendências do
  seu caso" (factual, derivado dos rule results). O motor de strategies/kit
  upsell fica desligado até reformulação factual em RFC futuro.
- "Caminho escolhido" do onboarding só aparece se NÃO houver caso ativo
  (uma fonte de verdade por vez).

## Entregável 2 — Página /fontes (Transparência)

Renderiza `compliance_rules` (leitura pública já habilitada pela RLS da
migration 010) como vitrine de confiança:

```
As regras que o Immigrei valida — e de onde cada uma vem
─────────────────────────────────────────────
✅ I-94 dentro do prazo autorizado
   8 CFR § 248.1(b) · [texto oficial verbatim, colapsável]
   Ver no ecfr.gov → · Verificado em 04/07/2026
(… as 6 regras, ordenadas por pathway)
─────────────────────────────────────────────
Rodapé fixo: "O Immigrei valida requisitos técnicos objetivos e
compila formulários. Não presta consultoria jurídica — casos fora
destes parâmetros são encaminhados a advogados parceiros."
```

- "Verificado em" = `updated_at` da linha (auditoria de grounding).
- Link no rodapé do site + link no card de bloqueio ("por que travamos?").
- Nenhum texto novo interpretativo: título da regra (rótulo neutro já usado
  na lista de verificações), citação, verbatim, URL, data. Só.

## Entregável 3 — Funil Mapa ➔ GPS

**Mapa** = jornadas educacionais de `lib/visa-journeys.ts` (/vistos).
**GPS** = pathways transacionais com motor de regras (hoje: B1/B2 ➔ F-1).

1. **Expansão do mapa:** completar jornadas dos vistos de maior demanda da
   persona (B1/B2 prorrogação, F-1, H-1B, L-1, O-1, casamento/AOS, EB-2
   NIW), seguindo a guideline existente do arquivo (fatos, fontes oficiais,
   zero conselho). Vistos que nunca viraremos GPS também ganham mapa — mapa
   não exerce advocacia.
2. **Botão-ponte:** etapa de jornada coberta por um pathway ativo ganha
   "O Immigrei automatiza esta etapa →" (hoje: etapa de mudança de status
   na jornada F-1 → /casos/cos-b2-f1). Campo novo `pathwayHref?` no
   JourneyStep.
3. **Sensor de demanda:** page views por jornada (Vercel Analytics já
   presente ou contador simples) viram o ranking de demanda que decide o
   próximo GPS a construir — critério de priorização da matriz do RFC-001
   passa a ter dado real.

## Fora de escopo (explícito)

- Compilação do I-539 (RFC-003 futuro).
- Reformular strategies.ts/kit upsell (desligado, não reescrito).
- Novos pathways GPS (aguardam sensor de demanda + template de due
  diligence).
- Redesign visual global (mantém design system atual).

## Plano de implementação (prompts de terminal, em ordem)

- **T1 — Dashboard Snapshot:** hero de prazos + processo ativo + radar +
  remoções + estados vazios. Maior tarefa (~1 sessão).
- **T2 — /fontes:** página pública lendo compliance_rules. Pequena.
- **T3 — Ponte mapa➔GPS:** `pathwayHref` no tipo, botão na jornada F-1,
  revisão de conteúdo das jornadas existentes contra a guideline. Média.
- **T4 — Jornadas novas:** conteúdo (pode ser incremental, uma por vez).

Critério de aceite comum: 211+ testes verdes, tsc limpo, zero string
jurídica fora de MESSAGES_PT, revisão visual no browser antes de commit.

## Métricas de sucesso

- Dashboard: usuário de teste consegue responder "quando vence meu I-94?" e
  "o que falta no meu caso?" em <10 segundos, sem clicar.
- /fontes: linkável em conversa com advogado/investidor sem contexto extra.
- Funil: ranking de tráfego por jornada disponível para decidir o pathway #2.
