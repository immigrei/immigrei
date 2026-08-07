# Fluxo 09 — Troca de ciclo (mensal ↔ anual)

**Tipo:** transacional — confirma uma mudança que a própria pessoa fez na
assinatura dela.
**Objetivo:** fechar uma lacuna encontrada na revisão de 7/8/2026 — hoje,
trocar de mensal para anual (ou o inverso) pelo Billing Portal não gera
absolutamente nada: nem e-mail, nem alerta interno no Slack.

Status: `RASCUNHO — aguardando revisão humana`

---

## Gatilho

Webhook da Stripe, `customer.subscription.updated`, no mesmo handler que já
existe em `app/api/webhooks/stripe/route.ts`. Hoje esse case só olha o flip
de `cancel_at_period_end` — precisa de uma segunda checagem, comparando o
`price.id` do evento com o `previous_attributes.items` (a Stripe manda o item
anterior dentro de `previous_attributes` quando o preço muda).

```ts
// mesmo case "customer.subscription.updated" — adicionar ao lado do bloco
// que já detecta o flip de cancelamento:
const previousItems = (event.data.previous_attributes as any)?.items?.data;
const previousPriceId = previousItems?.[0]?.price?.id;
const currentPriceId = sub.items.data[0]?.price.id;
if (previousPriceId && currentPriceId && previousPriceId !== currentPriceId) {
  const fromPlan = planFromPriceId(previousPriceId);
  const toPlan = planFromPriceId(currentPriceId);
  if (fromPlan && toPlan && fromPlan !== toPlan) {
    // + await sendPlanCycleChanged({ to, userName, fromPlan, toPlan, ... })
    // + notifySlackAlert também, pelo mesmo motivo do cancelamento: o time
    //   quer saber, e hoje não sabe.
  }
}
```

> **Confirmar a forma exata de `previous_attributes.items`** antes de
> implementar — a Stripe às vezes manda o array completo, às vezes só o
> diff. Testar contra um evento real no modo teste antes de confiar no
> parsing acima.

```sql
-- Auditoria manual — o disparo real é por webhook.
select p.email, p.full_name, s.plan, s.current_period_end, s.updated_at
from subscriptions s
join profiles p on p.clerk_user_id = s.user_id
where s.stripe_subscription_id = '{{SUBSCRIPTION_ID}}';
```

---

## Sequência

Um único e-mail, disparado no momento da troca. Mesmo corpo para os dois
sentidos (mensal→anual e anual→mensal), com o bloco de comparação invertendo.

### E-mail único — imediato

**Assunto A (mensal→anual):** `✅ Você trocou para o plano anual` (33 char)
**Assunto B (anual→mensal):** `Sua assinatura agora é mensal` (30 char)
**Preview:** `Confirmando a troca — aqui está o que muda na sua cobrança.`

```html
<h1 style="font-size:26px;font-weight:600;color:#1B2520;margin:0 0 8px;line-height:1.2;">
  Troca de ciclo confirmada
</h1>
<p style="font-size:15px;color:#55615A;margin:0 0 24px;">
  Olá{{#if userName}}, {{userName}}{{/if}}! Sua assinatura da Jornada mudou de
  {{fromCycleLabel}} para {{toCycleLabel}}. Nada muda no acesso — só a forma
  de cobrança.
</p>

<div style="background:#E4EFE9;border-radius:12px;padding:16px 20px;margin:0 0 20px;">
  <p style="font-size:15px;font-weight:700;color:#164A3D;margin:0 0 4px;">
    immigrei Jornada — {{toCycleLabel}}
  </p>
  <p style="font-size:14px;color:#55615A;margin:0;">
    {{newAmountFormatted}} · próxima cobrança em {{currentPeriodEndFormatted}}
  </p>
</div>

{{#if switchedToAnnual}}
<div style="background:#FBEDD4;border-radius:10px;padding:14px 16px;margin:0 0 24px;">
  <p style="font-size:14px;line-height:1.6;color:#55615A;margin:0;">
    No anual, os US$ 269 equivalem a 9 meses do preço mensal — a economia já
    está aplicada na cobrança acima, nenhuma ação extra necessária.
  </p>
</div>
{{/if}}

<a href="{{APP_URL}}/dashboard"
   style="display:block;background:#1E5E4E;color:#FBF7EF;text-align:center;padding:16px;border-radius:14px;text-decoration:none;font-size:16px;font-weight:700;margin-bottom:12px;">
  Ver minha jornada →
</a>
<a href="{{invoiceUrl}}" target="_blank"
   style="display:block;background:transparent;color:#8B958F;text-align:center;padding:8px;text-decoration:underline;font-size:13px;">
  Ver detalhes da cobrança
</a>
```

Nota de copy: o bloco de economia só entra quando a troca foi para o anual —
citar valor aqui é informar a cobrança que já aconteceu, não uma oferta, por
isso não passa pelo mesmo gate de marketing do fluxo 03. Ainda assim, **o
texto exato precisa de aprovação do César antes de ir ao ar**, mesma regra
de todo e-mail que menciona número.

**Plain-text fallback:** "Sua assinatura immigrei Jornada mudou para
{{toCycleLabel}}. Próxima cobrança: {{newAmountFormatted}} em
{{currentPeriodEndFormatted}}. Detalhes em {{APP_URL}}/dashboard."

---

## Exit conditions
N/A — e-mail único, sem sequência.

## Métricas
- Evento PostHog: `subscription_cycle_changed_email_sent`.
- Acompanhar de longe: se e-mails de troca mensal→anual sobem depois que
  este fluxo existe, é sinal de que a economia estava invisível antes.

## Nota de implementação
- Nova função `sendPlanCycleChanged(...)` em `lib/notifications.ts`.
- Detecção de troca de preço no webhook (ver Gatilho acima) — hoje **não
  existe nenhum código** olhando para mudança de `price.id` numa assinatura
  já ativa, nem para gerar e-mail nem para alertar o Slack.
- Mesma dependência de domínio verificado do `EMAIL_FROM` já citada nos
  fluxos 06/08.
