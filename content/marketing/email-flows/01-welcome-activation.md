# Fluxo 01 — Boas-vindas + ativação

**Tipo:** transacional
**Objetivo:** pessoa adiciona o primeiro número de recibo em até 48h do cadastro.
**Por que importa:** sem caso rastreado, o produto não tem nada para avisar —
a pessoa nunca recebe o gatilho que traz ela de volta. É o ponto de morte
súbita do funil.

Status: `RASCUNHO — aguardando revisão humana`

> **Revisado em 7/8/2026 (reunião César/Felipe):** a instrução "onde achar
> seu número" não estava clara o bastante, o e-mail não usava nenhum dado
> que já temos da pessoa (visto, objetivo declarado no onboarding), e
> ficou definido que o I-94 entra aqui — mas só quando o visto dela
> realmente depende dele, não em todo envio.

---

## Gatilho

Conta criada via Clerk. **Hoje não existe nada disparando nisso** — o
`sendWaitlistWelcome` responde à waitlist, que é público diferente (pessoa que
deixou e-mail antes de existir conta).

Ponto de implementação: `app/api/webhooks/clerk/route.ts`, no evento
`user.created`, depois do insert em `profiles`.

Não é cron — é evento. Não precisa de SQL de segmento para o e-mail 1.

Segmento para o e-mail 2 (48h sem caso), read-only:

```sql
-- Contas criadas há 44–52h, onboarding feito, sem nenhum caso rastreado.
-- Janela de 8h para tolerar o horário em que o cron roda.
select p.clerk_user_id, p.email, p.full_name, p.visa_type, p.main_goal
from profiles p
left join user_cases c
  on c.user_id = p.clerk_user_id
 and c.is_active = true
where p.email is not null
  and p.created_at between now() - interval '52 hours'
                       and now() - interval '44 hours'
  and c.id is null
group by p.clerk_user_id, p.email, p.full_name, p.visa_type, p.main_goal;
```

---

## Sequência

### E-mail 1 — imediato, no cadastro

**Assunto A:** `👋 Bem-vindo à immigrei` (25 char)
**Assunto B:** `👋 Seu primeiro passo leva 2 minutos` (36 char)

**Preview:** `Adicione seu número de recibo e a gente cuida do resto.`

**Miolo:**

```html
<h1 style="font-size:26px;font-weight:600;color:#1B2520;margin:0 0 14px;line-height:1.25;">
  Que bom ter você aqui.
</h1>

<p style="font-size:16px;line-height:1.6;color:#55615A;margin:0 0 18px;">
  A gente sabe como é: o sistema americano não foi feito para ser entendido.
  Site em inglês, prazo que ninguém explica, advogado cobrando US$ 300 para
  uma ligação de 15 minutos.
</p>

<p style="font-size:16px;line-height:1.6;color:#55615A;margin:0 0 26px;">
  A immigrei existe para você não precisar adivinhar. E começa com um passo só:
  <strong style="color:#1B2520;">adicionar o número do seu recibo.</strong>
  A partir daí, toda vez que o USCIS mexer no seu caso, você fica sabendo —
  em português, no seu e-mail, sem precisar entrar em site nenhum.
</p>

<div style="background:#FBF7EF;border:1px solid #E4EFE9;border-radius:16px;padding:20px;margin:0 0 26px;">
  <p style="font-size:13px;font-weight:700;text-transform:uppercase;letter-spacing:1.2px;color:#8B958F;margin:0 0 8px;">
    Onde achar seu número
  </p>
  <p style="font-size:15px;line-height:1.6;color:#55615A;margin:0 0 10px;">
    Ele fica no seu <strong style="color:#1B2520;">Notice of Action</strong>
    (formulário <strong style="color:#1B2520;">I-797</strong> — o recibo
    oficial que o USCIS manda por correio ou e-mail depois que você
    protocola algo). Procure o campo escrito
    <strong style="color:#1B2520;">"USCIS Receipt Number"</strong>, no canto
    superior esquerdo da página, logo abaixo da data.
  </p>
  <p style="font-size:15px;line-height:1.6;color:#55615A;margin:0;">
    São sempre 3 letras seguidas de 10 números — por exemplo,
    <strong style="color:#1B2520;">IOE0912345678</strong>. Não confunda com
    o "Case ID" ou com qualquer número impresso no topo da página: é
    especificamente o campo com esse nome.
  </p>
</div>

<a href="{{APP_URL}}/dashboard"
   style="display:inline-block;background:#E8A33D;color:#1B2520;font-weight:700;font-size:16px;text-decoration:none;padding:15px 30px;border-radius:12px;">
  Adicionar meu caso →
</a>

<p style="font-size:14px;line-height:1.6;color:#8B958F;margin:26px 0 0;">
  Ainda não tem um caso protocolado? Sem problema — o
  <a href="{{APP_URL}}/onboarding" style="color:#1E5E4E;">seu mapa de jornada</a>
  já está montado e mostra o que vem antes.
</p>
```

**Texto puro:**
```
Que bom ter você aqui.

A gente sabe como é: o sistema americano não foi feito para ser entendido.
Site em inglês, prazo que ninguém explica, advogado cobrando US$ 300 por
uma ligação de 15 minutos.

A immigrei existe para você não precisar adivinhar. E começa com um passo só:
adicionar o número do seu recibo. A partir daí, toda vez que o USCIS mexer no
seu caso, você fica sabendo — em português, no seu e-mail.

Onde achar: no seu Notice of Action (I-797, o recibo oficial do USCIS).
Procure o campo "USCIS Receipt Number", canto superior esquerdo, abaixo da
data. 3 letras + 10 números, tipo IOE0912345678 — não confundir com o
"Case ID" nem com o número no topo da página.

Adicionar meu caso: {{APP_URL}}/dashboard

Ainda não protocolou nada? Seu mapa de jornada já está montado:
{{APP_URL}}/onboarding
```

