# Fluxo 02 — Nudge de ativação

**Tipo:** transacional
**Objetivo:** recuperar quem criou conta, deixou o onboarding pela metade ou
não voltou depois de adicionar o caso.
**Diferença para o fluxo 01:** o 01 pede o primeiro passo nas primeiras 48h.
Este pega quem passou dessa janela e esfriou.

Status: `RASCUNHO — aguardando revisão humana`

---

## Gatilho

Cron diário. Três segmentos mutuamente exclusivos — a pessoa entra em **um** só,
na ordem abaixo.

### Segmento A — onboarding incompleto, ≥3 dias

```sql
-- Criou conta, nunca terminou o onboarding. Sem onboarding não há jornada,
-- e sem jornada o produto não tem o que mostrar.
select p.clerk_user_id, p.email, p.full_name
from profiles p
where p.email is not null
  and coalesce(p.onboarding_completed, false) = false
  and p.created_at between now() - interval '4 days'
                       and now() - interval '3 days';
```

### Segmento B — onboarding feito, sem caso, ≥7 dias

```sql
-- Terminou o onboarding (então sabemos o visto e o objetivo dela), mas nunca
-- rastreou um caso. Passou da janela do fluxo 01.
select p.clerk_user_id, p.email, p.full_name, p.visa_type, p.main_goal
from profiles p
left join user_cases c
  on c.user_id = p.clerk_user_id
 and c.is_active = true
where p.email is not null
  and p.onboarding_completed = true
  and p.created_at between now() - interval '8 days'
                       and now() - interval '7 days'
  and c.id is null
group by p.clerk_user_id, p.email, p.full_name, p.visa_type, p.main_goal;
```

### Segmento C — caso rastreado, nenhum progresso em 14 dias

```sql
-- Tem caso ativo, mas não marcou nada no checklist nem subiu documento.
-- Sinal de que entrou, olhou e não voltou.
select p.clerk_user_id, p.email, p.full_name, c.receipt_number, c.last_status
from profiles p
join user_cases c
  on c.user_id = p.clerk_user_id
 and c.is_active = true
left join user_checklist_items ci on ci.user_id = p.clerk_user_id
left join user_documents      d  on d.user_id  = p.clerk_user_id
where p.email is not null
  and c.created_at between now() - interval '15 days'
                       and now() - interval '14 days'
  and ci.id is null
  and d.id  is null;
```

> Confirmar os nomes de coluna de `user_checklist_items` (migration 016) e
> `user_documents` (013) antes de subir para produção — o `left join` acima
> assume `user_id` em ambas.

---

## Sequência

Um e-mail por segmento. Não há follow-up — se não funcionar, a pessoa cai no
fluxo 05 (reativação) mais tarde. Insistir aqui só gera descadastro.

### A — onboarding incompleto

**Assunto A:** `🧭 Seu mapa está quase pronto` (28 char)
**Assunto B:** `🧭 Faltam 2 minutos do seu mapa` (30 char)
**Preview:** `Você parou no meio. Dá para terminar de onde estava.`

```html
<h1 style="font-size:24px;font-weight:600;color:#1B2520;margin:0 0 14px;line-height:1.3;">
  Você parou no meio do caminho
</h1>

<p style="font-size:16px;line-height:1.6;color:#55615A;margin:0 0 18px;">
  Começou a montar seu mapa mas não terminou. São poucas perguntas — e é o que
  permite a gente mostrar <em>a sua</em> jornada, não uma genérica.
</p>

<p style="font-size:16px;line-height:1.6;color:#55615A;margin:0 0 26px;">
  Suas respostas ficaram salvas. Você continua de onde parou.
</p>

<a href="{{APP_URL}}/onboarding"
   style="display:inline-block;background:#E8A33D;color:#1B2520;font-weight:700;font-size:16px;text-decoration:none;padding:15px 30px;border-radius:12px;">
  Terminar meu mapa →
</a>
```

### B — sem caso rastreado

**Assunto A:** `📋 Você ainda não rastreia nenhum caso` (38 char)
**Assunto B:** `📋 O USCIS pode ter mexido no seu caso` (38 char)
**Preview:** `Sem o número do recibo, a gente não consegue avisar.`

Reusa o miolo do e-mail 2 do fluxo 01, trocando a abertura para
`"Já faz uma semana"`. Não repetir o mesmo texto — quem chegou aqui já ignorou
aquele.

### C — parado depois de rastrear

**Assunto A:** `📌 Seu caso está esperando por você` (35 char)
**Assunto B:** `📌 Um passo pequeno destrava o resto` (36 char)
**Preview:** `Marcar o primeiro item do checklist muda o seu painel.`

```html
<h1 style="font-size:24px;font-weight:600;color:#1B2520;margin:0 0 14px;line-height:1.3;">
  Seu caso está rastreado. E agora?
</h1>

<p style="font-size:16px;line-height:1.6;color:#55615A;margin:0 0 18px;">
  Você adicionou <strong style="color:#1B2520;">{{receipt_number}}</strong> há
  duas semanas — está tudo sendo acompanhado. Mas o painel só vira um plano de
  verdade quando você marca o que já fez.
</p>

<p style="font-size:16px;line-height:1.6;color:#55615A;margin:0 0 26px;">
  Comece por um item só. O seu progresso passa a aparecer na linha do tempo,
  e a gente consegue te avisar do que vem antes de virar urgência.
</p>

<a href="{{APP_URL}}/painel"
   style="display:inline-block;background:#1E5E4E;color:#F4EEE2;font-weight:700;font-size:16px;text-decoration:none;padding:15px 30px;border-radius:12px;">
  Abrir meu painel →
</a>
```

---

## Condições de saída

- Segmento A: `onboarding_completed = true`.
- Segmento B: qualquer caso ativo em `user_cases`.
- Segmento C: qualquer linha em `user_checklist_items` ou `user_documents`.
- Global: já recebeu este fluxo (checar `email_log`) — **máximo um envio por
  pessoa por segmento, para sempre**. Este fluxo não se repete.

## Métricas

| Métrica | Alvo | Como medir |
|---|---|---|
| Abertura | ≥40% | Resend |
| A → onboarding concluído em 72h | ≥20% | PostHog `onboarding_completed` |
| B → caso adicionado em 72h | ≥15% | PostHog `case_added` |
| C → primeiro item marcado em 72h | ≥12% | PostHog `checklist_item_checked` |
| Descadastro | <1% | Resend |

## Implementação

- Cron novo: `app/api/cron/activation-nudge`, diário. Registrar em `vercel.json`.
- Funções `sendActivationNudge{A,B,C}` em `lib/notifications.ts`, ou uma função
  com discriminante de segmento.
- Depende da tabela `email_log` proposta no fluxo 01 — sem ela não há como
  garantir envio único, e o risco de re-enviar toda noite é real.
