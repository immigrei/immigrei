# Códigos de erro e vocabulário — API do pathway B1/B2 ➔ F-1

Referência de troubleshooting para testes e produção. Companion de
`docs/rfc-001-mvp-pathways-grounded-validation.md` (§3.4) e da migration
`supabase/migrations/010_pathway_b2_f1_grounded.sql`.

## 1. Códigos HTTP das rotas

### `POST /api/cases/cos-b2-f1/[id]/validate`

| Código | Significado | O que checar no troubleshoot |
|--------|-------------|------------------------------|
| 200 | Validação rodou; resposta traz `{ outcomes, caseStatus }` | — |
| 401 | Sem sessão Clerk válida | Usuário deslogado ou token expirado; conferir Clerk dashboard |
| 404 | Caso não existe **ou pertence a outro usuário** (proposital: não revelamos existência de caso alheio — nunca retornamos 403) | Conferir `id` do caso e `user_id` em `cos_b2_f1_cases`; se o usuário jura que o caso é dele, comparar `user_id` com o `sub` do JWT do Clerk |
| 500 | Falha de banco ao gravar `case_rule_results` ou atualizar status | Logs da Vercel (`console.error` com o erro do Supabase) + status do Supabase |

### `POST /api/cases/cos-b2-f1/[id]/acknowledge-90-day`

| Código | Significado | O que checar |
|--------|-------------|--------------|
| 200 | Ciência registrada; resposta traz `{ acknowledgedAt }` | — |
| 401 / 404 | Iguais à rota de validação | Idem |
| 409 | Ciência **já registrada antes** — o campo é imutável (guard na rota + `.is(null)` no update + trigger `protect_90_day_ack` no banco) | Não é bug: conferir `dos_90_day_acknowledged_at` no caso. Se a UI mostrou 409 sem o usuário ter clicado antes, investigar clique duplo/replay |
| 500 | Falha genuína de banco (não relacionada à imutabilidade) | Logs da Vercel + status do Supabase |

## 2. Vocabulário de domínio (o que aparece nas respostas e no banco)

### `outcome.status` (por regra)

| Valor | Significado | Efeito na UI |
|-------|-------------|--------------|
| `pass` | Regra satisfeita | Nada a exibir |
| `hard_block` | Impossibilidade técnica: o compilador não produz protocolo válido sob a norma citada | Trava o fluxo; exibe a mensagem do `uiMessageKey`; CTA de advogado parceiro |
| `disclosure_ack_required` | Fato oficial relevante que NÃO impede o protocolo; exige ciência | Exibe norma verbatim + checkbox; chama a rota de acknowledge |

### `caseStatus` (persistido em `cos_b2_f1_cases.status`)

| Valor | Significado |
|-------|-------------|
| `draft` | Caso criado, ainda não validado |
| `validated` | Última validação sem nenhum `hard_block` |
| `blocked` | Última validação com ≥1 `hard_block` |
| `compiled` | Formulário gerado (etapa futura — ainda sem uso; ver apontamento no RFC sobre o mapa de estados ao revalidar) |

### `ruleCode` (as 6 regras; mesmo código em pass e block — FK para `compliance_rules.code`)

| ruleCode | O que valida | Fato de entrada | Fonte oficial | uiMessageKey quando falha |
|----------|--------------|-----------------|---------------|---------------------------|
| `I94_EXPIRED` | I-94 vigente na data da validação | `i94_admit_until` | 8 CFR § 248.1(b) | `block.i94_expired` (vencido) / `block.i94_missing` (sem dado) |
| `DOS_90_DAY_WINDOW` | ≥90 dias desde a última entrada; senão, disclosure | `last_entry_date` | 9 FAM 302.9-4(B)(3)(g)(2) | `disclosure.dos_90_day` / `block.last_entry_date_missing` (sem dado) |
| `I20_MISSING` | SEVIS ID presente e no formato `N` + 10 dígitos | `sevis_id` | 8 CFR § 214.2(f)(1)(i)(A) | `block.i20_missing` |
| `SEVIS_FEE_UNPAID` | Taxa SEVIS I-901 paga | `i901_fee_paid` | 8 CFR § 214.13(a)(3) | `block.sevis_fee_unpaid` |
| `B2_STUDY_STARTED` | Não iniciou estudos antes da aprovação | `enrolled_before_approval` | 8 CFR § 214.2(b)(7) | `block.b2_study_started` |
| `UNAUTHORIZED_WORK` | Não trabalhou sem autorização | `worked_without_authorization` | 8 CFR § 214.1(e); INA § 248(a)(1) | `block.unauthorized_work` |

## 3. Receitas de troubleshoot

**"O usuário diz que foi bloqueado e não devia."**
1. `select * from case_rule_results where case_id = '<id>' order by evaluated_at desc limit 6;` — mostra o veredito de cada regra na última validação, com citação.
2. Conferir o fato de entrada correspondente em `cos_b2_f1_cases` (tabela acima diz qual coluna alimenta qual regra).
3. Lembrar: dado **ausente** também bloqueia (`block.i94_missing` etc.) — o caso pode estar só incompleto, não inelegível.

**"O status do caso não bate com os resultados."**
A validação grava resultados e depois atualiza o status; se o segundo passo falhou (500), pode haver resultados novos com status velho. Rodar a validação de novo resolve; se persistir, ver logs da Vercel.

**"409 no acknowledge sem o usuário ter clicado antes."**
Ver `dos_90_day_acknowledged_at` no caso. Se preenchido com timestamp plausível, foi clique anterior (inclusive em outra aba). O campo é imutável por design de auditoria — não existe "desfazer" (é prova de compliance).

**"Preciso saber qual mensagem a UI mostrou."**
As strings vivem exclusivamente em `lib/rules/messages.pt.ts`, indexadas por `uiMessageKey`. A UI não gera texto próprio — se uma mensagem estranha apareceu, ou é deste arquivo ou é bug de renderização.

## 4. Regra de manutenção

Toda rota nova deste pathway deve: (a) adicionar seus códigos HTTP aqui, (b)
usar 404 (nunca 403) para caso de outro usuário, (c) mensagens de UI só via
`uiMessageKey` — o guard UPL (`messages.upl-guard.test.ts`) vigia o resto.
