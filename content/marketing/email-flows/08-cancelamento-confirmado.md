# Fluxo 08 — Cancelamento confirmado

**Tipo:** transacional — é sobre a assinatura da própria pessoa, mesmo
princípio do dunning (fluxo 04). **Não pode** conter oferta, cupom ou preço —
se uma oferta de retenção já foi feita, ela acontece **antes** deste e-mail,
dentro do fluxo 07 (in-app). Este e-mail só confirma o que já foi decidido.
**Objetivo:** eliminar a incerteza que o teste do dia 4/8 expôs — hoje,
cancelar não gera nenhum sinal para o cliente, só um alerta interno no Slack.

Status: `RASCUNHO — aguardando revisão humana`

---

## Gatilho

Mesmo ponto que já existe em `app/api/webhooks/stripe/route.ts`, dentro do
`case "customer.subscription.updated"` — o código já isola exatamente o
momento certo (flip de `cancel_at_period_end` de `false` para `true`, via
`previous_attributes`), hoje usado só para o Slack:

```ts
// já existe — só adicionar o envio ao lado do notifySlackAlert:
if (sub.cancel_at_period_end && previous && "cancel_at_period_end" in previous) {
  await notifySlackAlert(/* ... já existe ... */);
  // + await sendSubscriptionCancelled({ to, userName, accessUntil: ... })
}
```

**Não confundir com `customer.subscription.deleted`** — esse evento (já
tratado separadamente, também só com Slack hoje) é o fim de fato do acesso,
semanas depois. Ele também merece um e-mail eventualmente ("seu acesso
encerrou hoje"), mas ficou fora do escopo mínimo aprovado agora — ver nota de
implementação.

```sql
-- Auditoria manual — o disparo real é por webhook.
select p.email, p.full_name, s.current_period_end, s.updated_at
from subscriptions s
join profiles p on p.clerk_user_id = s.user_id
where s.stripe_subscription_id = '{{SUBSCRIPTION_ID}}';
```

---

## Sequência

Um único e-mail, disparado no momento do cancelamento agendado.

### E-mail único — imediato

**Assunto A:** `Cancelamento confirmado — immigrei` (36 char)
**Assunto B:** `Recebemos seu cancelamento` (27 char)
**Preview:** `Seu acesso continua até {{accessUntilFormatted}}. Sem cobranças depois disso.`

```html
<h1 style="font-size:26px;font-weight:600;color:#1B2520;margin:0 0 8px;line-height:1.2;">
  Cancelamento recebido
</h1>
<p style="font-size:15px;color:#55615A;margin:0 0 24px;">
  Olá{{#if userName}}, {{userName}}{{/if}}. Confirmamos o cancelamento da sua
  assinatura — não vai haver nenhuma nova cobrança.
</p>

<div style="padding:14px 16px;background:#FBEDD4;border-radius:10px;border:1px solid #E8A33D33;margin-bottom:20px;">
  <p style="font-size:15px;font-weight:700;color:#164A3D;margin:0 0 4px;">
    Seu acesso continua até {{accessUntilFormatted}}
  </p>
  <p style="font-size:14px;color:#55615A;margin:0;line-height:1.5;">
    Até lá, sua jornada, seus kits e seu cofre de documentos seguem
    funcionando normalmente.
  </p>
</div>

<p style="font-size:14px;color:#55615A;line-height:1.6;margin:0 0 24px;">
  Mudou de ideia? Você pode reativar a qualquer momento antes de
  {{accessUntilFormatted}} sem perder nada do que já organizou.
</p>

<a href="{{APP_URL}}/perfil"
   style="display:block;background:#1E5E4E;color:#FBF7EF;text-align:center;padding:16px;border-radius:14px;text-decoration:none;font-size:16px;font-weight:700;">
  Gerenciar minha assinatura →
</a>
```

Nota de tom: "reativar" é uma continuidade de serviço (a pessoa já era
assinante), não uma oferta nova — por isso o CTA final pode ficar aqui sem
virar marketing. O que **não pode** entrar é qualquer número (desconto, preço
promocional): isso é o gatilho que classificaria o e-mail como marketing e
exigiria opt-in.

**Plain-text fallback:** "Cancelamento confirmado. Seu acesso immigrei
continua até {{accessUntilFormatted}}, sem novas cobranças. Reative quando
quiser em {{APP_URL}}/perfil."

---

## Exit conditions
N/A — e-mail único. Se a pessoa reativar antes de `current_period_end`, o
`customer.subscription.updated` dispara de novo com `cancel_at_period_end:
false` — não precisa de e-mail de "reativação confirmada" no escopo mínimo,
mas é um fluxo 09 natural se fizer sentido depois.

## Métricas
- Evento PostHog: `subscription_cancellation_email_sent`.
- Métrica indireta a acompanhar: taxa de reativação antes de
  `current_period_end` nos 30 dias após este e-mail — sinal de que o CTA de
  "reativar" está funcionando.

## Nota de implementação
- Nova função `sendSubscriptionCancelled(...)` em `lib/notifications.ts`.
- Chamada dentro do bloco de detecção de flip já existente em
  `app/api/webhooks/stripe/route.ts` (`case "customer.subscription.updated"`).
- **Depende do fluxo 07 estar decidido primeiro**: se o cancelamento passa a
  sair de uma tela própria no app (não mais direto pelo Billing Portal), o
  `cancel_at_period_end: true` ainda é setado via API da Stripe do mesmo jeito
  — este webhook continua sendo o gatilho certo independente de quem chamou a
  API (portal ou fluxo custom).
- `customer.subscription.deleted` (fim de fato do acesso) ficou fora deste
  escopo — se quiser, é uma extensão de uma linha no mesmo padrão.
