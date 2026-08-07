# Fluxo 10 — Acesso encerrado (fim do período)

**Tipo:** transacional — é o fim de fato do que o fluxo 08 só avisou que ia
acontecer.
**Objetivo:** cobrir o outro lado do "para de pagar mas continua usando
partes do produto", levantado na revisão de 7/8/2026 — hoje a pessoa não
recebe nada no momento em que a Jornada realmente vira Retrato.

Status: `RASCUNHO — aguardando revisão humana`

---

## Por que isso é um e-mail diferente do 08

O 08 dispara quando `cancel_at_period_end` vira `true` — a pessoa acabou de
cancelar, mas ainda tem semanas de acesso pago pela frente. Este fluxo
dispara em `customer.subscription.deleted`, o evento que a Stripe manda
quando o período realmente termina. Já é tratado no webhook hoje — só com
Slack, igual a todos os outros antes desta revisão:

```ts
// app/api/webhooks/stripe/route.ts — dentro de
// case "customer.subscription.updated": case "customer.subscription.deleted":
if (event.type === "customer.subscription.deleted") {
  await notifySlackAlert(/* ... já existe ... */);
  // + await sendAccessEnded({ to, userName, ... })
}
```

Isso também cobre o caso de dunning esgotado: se os 3 toques do fluxo 04 não
recuperarem a cobrança, a Stripe cancela a assinatura sozinha e o mesmo
evento dispara — não precisa de lógica nova para diferenciar "cancelou por
opção" de "cancelou por falta de pagamento", o e-mail serve para os dois.

```sql
-- Auditoria manual — o disparo real é por webhook.
select p.email, p.full_name, s.plan, s.updated_at
from subscriptions s
join profiles p on p.clerk_user_id = s.user_id
where s.stripe_subscription_id = '{{SUBSCRIPTION_ID}}';
```

---

## Sequência

Um único e-mail, disparado no momento em que o acesso pago de fato acaba.

### E-mail único — imediato

**Assunto A:** `Você voltou para o Retrato` (27 char)
**Assunto B:** `Sua Jornada pausou — o Retrato continua com você` (44 char, revisar tamanho)
**Preview:** `Seu caso continua sendo acompanhado. Veja o que muda a partir de agora.`

Princípio da revisão de 7/8: este é exatamente o e-mail que "só cobra ou só
avisa prazo" mais facilmente viraria — em vez disso, ele existe para deixar
claro **o que a pessoa ainda tem** (Retrato é gratuito e permanente) e **o
que especificamente ficou para trás**, sem soar como pressão de reconversão.

```html
<h1 style="font-size:26px;font-weight:600;color:#1B2520;margin:0 0 8px;line-height:1.2;">
  Você está no Retrato agora
</h1>
<p style="font-size:15px;color:#55615A;margin:0 0 24px;">
  Olá{{#if userName}}, {{userName}}{{/if}}. Sua assinatura da Jornada
  terminou — mas sua conta continua ativa, no plano gratuito.
</p>

<div style="background:#E4EFE9;border-radius:12px;padding:16px 20px;margin:0 0 20px;">
  <p style="font-size:15px;font-weight:700;color:#164A3D;margin:0 0 4px;">
    O que continua com você, sem custo
  </p>
  <p style="font-size:14px;line-height:1.6;color:#55615A;margin:0;">
    Seu caso {{#if case_receipt}}<strong style="color:#1B2520;">{{case_receipt}}</strong>{{/if}}
    segue sendo acompanhado e você continua recebendo os alertas de status.
    Seus documentos continuam guardados no cofre — só o upload de novos é
    que fica pausado.
  </p>
</div>

<div style="background:#F4EEE2;border-radius:10px;padding:14px 16px;margin:0 0 24px;">
  <p style="font-size:12px;color:#8B958F;margin:0 0 6px;text-transform:uppercase;letter-spacing:.08em;font-weight:700;">O que fica para trás</p>
  <p style="font-size:14px;line-height:1.6;color:#55615A;margin:0;">
    A leitura do que cada mudança de status significa, os kits de protocolo
    passo a passo e o acesso completo ao cofre de documentos.
  </p>
</div>

<a href="{{APP_URL}}/planos"
   style="display:block;background:#1E5E4E;color:#FBF7EF;text-align:center;padding:16px;border-radius:14px;text-decoration:none;font-size:16px;font-weight:700;">
  Ver a Jornada de novo →
</a>
```

> **Gate humano:** o CTA final aponta para `/planos`, mas o corpo não pode
> citar preço nem desconto — vira e-mail de marketing na hora. Se algum dia
> quisermos incluir uma oferta de retorno aqui, isso é uma decisão de
> produto separada (provavelmente uma variação do fluxo 03), não um ajuste
> discreto neste e-mail transacional.

**Plain-text fallback:** "Sua assinatura immigrei Jornada terminou — você
está no plano Retrato. Seu caso continua sendo acompanhado. Ver planos:
{{APP_URL}}/planos."

---

## Exit conditions
N/A — e-mail único. Se a pessoa assinar de novo depois, isso é o fluxo 06
(confirmação de assinatura) de novo — não precisa de exit condition própria.

## Métricas
- Evento PostHog: `access_ended_email_sent`.
- Métrica indireta: taxa de reassinatura nos 30/60/90 dias seguintes,
  coorte por este e-mail — mede se "o que fica para trás" está claro o
  bastante para trazer gente de volta sem soar a oferta.

## Nota de implementação
- Nova função `sendAccessEnded(...)` em `lib/notifications.ts`.
- Chamada dentro do `case "customer.subscription.deleted"` já existente em
  `app/api/webhooks/stripe/route.ts`, ao lado do `notifySlackAlert`.
- Mesma dependência de `EMAIL_FROM`/domínio verificado dos fluxos 06/08/09.