> **Sobre personalizar o e-mail 1 com visto/objetivo:** discutido na reunião
> de 7/8, mas **não dá para fazer neste e-mail especificamente** — ele
> dispara no `user.created` do Clerk, antes da pessoa passar pelo
> onboarding (`/onboarding`), então `profiles.visa_type` e `main_goal`
> ainda não existem nesse momento. A personalização (e a menção
> condicional ao I-94, também discutida) entra no **e-mail 2** abaixo, que
> já dispara depois da janela de onboarding e já teria esse dado.

---

### E-mail 2 — 48h depois, só se ainda não houver caso

**Assunto A:** `📋 Faltou o número do seu recibo` (32 char)
**Assunto B:** `📋 Seu caso ainda está no escuro` (32 char)

**Preview:** `Sem ele, a gente não consegue te avisar quando algo mudar.`

**Miolo:** versão curta — reconhece o obstáculo mais provável em vez de repetir
o pedido. Já personalizada: se `visa_type`/`main_goal` existirem (onboarding
concluído), a abertura cita o visto pelo nome em vez de ficar genérica, e o
aviso sobre o I-94 só entra quando `profiles.location = 'eua'` — quem ainda
está no Brasil não tem I-94 para rastrear, então a menção correta é omitida,
não adaptada. Esse é o campo já existente que resolve o "nem todo processo
depende do I-94" da reunião de 7/8.

```html
<h1 style="font-size:24px;font-weight:600;color:#1B2520;margin:0 0 14px;line-height:1.3;">
  Travou em algum ponto{{#if visaTypeLabel}} com o {{visaTypeLabel}}{{/if}}?
</h1>

<p style="font-size:16px;line-height:1.6;color:#55615A;margin:0 0 18px;">
  Você criou sua conta há dois dias, mas ainda não adicionou um caso. Os dois
  motivos mais comuns:
</p>

<p style="font-size:15px;line-height:1.6;color:#55615A;margin:0 0 12px;">
  <strong style="color:#1B2520;">Não achou o número.</strong><br>
  Ele fica no I-797 (o Notice of Action do USCIS), no campo "USCIS Receipt
  Number" — 3 letras e 10 números. Se você protocolou por advogado, peça a
  ele o "receipt number".
</p>

<p style="font-size:15px;line-height:1.6;color:#55615A;margin:0 0 24px;">
  <strong style="color:#1B2520;">Ainda não protocolou nada.</strong><br>
  Aí o rastreamento não se aplica por enquanto — mas
  <a href="{{APP_URL}}/painel" style="color:#1E5E4E;">seu painel</a>
  já mostra o que precisa acontecer antes{{#if mainGoalLabel}}, rumo a
  {{mainGoalLabel}}{{/if}}.
</p>

{{#if showI94Note}}
<div style="background:#E4EFE9;border-radius:12px;padding:16px;margin:0 0 24px;">
  <p style="font-size:14px;line-height:1.6;color:#164A3D;margin:0;">
    <strong>Já que você está nos EUA:</strong> vale conferir também o prazo
    do seu I-94 (o comprovante da sua entrada no país) — é uma data
    diferente da validade do visto, e a gente só consegue te avisar do
    vencimento se você cadastrar ela no painel.
  </p>
</div>
{{/if}}

<a href="{{APP_URL}}/dashboard"
   style="display:inline-block;background:#1E5E4E;color:#F4EEE2;font-weight:700;font-size:15px;text-decoration:none;padding:14px 28px;border-radius:12px;">
  Tentar de novo →
</a>
```

`visaTypeLabel`/`mainGoalLabel` vêm do `profiles` já lido no SQL do
segmento acima — omitir o `{{#if}}` inteiro quando vazio, nunca mostrar
"Travou em algum ponto com o null?". `showI94Note` = `location === 'eua'`,
calculado no código do envio, não no template.

---

## Condições de saída

- Adicionou qualquer caso ativo em `user_cases` → sai antes do e-mail 2.
- Conta deletada.
- Bounce permanente ou marcação de spam → suprime o endereço.

## Métricas

| Métrica | Alvo | Como medir |
|---|---|---|
| Abertura e-mail 1 | ≥55% | Resend |
| Ativação em 48h (caso adicionado) | ≥35% | PostHog: `case_added`, coorte por `created_at` |
| Ativação em 7 dias | ≥50% | mesmo evento, janela maior |
| Descadastro | <0,5% | Resend |

Se o e-mail 1 abrir bem mas não converter, o problema é achar o número do
recibo — não a mensagem. Nesse caso o próximo teste é conteúdo (um guia visual
de onde achar), não copy.

## Implementação

- Nova função `sendWelcome` em `lib/notifications.ts`.
- Disparo no `user.created` em `app/api/webhooks/clerk/route.ts` — depois do
  insert em `profiles`, e sem falhar o webhook se o envio der erro (mesmo
  padrão do `app/api/waitlist/route.ts`).
- E-mail 2 precisa de cron novo (`app/api/cron/activation-nudge`), diário,
  com o SQL acima. Adicionar em `vercel.json`.
- Registrar envio para não repetir — sugestão: tabela `email_log`
  (`user_id`, `flow`, `step`, `sent_at`), que também serve aos fluxos 02–05.

> **Nota de consentimento:** este fluxo é serviço (a pessoa criou conta e o
> e-mail é sobre usar a conta), então não exige opt-in de marketing. Mas o
> texto de cadastro precisa deixar claro que a immigrei manda avisos por
> e-mail — César precisa aprovar essa frase antes do go-live.
