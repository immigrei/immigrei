# Fluxo 03 — Retrato → Jornada

**Tipo:** MARKETING — exige consentimento registrado e unsubscribe funcionando.
**Objetivo:** converter quem já usa o grátis de verdade e bateu num limite real.
**Regra que define o fluxo:** só entra quem **encostou no paywall**. Nunca
mandar oferta para quem ainda não sentiu falta de nada — é o caminho mais rápido
para o descadastro.

> ⚠️ **Bloqueado até:** (a) migration de consentimento aplicada, e (b) César
> aprovar a linguagem de preço. Este arquivo menciona valores; nada aqui vai ao
> ar sem esse aval.

Status: `RASCUNHO — aguardando revisão humana`

---

## Gatilho

Não é tempo desde o cadastro — é comportamento. Três entradas, por prioridade:

### Entrada 1 — bateu no gate (a mais forte)

O sinal vem do PostHog, não do banco: o usuário viu o `PaywallGate` no
`/painel` ou no cofre, ou levou 403 de `/api/user-documents` ou `/api/community`.

Evento a instrumentar (ainda **não existe** — ver Implementação):
`paywall_hit`, com propriedade `surface` (`painel` | `cofre` | `comunidade`).

Segmento: ≥2 `paywall_hit` em 7 dias, plano grátis.

### Entrada 2 — usuário ativo no grátis, sem nunca ter batido no gate

```sql
-- Rastreia caso, mexeu no checklist, conta com mais de 10 dias, sem assinatura.
-- Pessoa que tira valor real do Retrato: é a que tem chance de ver valor no
-- Jornada. Quem não usa o grátis não vai pagar pelo pago.
select p.clerk_user_id, p.email, p.full_name, p.visa_type, p.main_goal,
       c.receipt_number, c.last_status,
       count(distinct ci.id) as itens_marcados
from profiles p
join user_cases c
  on c.user_id = p.clerk_user_id
 and c.is_active = true
join user_checklist_items ci on ci.user_id = p.clerk_user_id
left join subscriptions s
  on s.user_id = p.clerk_user_id
 and s.status in ('active', 'trialing', 'past_due')
where p.email is not null
  and p.created_at < now() - interval '10 days'
  and s.id is null
group by p.clerk_user_id, p.email, p.full_name, p.visa_type, p.main_goal,
         c.receipt_number, c.last_status
having count(distinct ci.id) >= 3;
```

### Entrada 3 — momento de urgência real

Caso mudou para um status que abre janela de ação com prazo (aprovação que
inicia contagem, RFE, decisão). Aqui a diferença entre Retrato e Jornada fica
concreta sozinha — a pessoa acabou de receber "mudou para X" sem saber o que
fazer.

```sql
-- Mudança de status nas últimas 24h, usuário no grátis.
-- Confirmar nomes de coluna de case_history (migration 006) antes de usar.
select p.clerk_user_id, p.email, p.full_name, c.receipt_number, c.last_status
from profiles p
join user_cases   c on c.user_id = p.clerk_user_id and c.is_active = true
join case_history h on h.case_id = c.id
left join subscriptions s
  on s.user_id = p.clerk_user_id
 and s.status in ('active', 'trialing', 'past_due')
where p.email is not null
  and s.id is null
  and h.created_at > now() - interval '24 hours';
```

---

## Sequência

**Máximo 2 e-mails, com 5 dias entre eles.** Um terceiro não converte — só
queima o endereço.

### E-mail 1 — o que você não está vendo

**Assunto A:** `🔓 O que falta no seu painel` (28 char)
**Assunto B:** `🔓 Você viu o retrato. Falta o caminho` (38 char)
**Preview:** `Sua jornada completa, etapa por etapa, com prazos.`

Princípio: **mostrar a lacuna específica que a pessoa encostou**, não listar
features. O `{{surface}}` vem do `paywall_hit`.

