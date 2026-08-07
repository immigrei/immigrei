# Fluxo 04 — Dunning (falha de pagamento)

**Tipo:** transacional — é sobre a assinatura da própria pessoa. Não precisa de
opt-in de marketing, e **não pode** carregar conteúdo promocional.
**Objetivo:** recuperar cobrança falhada antes do cancelamento automático.
**Por que é o fluxo de maior retorno por hora de trabalho:** essas pessoas já
decidiram pagar. Perder por cartão vencido é receita evaporando sem nenhum
problema de produto por trás.

Status: `RASCUNHO — aguardando revisão humana`

> **Revisado em 7/8/2026:** a versão original soava de ultimato nos toques 2
> e 3 ("último aviso", "recusadas") e nenhum dos três toques carregava valor
> além de "atualize o cartão". Reescrito abaixo: tom mais parceiro, cada
> toque com uma informação real (não só cobrança), e o toque 2 — que só
> existia em prosa ("mesma estrutura") — ganhou corpo próprio.

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

Personalização em todos os três toques: `{{case_receipt}}` e
`{{case_status_traduzido}}` vêm de `user_cases` (join por `user_id`) — já
existem hoje, sem instrumentação nova. Se a pessoa não tem caso rastreado, o
bloco de contexto do caso simplesmente não entra (checar `{{#if case_receipt}}`).

### Toque 1 — dia 0, tom neutro

**Assunto A:** `💳 Não conseguimos processar seu pagamento` (42 char)
**Assunto B:** `💳 Um problema com seu cartão` (29 char)
**Preview:** `Seu acesso continua ativo. É só atualizar o cartão.`

Princípio: presumir causa banal. A maioria é cartão expirado, não falta de
dinheiro — tratar como acusação perde cliente que ia pagar. Valor adicionado:
o status do caso dela continua ali, provando que nada parou.

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

{{#if case_receipt}}
<div style="background:#F4EEE2;border-radius:10px;padding:14px 16px;margin:0 0 24px;">
  <p style="font-size:12px;color:#8B958F;margin:0 0 4px;text-transform:uppercase;letter-spacing:.08em;font-weight:700;">Seu caso, sem interrupção</p>
  <p style="font-size:14px;color:#55615A;margin:0;"><strong style="color:#1B2520;">{{case_receipt}}</strong> — {{case_status_traduzido}}</p>
</div>
{{/if}}

<a href="{{BILLING_PORTAL_URL}}"
   style="display:inline-block;background:#E8A33D;color:#1B2520;font-weight:700;font-size:16px;text-decoration:none;padding:15px 30px;border-radius:12px;">
  Atualizar forma de pagamento →
</a>
```

### Toque 2 — dia 3

**Assunto A:** `💳 Seu pagamento ainda está pendente` (36 char)
**Assunto B:** `⏳ Faltam alguns dias do seu acesso` (35 char)
**Preview:** `Ainda dá tempo de resolver sem perder nada.`

Mesma base do toque 1, com a data concreta em que o acesso pausa — vagueza
aqui reduz conversão — e uma camada de valor diferente: em vez de repetir o
aviso, mostra **uma coisa concreta que fica esperando** dentro da Jornada
(kit ou checklist pendente), para lembrar o que está em jogo sem soar a
segunda cobrança do mesmo aviso.

> **Revisado de novo em 7/8** (reunião César/Felipe): a primeira versão
> abria com "Ainda não conseguimos confirmar seu pagamento" — ainda soava
> frio para um segundo toque. Reescrito para abrir pelo que continua
> funcionando, não pelo problema.

```html
<h1 style="font-size:24px;font-weight:600;color:#1B2520;margin:0 0 14px;line-height:1.3;">
  Sua Jornada segue com você — só o cartão que falta resolver
</h1>

<p style="font-size:16px;line-height:1.6;color:#55615A;margin:0 0 18px;">
  Já se passaram 3 dias desde a primeira tentativa de cobrança, e o acesso
  completo continua ativo normalmente. Só para não te pegar de surpresa: se
  o cartão não for atualizado até
  <strong style="color:#1B2520;">{{pause_date_formatted}}</strong>, aí sim o
  acesso pausa — o rastreamento do seu caso, esse, nunca para.
</p>

{{#if pending_checklist_item}}
<div style="background:#FBF7EF;border:1px solid #E4EFE9;border-radius:12px;padding:16px;margin:0 0 24px;">
  <p style="font-size:12px;color:#8B958F;margin:0 0 6px;text-transform:uppercase;letter-spacing:.08em;font-weight:700;">Enquanto isso, um passo que ainda está aberto</p>
  <p style="font-size:14px;line-height:1.6;color:#55615A;margin:0;">{{pending_checklist_item}} — é rápido de resolver e já fica marcado no seu painel.</p>
</div>
{{/if}}

<a href="{{BILLING_PORTAL_URL}}"
   style="display:inline-block;background:#E8A33D;color:#1B2520;font-weight:700;font-size:16px;text-decoration:none;padding:15px 30px;border-radius:12px;">
  Atualizar forma de pagamento →
</a>
```

### Toque 3 — dia 7, último

**Assunto A:** `Seu acesso completo pausa amanhã` (33 char)
**Assunto B:** `Um lembrete final sobre sua Jornada` (36 char)
**Preview:** `Nada é apagado — e você reativa quando quiser.`

Tom revisado: tirado "último aviso" e "recusadas" (linguagem de ultimato).
Informa o prazo real com a mesma clareza — a urgência é verdadeira e precisa
continuar clara — mas descreve o que acontece em vez de cobrar. Mantém a
tranquilização de que nada é apagado e acrescenta o que exatamente muda,
para não deixar a ameaça vaga.

```html
<h1 style="font-size:24px;font-weight:600;color:#1B2520;margin:0 0 14px;line-height:1.3;">
  Amanhã sua Jornada pausa
</h1>

<p style="font-size:16px;line-height:1.6;color:#55615A;margin:0 0 18px;">
  Tentamos cobrar três vezes nos últimos sete dias e não conseguimos. Se o
  cartão não for atualizado até amanhã, sua assinatura pausa e sua conta
  volta para o Retrato.
</p>

<div style="background:#E4EFE9;border-radius:12px;padding:16px;margin:0 0 20px;">
  <p style="font-size:15px;line-height:1.6;color:#164A3D;margin:0;">
    <strong>Nada é apagado.</strong> Seu caso continua rastreado, seus
    documentos continuam no cofre, e você recebe os alertas de status
    normalmente — isso nunca depende da assinatura.
  </p>
</div>

<div style="background:#F4EEE2;border-radius:10px;padding:14px 16px;margin:0 0 24px;">
  <p style="font-size:12px;color:#8B958F;margin:0 0 6px;text-transform:uppercase;letter-spacing:.08em;font-weight:700;">O que pausa, especificamente</p>
  <p style="font-size:14px;line-height:1.6;color:#55615A;margin:0;">
    A jornada completa (o próximo passo interpretado, não só o status), os
    kits de protocolo e o acesso ao cofre de documentos. Tudo volta no
    instante em que você reativar — nada precisa ser refeito.
  </p>
</div>

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
