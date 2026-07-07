# Template — Due Diligence de Pathway Novo ("catch and dispatch")

Meio dia de trabalho por visto, ANTES de escrever código. Preenchido uma vez,
o pathway entra na fábrica (catálogo + regras puras + mensagens + testes) sem
reabrir debate de compliance. Baseado no processo que validou o B1/B2 ➔ F-1
(RFC-001 + auditoria de grounding de 2026-07-04).

## CATCH — qualificação (15 min; reprovou, parou)

- [ ] **Filtro da matriz (RFC-001):** self-service sem patrocinador? regras
      determinísticas (datas/documentos/booleanos)? jurisdição USCIS
      doméstica? demanda da persona? → Reprovou em qualquer um: **dispatch
      para Fase 2/nunca**, uma linha de justificativa, fim.

## Levantamento grounded (2-3h)

- [ ] Listar cada validação candidata com **fonte primária** (8 CFR / INA /
      USCIS Policy Manual / instruções oficiais do formulário).
- [ ] **Verificar cada citação e texto na fonte oficial** — API do eCFR
      (`ecfr.gov/api/versioner/v1/full/...`) ou página oficial. Nunca de
      memória (a auditoria do B2➔F1 achou 4 erros em 6 textos escritos de
      memória, incluindo 1 citação errada).
- [ ] Classificar cada regra: `pass` / `hard_block` / `disclosure`.
      Disclosure exige justificativa escrita de por que NÃO bloqueia
      (ex.: nenhuma norma proíbe o protocolo).
- [ ] **Fatos, não conclusões:** todo input do usuário é fato material
      (data, número, valor recebido) — nunca autoincriminação jurídica
      ("violei X?").

## Peculiaridades e escalada (30 min)

- [ ] Listar as zonas cinzentas específicas do visto (o que é ambíguo para
      um leigo responder?). Cada uma vira item no
      `docs/attorney-review-package.md` — **não** vira debate interno.
- [ ] **Gatilho de parada:** se alguma validação essencial exigir julgamento
      de mérito/intenção → o pathway não é self-service; ou corta a regra,
      ou o pathway vai para o modelo attorney-review. Decisão do founder.

## DISPATCH — construção (o resto do dia)

- [ ] Linhas novas em `compliance_rules` (texto verbatim + citação + URL).
- [ ] Regras puras em `lib/rules/` + testes de FRONTEIRA (venceu ontem /
      vence hoje / exatamente N dias).
- [ ] Mensagens exclusivamente em `messages.pt.ts` (o guard UPL vigia
      sozinho). Tom: limitação de escopo do software + fonte + advogado
      parceiro. Traduções rotuladas "tradução livre", com atenção à voz
      (quem tem a faculdade na norma — agente ou lei?).
- [ ] Atualizar `docs/error-codes-*.md` com códigos e receitas novas.

## Registro

- [ ] 1 parágrafo de conclusão no RFC do pathway: o que entrou, o que ficou
      de fora, e as perguntas abertas para a passada legal pré-cobrança.
