# Fluxo 07 — Retenção no cancelamento

**Tipo:** híbrido — não é um e-mail, é uma tela própria no app que **intercepta**
o botão de cancelar antes de chegar na Stripe. O e-mail transacional que fecha
o ciclo é o fluxo 08 (cancelamento confirmado), disparado só se a pessoa
insistir em cancelar depois desta tela.
**Objetivo:** entender por que a pessoa está saindo e, quando fizer sentido,
oferecer um motivo concreto para ficar — antes de perder a assinatura, não
depois.

Status: `RASCUNHO — decisão de produto pendente (ver "Gate humano" abaixo)`

---

## Por que isto é uma tela no app e não a etapa nativa do Stripe

O Billing Portal (`app/api/stripe/portal/route.ts`) tem uma etapa nativa de
"motivo de cancelamento" configurável no Dashboard (Settings → Billing →
Customer portal → Cancellation), incluindo oferta automática de cupom. É a
opção mais rápida de implementar — zero código, só configuração. **Foi
descartada deliberadamente** em favor de uma tela própria porque:

- A oferta nativa da Stripe é fixa (um cupom para todo mundo); aqui a ideia é
  adaptar a oferta ao motivo declarado.
- O motivo fica só na Stripe (visível no Dashboard), não em `Supabase` —
  perde a chance de cruzar com dados do produto (visto, status do caso, plano)
  para decisões futuras.
- Menos controle sobre o texto e o tom — a etapa nativa da Stripe não segue
  Fraunces/Hanken nem a paleta da marca.

O trade-off é engenharia: schema novo, rota nova, tela nova, e a chamada de
cancelamento passa a ser feita pela nossa própria API em vez do usuário nunca
sair do Billing Portal.

---

## Fluxo da tela (proposta de interação)

```
/perfil → "Cancelar assinatura"
   │
   ▼
[1] Pesquisa de motivo (obrigatória, uma pergunta)
   │
   ▼
[2] Oferta de retenção — condicional ao motivo (pode não haver oferta)
   │
   ├── Aceitou oferta ──────► aplica cupom via Stripe, NÃO cancela, confirma na tela
   │
   └── Recusou / seguiu ────► POST cancela via API (equivalente ao que o
                               Billing Portal fazia: cancel_at_period_end=true)
                               → webhook já existente detecta o flip
                               → dispara fluxo 08 (e-mail de cancelamento)
```

O Billing Portal continua existindo para **outras** ações (trocar cartão, ver
faturas, mudar de plano) — só o botão "cancelar" passa a abrir esta tela em
vez de ir direto para a Stripe.

---

## [1] Pesquisa de motivo

Uma pergunta, resposta única + campo livre opcional. Copy proposta (revisar
tom):

> **Antes de você ir — o que fez você decidir cancelar?**
> Isso nos ajuda a melhorar, e pode ser que a gente resolva agora mesmo.

| Motivo | Rótulo PT-BR |
|---|---|
| `price` | Está pesado no orçamento agora |
| `resolved` | Meu caso já foi resolvido / não preciso mais acompanhar |
| `not_using` | Não estou usando o suficiente para valer a pena |
| `prefer_lawyer` | Prefiro resolver com um advogado/profissional |
| `missing_feature` | Falta algo que eu precisava |
| `other` | Outro motivo (campo livre) |

```sql
-- Nova tabela — não existe hoje. Migration proposta (não aplicada):
create table if not exists cancellation_feedback (
  id                uuid primary key default gen_random_uuid(),
  user_id           text not null references profiles(clerk_user_id) on delete cascade,
  stripe_subscription_id text not null,
  reason            text not null check (reason in
                       ('price','resolved','not_using','prefer_lawyer','missing_feature','other')),
  reason_detail     text,
  offer_shown       text,              -- qual oferta (se houve) foi exibida
  outcome           text not null check (outcome in ('retained','cancelled')),
  created_at        timestamptz default now()
);
```

---

## [2] Oferta de retenção — adaptada ao motivo

**Nenhum valor de desconto está definido aqui.** Estrutura apenas — os números
ficam para aprovação do César (ver "Gate humano").

| Motivo | Resposta proposta | Precisa de decisão humana? |
|---|---|---|
| `price` | Duas rotas sem inventar desconto novo: **(a)** se está no plano mensal, mostrar quanto economizaria no anual — hoje $29,90/mês × 12 = $358,80 vs. $269,00/ano, **~25% mais barato só de mudar de ciclo**, sem precisar de cupom novo; **(b)** cupom de desconto temporário, se o time quiser ir além disso. | (a) não — é matemática do preço já público. (b) sim — % e duração. |
| `resolved` | Sem oferta de desconto (não faz sentido pagar por algo que não vai usar). Oferecer **pausar** em vez de cancelar, se a Stripe/produto suportar, ou perguntar se aceita virar depoimento/case. | Sim — se "pausar assinatura" é um recurso que queremos construir. |
| `not_using` | Sem desconto — reengajamento: mostrar 1 coisa concreta e não usada ainda (kit do visto dela, documento faltando) e perguntar se um e-mail com dicas de uso ajudaria antes de decidir. | Não — é conteúdo, não oferta. |
| `prefer_lawyer` | Oferecer conexão com a rede de profissionais (`/profissionais`) como complemento, não substituto — immigrei não compete com o advogado, organiza para ele. | Não — já é uma feature existente. |
| `missing_feature` | Captar o que falta no campo livre, sem oferta — é insumo de produto. | Não. |
| `other` | Sem oferta padrão; segue para o campo livre. | Não. |

> **Gate humano (regra do skill, não é opcional):** qualquer % de desconto,
> duração de cupom, ou menção a preço na tela ou no e-mail precisa ser
> aprovado pelo César antes de ir ao ar. Este documento **propõe estrutura**,
> não valores. A rota (a) do motivo `price` é a única que não depende de um
> número novo — é o preço anual que já está live.

---

## Implementação, se aprovado

1. **Schema:** migration para `cancellation_feedback` (acima).
2. **API:** `app/api/subscriptions/cancel/route.ts` — recebe `{ reason,
   reasonDetail, offerAccepted }`. Se `offerAccepted`, aplica cupom Stripe
   (`stripe.subscriptions.update(subId, { discounts: [{ coupon:
   STRIPE_COUPON_RETENTION }] })` — mesmo padrão de env override que
   `STRIPE_PRICE_MONTHLY`/`STRIPE_PRICE_ANNUAL` em `lib/stripe.ts`) e grava
   `outcome: 'retained'`. Senão, `stripe.subscriptions.update(subId, {
   cancel_at_period_end: true })` e grava `outcome: 'cancelled'` — o webhook
   existente cuida do resto (fluxo 08).
3. **UI:** nova tela/modal em `/perfil`, troca o botão que hoje chama
   `/api/stripe/portal` direto para cancelamento — o portal continua sendo
   usado para as outras ações de billing.
4. **Cupom Stripe:** precisa existir na conta antes do código rodar — criado
   manualmente no Dashboard (não pela API), com % e duração definidos pelo
   César.

## Métricas
- `outcome = 'retained'` vs `'cancelled'` por `reason` — a tabela em si já é
  o dashboard de retenção.
- Evento PostHog: `cancellation_flow_started`, `cancellation_offer_shown`,
  `cancellation_offer_accepted`.
