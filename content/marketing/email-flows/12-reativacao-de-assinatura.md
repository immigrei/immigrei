# Fluxo 12 — Reativação de assinatura

**Tipo:** transacional — confirma uma ação que a própria pessoa acabou de
tomar na conta dela.
**Objetivo:** fechar o gap que o próprio fluxo 08 já tinha previsto e
deixado em aberto ("não precisa de e-mail de reativação confirmada no
escopo mínimo, mas é um fluxo natural se fizer sentido depois") — a reunião
de 7/8 com o Felipe confirmou que faz sentido agora, dentro do pedido maior
de mapear todo cenário de mudança de assinatura.

Status: `RASCUNHO — aguardando revisão humana`

---

## Gatilho

Alguém que já tinha `cancel_at_period_end: true` (passou pelo fluxo 07,
seguiu para o 08) muda de ideia **antes** do `current_period_end` e reativa
pelo Billing Portal. A Stripe manda `customer.subscription.updated` de novo,
com o flip inverso do que o fluxo 08 detecta:

```ts
// mesmo case "customer.subscription.updated" — checar o flip oposto,
// ao lado do bloco que já detecta cancel_at_period_end false→true:
const previous = event.data.previous_attributes as Partial<Stripe.Subscription> | undefined;
if (!sub.cancel_at_period_end && previous && previous.cancel_at_period_end === true) {
  // + await sendSubscriptionReactivated({ to, userName, ... })
  // + notifySlackAlert também — reativação é boa notícia, o time gosta de saber.
}
```

```sql
-- Auditoria manual — o disparo real é por webhook.
select p.email, p.full_name, s.plan, s.current_period_end, s.updated_at
from subscriptions s
join profiles p on p.clerk_user_id = s.user_id
where s.stripe_subscription_id = '{{SUBSCRIPTION_ID}}';
```

---

## Sequência

Um único e-mail, disparado no momento da reativação.

### E-mail único — imediato

**Assunto A:** `Bem-vinda de volta à Jornada` (28 char)
**Assunto B:** `✅ Sua assinatura foi reativada` (30 char)
**Preview:** `Cancelamos o cancelamento — nada foi perdido.`

Princípio: é a única mensagem de todo o ciclo de vida com licença para soar
genuinamente contente, sem ressalva nenhuma — a pessoa quase saiu e decidiu
ficar. Não é o lugar para reforçar valor (ela já converteu duas vezes), é o
lugar para tirar qualquer atrito residual da cabeça dela.

```html
<h1 style="font-size:26px;font-weight:600;color:#1B2520;margin:0 0 8px;line-height:1.2;">
  Que bom que você ficou
</h1>
<p style="font-size:15px;color:#55615A;margin:0 0 24px;">
  Olá{{#if userName}}, {{userName}}{{/if}}! Sua assinatura da Jornada foi
  reativada — o cancelamento não vai mais acontecer.
</p>

<div style="background:#E4EFE9;border-radius:12px;padding:16px 20px;margin:0 0 24px;">
  <p style="font-size:15px;font-weight:700;color:#164A3D;margin:0 0 4px;">
    Nada foi perdido
  </p>
  <p style="font-size:14px;color:#55615A;margin:0;line-height:1.5;">
    Seu histórico, seus documentos e seu progresso no checklist continuam
    exatamente do jeito que você deixou. Próxima cobrança em
    {{currentPeriodEndFormatted}}.
  </p>
</div>

<a href="{{APP_URL}}/dashboard"
   style="display:block;background:#1E5E4E;color:#FBF7EF;text-align:center;padding:16px;border-radius:14px;text-decoration:none;font-size:16px;font-weight:700;">
  Ver minha jornada →
</a>
```

**Plain-text fallback:** "Sua assinatura immigrei Jornada foi reativada.
Nada foi perdido — próxima cobrança em {{currentPeriodEndFormatted}}.
{{APP_URL}}/dashboard."

---

## Exit conditions
N/A — e-mail único, sem sequência.

## Métricas
- Evento PostHog: `subscription_reactivated_email_sent`.
- Métrica de produto a acompanhar (não deste e-mail em si): quantas
  reativações vêm de quem passou pela oferta do fluxo 07 vs. quem cancelou
  sem ver oferta nenhuma (Billing Portal direto, antes do 07 existir) — mede
  se a tela de retenção está funcionando.

## Nota de implementação
- Nova função `sendSubscriptionReactivated(...)` em `lib/notifications.ts`.
- Detecção do flip inverso no mesmo bloco do webhook que já trata o fluxo 08
  — ver Gatilho acima.
- Mesma dependência de `EMAIL_FROM`/domínio verificado dos fluxos 06/08/09/10.
