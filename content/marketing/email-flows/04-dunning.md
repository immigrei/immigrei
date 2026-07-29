# Fluxo 04 — Dunning (falha de pagamento)

**Tipo:** transacional — é sobre a assinatura da própria pessoa. Não precisa de
opt-in de marketing, e **não pode** carregar conteúdo promocional.
**Objetivo:** recuperar cobrança falhada antes do cancelamento automático.
**Por que é o fluxo de maior retorno por hora de trabalho:** essas pessoas já
decidiram pagar. Perder por cartão vencido é receita evaporando sem nenhum
problema de produto por trás.

Status: `RASCUNHO — aguardando revisão humana`

---

## Gatilho

Webhook da Stripe, não cron. O evento `customer.subscription.updated` já chega
em `app/api/webhooks/stripe/route.ts` e grava `status` na tabela
`subscriptions`. Quando o status vira `past_due`, o relógio começa.

> **Detalhe que importa:** `past_due` está em `ACTIVE_STATUSES` no
> [`lib/plan.ts`](../../../lib/plan.ts) — ou seja, a pessoa **continua com
> acesso** durante o dunning. Isso é proposital e correto: cortar o acesso no
> primeiro erro de cartão pune quem só trocou de cartão. Mas significa que o
> e-mail é a única coisa avisando que há um problema.

```sql
-- Assinaturas em past_due, para conferência e reconciliação manual.
-- O disparo real é por webhook; este SELECT é para auditar o fluxo.
select s.user_id, p.email, p.full_name, s.plan, s.status,
       s.current_period_end, s.updated_at
from subscriptions s
join profiles p on p.clerk_user_id = s.user_id
where s.status = 'past_due'
order by s.updated_at asc;
```

Eventos adicionais a tratar (**hoje o webhook não escuta nenhum dos dois**):
- `invoice.payment_failed` — dispara os toques 1 e 2
- `invoice.payment_succeeded` — encerra o fluxo
- `customer.subscription.deleted` — já é tratado; encerra o fluxo

---

## Sequência

Três toques: dia 0, 3 e 7. A Stripe faz as próprias retentativas — alinhar o
calendário com a config de Smart Retries no dashboard para não avisar num dia
em que ela ainda vai tentar sozinha.

### Toque 1 — dia 0, tom neutro

**Assunto A:** `💳 Não conseguimos processar seu pagamento` (42 char)
**Assunto B:** `💳 Um problema com seu cartão` (29 char)
**Preview:** `Seu acesso continua ativo. É só atualizar o cartão.`

Princípio: presumir causa banal. A maioria é cartão expirado, não falta de
dinheiro — tratar como acusação perde cliente que ia pagar.

```html
<h1 style="font-size:24px;font-weight:600;color:#1B2520;margin:0 0 14px;line-height:1.3;">
  Seu pagamento não passou
</h1>

<p style="font-size:16px;line-height:1.6;color:#55615A;margin:0 0 18px;">
  A cobrança da sua Jornada não foi aprovada. Normalmente é o cartão que venceu
  ou um limite momentâneo — nada que não se resolva em um minuto.
</p>

<div style="background:#E4EFE9;border-radius:12px;padding:16px;margin:0 0 24px;">
  <p style="font-size:15px;line-height:1.6;color:#164A3D;margin:0;">
    <strong>Seu acesso continua ativo.</strong> Sua jornada, seus kits e seu
    cofre seguem funcionando enquanto você resolve.
  </p>
</div>

<a href="{{BILLING_PORTAL_URL}}"
   style="display:inline-block;background:#E8A33D;color:#1B2520;font-weight:700;font-size:16px;text-decoration:none;padding:15px 30px;border-radius:12px;">
  Atualizar forma de pagamento →
</a>
```

### Toque 2 — dia 3

**Assunto A:** `💳 Seu pagamento ainda está pendente` (36 char)
**Assunto B:** `⏳ Faltam alguns dias do seu acesso` (35 char)
**Preview:** `Ainda dá tempo de resolver sem perder nada.`

Mesma estrutura, com a data concreta em que o acesso cai. Sem drama, mas com o
prazo explícito — vagueza aqui reduz conversão.

### Toque 3 — dia 7, último

**Assunto A:** `⚠️ Último aviso sobre sua assinatura` (36 char)
**Assunto B:** `⚠️ Sua Jornada será pausada amanhã` (35 char)
**Preview:** `Depois disso seu acesso volta para o Retrato.`

```html
<h1 style="font-size:24px;font-weight:600;color:#1B2520;margin:0 0 14px;line-height:1.3;">
  Amanhã sua Jornada pausa
</h1>

<p style="font-size:16px;line-height:1.6;color:#55615A;margin:0 0 18px;">
  Foram três tentativas de cobrança em sete dias, todas recusadas. Amanhã sua
  assinatura é cancelada e sua conta volta para o Retrato.
</p>

<p style="font-size:16px;line-height:1.6;color:#55615A;margin:0 0 24px;">
  <strong style="color:#1B2520;">Nada é apagado.</strong> Seu caso continua
  rastreado, seus documentos continuam no cofre, e você recebe os alertas de
  status normalmente. O que pausa é a jornada completa, os kits e o acesso ao
  cofre — que voltam no instante em que você reativar.
</p>

<a href="{{BILLING_PORTAL_URL}}"
   style="display:inline-block;background:#1E5E4E;color:#F4EEE2;font-weight:700;font-size:16px;text-decoration:none;padding:15px 30px;border-radius:12px;">
  Resolver agora →
</a>
```

> **Verificar antes de prometer:** o texto diz que os documentos continuam no
> cofre. Confirmar que o downgrade não apaga nada de `user_documents` — hoje o
> gate é de leitura/escrita, não de retenção, então a promessa se sustenta.
> Se isso mudar, o texto muda junto.

---

## Condições de saída

- `invoice.payment_succeeded` ou status volta para `active` → sai na hora.
- `customer.subscription.deleted` → sai (e entra no fluxo 05 depois de 30 dias).
- Cliente cancela por conta própria → sai; não insistir.

## Métricas

| Métrica | Alvo | Como medir |
|---|---|---|
| Abertura toque 1 | ≥60% | Resend |
| Recuperação total (3 toques) | ≥40% | `subscriptions` voltando a `active` |
| Recuperação no toque 1 | ≥25% | mesmo, janela de 72h |
| Cancelamento voluntário durante o fluxo | <5% | Stripe |

Dunning bem feito recupera 30–50% das falhas involuntárias. Abaixo de 20%,
checar primeiro se o e-mail está chegando (deliverability), não a copy.

## Implementação

1. **Adicionar `invoice.payment_failed` e `invoice.payment_succeeded`** ao
   webhook em `app/api/webhooks/stripe/route.ts` e ao endpoint na Stripe — hoje
   ele só escuta `checkout.session.completed`,
   `customer.subscription.updated` e `.deleted`.
2. **Criar o portal de cobrança** (`stripe.billingPortal.sessions.create`) —
   não existe rota para isso. Sem ele, `{{BILLING_PORTAL_URL}}` não tem para
   onde apontar e o fluxo inteiro não funciona.
3. `sendDunning` em `lib/notifications.ts` com discriminante de toque.
4. Agendamento dos toques 2 e 3: cron diário lendo `subscriptions` em
   `past_due` + `email_log`, em vez de depender só do webhook.
5. Alinhar o calendário com Smart Retries da Stripe.
