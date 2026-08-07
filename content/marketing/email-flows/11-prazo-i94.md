# Fluxo 11 — Prazo do I-94

**Tipo:** transacional. **Já implementado e em produção** — `sendI94DeadlineAlert`
e `sendI94ReminderToFillIn` em `lib/notifications.ts`, disparados pelo cron
diário `app/api/cron/i94-deadlines/route.ts`. Este arquivo é documentação
retroativa: o fluxo nunca tinha entrado neste índice, e a pergunta "onde o
I-94 entra na jornada de comunicação" apareceu na revisão de 7/8/2026.

Status: `IMPLEMENTADO — gate de onboarding/idade da conta aplicado em 7/8/2026. Ainda falta o item 1 (introduzir o conceito no fluxo 01) — depende do fluxo 01 virar código.`

---

## O que já existe (código real, não spec)

Dois e-mails, mesmo cron:

**1. `sendI94DeadlineAlert`** — dispara quando `i94_expiry_date` está
preenchido e `daysUntilI94Expiry()` bate um dos marcos fixos:
`{30, 14, 7, 3, 1, 0, -1}` dias. Um envio por marco, nunca repetido — por
isso marco fixo em vez de "dias restantes <= N". O corpo muda de tom
conforme a urgência (`vencido` / `hoje` / `daysLeft`), com cores diferentes
(pine → amber → clay) e explica o que cada janela significa: "-1" já é
presença irregular; "0" é o último dia para protocolar em status válido.

**2. `sendI94ReminderToFillIn`** — dispara quando `i94_expiry_date` está
**vazio** e `i94_reminder_sent_at` também está vazio (envio único, para
sempre, marcado depois do disparo). Hoje **não tem filtro de tempo desde o
cadastro nem de onboarding concluído** — dispara para qualquer perfil sem a
data, o que pode incluir gente que acabou de criar conta e nem chegou perto
do dashboard ainda.

---

## Onde o I-94 entra na jornada hoje (e o problema)

O campo `i94_expiry_date` só aparece em `app/dashboard/I94Field.tsx` — ou
seja, a pessoa só descobre que isso existe se **ela chegar sozinha** no
dashboard e notar o campo. Não faz parte do onboarding, não é mencionado no
e-mail de boas-vindas (fluxo 01), e o único gatilho de comunicação proativa
é o lembrete de campo vazio acima — que pode chegar antes da pessoa sequer
saber o que é I-94.

**Isso inverte a ordem certa:** hoje o produto pede o dado antes de explicar
por que ele importa. A revisão de 7/8 pediu para conectar "o assunto do
e-mail com o momento da jornada" — para o I-94 especificamente, isso
significa apresentar o conceito **antes** de cobrar o dado, não депois.

### Proposta de reposicionamento

1. **Introduzir o I-94 no fluxo 01 (boas-vindas)**, não como campo a
   preencher, mas como conceito: uma linha curta no e-mail 1 ou 2
   explicando que existe uma segunda data que importa além do visto — sem
   pedir ação ainda, só plantando o conceito antes do lembrete cobrar.
2. **Gatear `sendI94ReminderToFillIn` por `onboarding_completed = true` e
   conta com ≥7 dias** (mesma janela do fluxo 02, segmento A — ajustada de
   3 para 7 dias em 7/8/2026, padrão early-stage) — **implementado** em
   `app/api/cron/i94-deadlines/route.ts`.
3. Manter os marcos de `sendI94DeadlineAlert` como estão — esse e-mail já
   segue as regras novas (contexto real, urgência clara sem ser alarmista,
   explica o que cada marco significa).

---

## Explicação de sigla (regra 1.1 da revisão)

Nenhum dos dois templates atuais expande "I-94" na primeira menção — os
dois abrem direto com "Seu I-94 vence...". Ajuste de copy pendente:

```diff
- Seu I-94 vence em {{data}}
+ Seu I-94 (o comprovante da sua entrada nos EUA) vence em {{data}}
```

Só na primeira menção de cada e-mail; da segunda em diante, só a sigla.

---

## Nota de implementação
- Reposicionamento (item 1 acima): linha nova no miolo do fluxo 01 —
  editar `01-welcome-activation.md`, sem mudar o código de `sendWelcome`
  (que ainda não existe — ver nota de implementação do fluxo 01).
- Gate de onboarding/idade da conta (item 2): editar o `SELECT` da segunda
  passada em `app/api/cron/i94-deadlines/route.ts` — adicionar
  `.eq("onboarding_completed", true)` e uma janela de `created_at`, mesmo
  padrão SQL do fluxo 02.
- Expansão de sigla (acima): editar `sendI94DeadlineAlert` e
  `sendI94ReminderToFillIn` em `lib/notifications.ts` diretamente — não
  depende de nenhuma migration ou dado novo.
