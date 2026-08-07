# Fluxo 06 — Confirmação de assinatura

**Tipo:** transacional — recibo de compra sobre a própria conta. Não precisa de
opt-in de marketing, e **não pode** carregar conteúdo promocional (é o mesmo
princípio do fluxo 04: um recibo que vira propaganda contamina o stream
transacional).
**Objetivo:** confirmar que a cobrança passou e a Jornada está ativa —
elimina a ansiedade de "o cartão foi cobrado mas não sei se funcionou" que
apareceu no teste do dia 4/8.

Status: `RASCUNHO — aguardando revisão humana`

---

## Gatilho

Webhook da Stripe, evento `checkout.session.completed` (`mode: "subscription"`),
em `app/api/webhooks/stripe/route.ts`. **O código já resolve tudo que o e-mail
precisa** nesse handler — `sub` (objeto da assinatura) e `plan` já existem nas
linhas onde hoje só disparamos `notifySlackAlert`:

```ts
// app/api/webhooks/stripe/route.ts — dentro do case "checkout.session.completed"
const sub = await stripe.subscriptions.retrieve(session.subscription as string);
await upsertSubscription(userId, sub);
const plan = planFromPriceId(sub.items.data[0]?.price.id ?? "");
// ↓ novo: buscar o e-mail/nome do usuário (profiles) e chamar o Resend aqui,
// antes ou depois do notifySlackAlert — são independentes.
```

`session.customer_details?.email` já vem no payload do próprio evento — não
precisa de round-trip extra ao Supabase para o e-mail, mas o nome (`userName`)
só existe em `profiles`, então uma leitura rápida em `profiles` por
`clerk_user_id = userId` é necessária para personalizar a saudação (mesmo
padrão que os outros templates já usam).

```sql
-- Apenas para auditoria manual do fluxo — o disparo real é por webhook.
select p.email, p.full_name, s.plan, s.current_period_end
from subscriptions s
join profiles p on p.clerk_user_id = s.user_id
where s.stripe_subscription_id = '{{SUBSCRIPTION_ID}}';
```

---

## Sequência

Um único e-mail, disparado imediatamente após o checkout.

### E-mail único — imediato

**Assunto A:** `✅ Sua Jornada está ativa` (26 char)
**Assunto B:** `✅ Assinatura confirmada — immigrei` (35 char)
**Preview:** `Cobrança aprovada. Aqui está o que muda a partir de agora.`

```html
<h1 style="font-size:26px;font-weight:600;color:#1B2520;margin:0 0 8px;line-height:1.2;">
  Sua Jornada está ativa
</h1>
<p style="font-size:15px;color:#55615A;margin:0 0 24px;">
  Olá{{#if userName}}, {{userName}}{{/if}}! A cobrança da sua assinatura foi
  aprovada — a partir de agora você tem acesso completo.
</p>

<div style="background:#E4EFE9;border-radius:12px;padding:16px 20px;margin:0 0 20px;">
  <p style="font-size:15px;font-weight:700;color:#164A3D;margin:0 0 4px;">
    immigrei {{planName}} — {{#if isAnnual}}anual{{else}}mensal{{/if}}
  </p>
  <p style="font-size:14px;color:#55615A;margin:0;">
    {{amountFormatted}} · próxima cobrança em {{currentPeriodEndFormatted}}
  </p>
</div>

<p style="font-size:14px;color:#55615A;line-height:1.6;margin:0 0 24px;">
  A partir de agora sua jornada mostra não só onde você está, mas o que vem
  depois e o que fazer em cada passo — kits completos, documentos organizados
  num só lugar e alertas automáticos do seu caso.
</p>

<a href="{{APP_URL}}/dashboard"
   style="display:block;background:#1E5E4E;color:#FBF7EF;text-align:center;padding:16px;border-radius:14px;text-decoration:none;font-size:16px;font-weight:700;margin-bottom:12px;">
  Ver minha jornada →
</a>
<a href="{{invoiceUrl}}" target="_blank"
   style="display:block;background:transparent;color:#8B958F;text-align:center;padding:8px;text-decoration:underline;font-size:13px;">
  Ver recibo desta cobrança
</a>
```

`invoiceUrl` = `hosted_invoice_url` da fatura gerada pelo `checkout.session.completed`
(`session.invoice`, buscável via `stripe.invoices.retrieve`) — evita reinventar
um recibo quando a Stripe já hospeda um.

**Plain-text fallback:** "Sua Jornada immigrei está ativa. Plano {{planName}}
({{amountFormatted}}), próxima cobrança em {{currentPeriodEndFormatted}}. Acesse
{{APP_URL}}/dashboard."

---

## Exit conditions
N/A — e-mail único, sem sequência.

## Métricas
- Meta de abertura: ≥60% (transacional esperado, sem competir por atenção).
- Evento PostHog: `subscription_confirmation_email_sent` (disparo) — não há
  métrica de conversão associada, é confirmação, não ativação.

## Nota de implementação
- Nova função `sendSubscriptionConfirmed(...)` em `lib/notifications.ts`,
  seguindo exatamente o estilo inline-CSS dos templates existentes.
- Chamada dentro do `case "checkout.session.completed"` em
  `app/api/webhooks/stripe/route.ts`, ao lado do `notifySlackAlert` já
  existente (não substitui o Slack — o time continua querendo saber).
- Depende de `EMAIL_FROM` apontar para um domínio verificado antes de ir para
  produção real — hoje cai no sandbox `onboarding@resend.dev`, que só entrega
  para o e-mail do dono da conta Resend. **Bloqueador de lançamento, não só
  deste fluxo.**