```html
<h1 style="font-size:26px;font-weight:600;color:#1B2520;margin:0 0 14px;line-height:1.25;">
  Você já sabe onde está.<br>Falta saber para onde vai.
</h1>

<p style="font-size:16px;line-height:1.6;color:#55615A;margin:0 0 20px;">
  O Retrato te mostra o seu caso em tempo real — e isso continua seu, de graça,
  para sempre. Mas saber que o status mudou é diferente de saber
  <strong style="color:#1B2520;">o que fazer a respeito</strong>.
</p>

<div style="background:#FBF7EF;border:1px solid #E4EFE9;border-radius:16px;padding:22px;margin:0 0 24px;">
  <p style="font-size:13px;font-weight:700;text-transform:uppercase;letter-spacing:1.2px;color:#8B958F;margin:0 0 12px;">
    O que a Jornada abre
  </p>
  <p style="font-size:15px;line-height:1.6;color:#55615A;margin:0 0 10px;">
    <strong style="color:#1B2520;">Sua jornada inteira</strong> — cada etapa na
    ordem certa, com o prazo de cada uma e o que trava se você pular.
  </p>
  <p style="font-size:15px;line-height:1.6;color:#55615A;margin:0 0 10px;">
    <strong style="color:#1B2520;">Kits passo a passo</strong> — o manual do seu
    tipo de visto, incluindo quem <em>não</em> pode seguir por ali e por quê.
  </p>
  <p style="font-size:15px;line-height:1.6;color:#55615A;margin:0;">
    <strong style="color:#1B2520;">Cofre de documentos</strong> — tudo ligado ao
    checklist certo, na hora que o consulado pedir.
  </p>
</div>

<a href="{{APP_URL}}/planos"
   style="display:inline-block;background:#E8A33D;color:#1B2520;font-weight:700;font-size:16px;text-decoration:none;padding:15px 30px;border-radius:12px;">
  Ver a Jornada →
</a>

<p style="font-size:14px;line-height:1.6;color:#8B958F;margin:24px 0 0;">
  US$ 29,90 por mês, cancela quando quiser. No plano anual sai por
  US$ 269 — equivale a 9 meses.
</p>
```

### E-mail 2 — 5 dias depois, só se não converteu

**Assunto A:** `🗺️ Uma pergunta honesta` (23 char)
**Assunto B:** `🗺️ O que está te segurando?` (27 char)
**Preview:** `Se não é a hora, tudo bem — o Retrato continua seu.`

Princípio: não repetir a oferta. Reconhecer a hesitação e dar saída digna —
quem não converte aqui precisa continuar gostando da marca.

```html
<h1 style="font-size:24px;font-weight:600;color:#1B2520;margin:0 0 14px;line-height:1.3;">
  Se não for a hora, tudo bem
</h1>

<p style="font-size:16px;line-height:1.6;color:#55615A;margin:0 0 18px;">
  A gente mandou um e-mail sobre a Jornada e você não seguiu adiante — isso é
  uma resposta legítima. O Retrato continua seu, sem prazo para acabar.
</p>

<p style="font-size:16px;line-height:1.6;color:#55615A;margin:0 0 24px;">
  Só uma coisa antes de a gente parar de falar disso: se você travou por não
  saber se a Jornada cobre o <em>seu</em> caso especificamente, responde este
  e-mail. Uma pessoa de verdade lê e responde.
</p>

<a href="{{APP_URL}}/planos"
   style="display:inline-block;background:#1E5E4E;color:#F4EEE2;font-weight:700;font-size:15px;text-decoration:none;padding:14px 28px;border-radius:12px;">
  Ver o que está incluído →
</a>
```

> A frase "uma pessoa de verdade lê e responde" **só pode ir ao ar depois que
> existir canal de suporte** — hoje não existe e-mail de contato monitorado.
> Prometer resposta e não responder é pior que não prometer.

---

## Condições de saída

- Assinou (linha em `subscriptions` com status ativo) → sai imediatamente.
- Descadastrou de marketing → sai de tudo neste fluxo.
- Já recebeu os 2 e-mails → não reentra por 90 dias.
- Caso arquivado / conta inativa.

## Métricas

| Métrica | Alvo | Como medir |
|---|---|---|
| Abertura e-mail 1 | ≥45% | Resend |
| Clique para `/planos` | ≥12% | PostHog `pricing_viewed` com `source=email` |
| Conversão em 7 dias | ≥3% | `subscriptions` novo, coorte por envio |
| Descadastro | <2% | Resend |
| Escolha do anual | acompanhar | `plan` na `subscriptions` |

Conversão de 3% em e-mail frio de upgrade é o piso do razoável. Abaixo de 1,5%
o problema não é a copy — é o gatilho estar pegando gente que não usa o produto.

## Implementação

1. **Instrumentar `paywall_hit` no PostHog** — não existe hoje. Sem esse evento,
   a Entrada 1 (a mais forte) não funciona. Pontos: `PaywallGate` (montagem),
   e os 403 em `app/api/user-documents/route.ts` e `app/api/community/*`.
2. Migration de consentimento aplicada + unsubscribe funcionando.
3. Cron `app/api/cron/upgrade-nudge`, diário, com os segmentos acima.
4. `sendUpgradeNudge` em `lib/notifications.ts` — **stream de marketing**,
   footer com endereço físico e link de descadastro.
5. `email_log` para não reenviar.

> **Gate humano obrigatório:** este fluxo cita preço. Nada sai sem César
> aprovar o texto final.
