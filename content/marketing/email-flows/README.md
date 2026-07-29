# Fluxos de e-mail — Immigrei

Specs dos fluxos de ciclo de vida. **Nada aqui dispara para usuário real sem
aprovação do César** — estes arquivos são desenho, não implementação.

Status: `RASCUNHO — aguardando revisão humana` (28 jul 2026)

---

## 1. O princípio: fato vs. leitura do fato

O corte entre Retrato (grátis) e Jornada (pago) **não é quais e-mails a pessoa
recebe** — é o quanto de interpretação cada e-mail carrega.

| | Retrato (grátis) | Jornada (pago) |
|---|---|---|
| **O que entrega** | O fato, traduzido | O fato + o que significa + o próximo passo |
| **Exemplo** | "Seu caso mudou para *Case Was Received*." | "…isso significa que o relógio das 15 semanas começou hoje. Seu próximo passo é X, e você tem até DD/MM." |
| **Fecha com** | Ponte: *"o que isso significa na sua jornada →"* | O passo concreto, dentro do app |

Isso é deliberado e é a mesma linha do paywall do produto: o concorrente
(Lawfully) mostra o badge de status; o Immigrei explica o que fazer com ele.
O grátis precisa valer sozinho — senão a pessoa cancela e some — mas cada
e-mail é um lembrete concreto do que ela ainda não está vendo.

**Regra de ouro:** nunca mande um e-mail grátis que a pessoa leia e pense
"pronto, resolvi". Mande um que ela leia e pense "certo, e agora?".

---

## 2. Transacional ≠ marketing

Separação obrigatória — não é preferência de estilo, é requisito legal
(CAN-SPAM nos EUA, LGPD para quem está no Brasil).

**Transacional** — serviço sobre a conta/caso da própria pessoa. Não precisa de
opt-in de marketing, não leva conteúdo promocional:
- Mudança de status do caso (`sendCaseStatusUpdate`)
- Prazo do I-94 (`sendI94DeadlineAlert`)
- Visa Bulletin (`sendBulletinUpdate`)
- Consulado itinerante (`sendConsuladoAlert`) — opt-in próprio via `consulate_subscriptions`
- Dunning (falha de pagamento) — é sobre a assinatura dela
- Boas-vindas pós-cadastro (parte de serviço; ver ressalva no fluxo 01)

**Marketing** — exige consentimento registrado + unsubscribe funcionando:
- Newsletter mensal
- Reativação
- Qualquer e-mail cujo objetivo primário seja converter para pago

A **ponte** ("o que isso significa na sua jornada →") dentro de um e-mail
transacional é a zona cinzenta. A leitura conservadora, e a que recomendo:
uma linha de contexto + link para o app é continuação do serviço, não oferta.
**Não pode** virar bloco de preço, desconto ou "assine agora por US$ 29,90" —
isso transforma o e-mail em marketing e contamina o stream transacional.

> **Gate humano:** toda linguagem de consentimento e qualquer menção a preço
> ou oferta precisa passar pelo César antes de ir ao ar.

### Separação de subdomínio (quando o e-mail de immigrei.com subir)
- Transacional: `notify.immigrei.com`
- Marketing: `mail.immigrei.com`
- SPF, DKIM e DMARC nos dois.

Motivo: uma reclamação de spam na newsletter não pode derrubar a entrega do
alerta de status — que é o núcleo do produto. Hoje tudo sai do sandbox do
Resend (`onboarding@resend.dev`), então essa separação ainda não existe.

---

## 3. Lacunas de schema que bloqueiam parte destes fluxos

Verificado direto no banco em 28/07/2026 (`profiles` tem 17 colunas):

| Falta | Bloqueia | Proposta |
|---|---|---|
| Campo de consentimento de marketing | Newsletter, reativação | `023_email_consent.sql` (escrito, **não aplicado**) |
| Registro de último acesso | Fluxo 05 (reativação) | Ver nota no fluxo 05 — usar PostHog ou adicionar coluna |

Não existe hoje nenhum e-mail disparado no cadastro real via Clerk — o
`sendWaitlistWelcome` responde apenas à waitlist, que é outro público.

---

## 4. Shell HTML compartilhada

Todos os templates reusam a mesma casca do `lib/notifications.ts` (inline CSS,
560px, fundo cream). Para não repetir 200 linhas em cada spec, os fluxos abaixo
descrevem só o **miolo**; a casca é esta:

```html
<!DOCTYPE html>
<html lang="pt-BR">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="margin:0;padding:0;background:#F4EEE2;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">
  <div style="max-width:560px;margin:0 auto;padding:40px 20px;">
    <!-- Logo (mesmo bloco dos templates existentes) -->
    <!-- MIOLO -->
    <!-- Footer: endereço físico + unsubscribe quando for marketing -->
  </div>
</body>
</html>
```

Paleta: pine `#1E5E4E`, pine-deep `#164A3D`, amber `#E8A33D`, amber-tint
`#FBEDD4`, cream `#F4EEE2`, cream-2 `#FBF7EF`, ink `#1B2520`, sage `#5E9E81`,
clay `#C2542F`.

Assuntos: ≤50 caracteres, começando com emoji, como os templates atuais.

---

## 5. Índice

| # | Fluxo | Tipo | Status |
|---|---|---|---|
| 01 | [Boas-vindas + ativação](01-welcome-activation.md) | Transacional | Rascunho |
| 02 | [Nudge de ativação](02-activation-nudge.md) | Transacional | Rascunho |
| 03 | [Grátis → pago](03-free-to-paid.md) | Marketing | Rascunho |
| 04 | [Dunning](04-dunning.md) | Transacional | Rascunho |
| 05 | [Reativação](05-reactivation.md) | Marketing | Rascunho — bloqueado por schema |
