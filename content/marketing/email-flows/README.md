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

### 1.1 Regras de copy (revisão de 7 ago 2026)

Saíram da revisão dos 12 criativos com você e o Felipe — valem para os
fluxos já escritos (retrabalho pendente) e para todo fluxo novo:

1. **Todo e-mail carrega algum valor, mesmo o de cobrança.** Nenhuma
   mensagem pode ser só "pague" ou só "seu prazo acabou" — sempre entra um
   pedaço de contexto, orientação ou link que ajuda a pessoa mesmo que ela
   não clique no CTA principal. Dunning é o pior ofensor hoje — ver revisão
   no fluxo 04.
2. **Cobrança não é acusação.** Presumir causa banal (cartão vencido, não
   falta de dinheiro) já era a regra no fluxo 04 — a revisão pediu para isso
   se refletir também no *tom* dos toques 2 e 3, que hoje soam de ultimato
   mais do que os toques 1.
3. **Siglas ganham o nome em inglês + explicação em português na primeira
   menção do e-mail.** Nunca assumir que "I-94", "RFE" ou "I-797" já são
   conhecidos — ex.: `I-94 (o comprovante da sua entrada nos EUA)`. Da
   segunda menção em diante no mesmo e-mail, pode usar só a sigla.
   > **Pendência:** "DCO" foi citado na reunião de 7/8 como exemplo de sigla
   > sem explicação — não encontrei essa sigla em nenhum e-mail, kit ou
   > página do repositório hoje (`grep -rn "DCO"` sem resultado). Se for
   > "Designated School Official" (comum em conteúdo de F-1), me diga onde
   > ela aparece — provavelmente um kit em `app/documentos/`, não um destes
   > fluxos — para eu aplicar a regra no lugar certo.
4. **Personalizar pelo contexto real do usuário**, não só pelo nome. Quando
   o dado existir (visto, status do caso, receipt number, dias restantes),
   ele entra no corpo do e-mail — não só o assunto genérico do template.
   Cada spec abaixo já indica quais campos existem hoje (`profiles`,
   `user_cases`) vs. quais dependem de instrumentação nova.
5. **Reforçar o valor da Jornada sempre que fizer sentido no fluxo**, não só
   nos e-mails de conversão (03). Um e-mail transacional pode fechar com uma
   linha do tipo "isso é o que a Jornada mostra automaticamente" sem virar
   oferta — é a mesma "ponte" da seção 1, só que citada como lembrete factual
   de um recurso que existe, nunca com preço.

### 1.2 Sinal, recibo ou funil (formalizado em 7/8/2026)

Toda vez que um fluxo é escrito ou revisado, classifique antes de mexer na
copy — a regra do valor (CLAUDE.md §3, "Regra do valor") pesa diferente em
cada bucket:

| Bucket | O que faz | Fluxos | Risco de soar vendedor |
|---|---|---|---|
| **Sinal** | Reporta um fato, não pede nada | 11 (I-94), e os já em produção (status de caso, visa bulletin, consulado) | Nenhum — não há pedido para amortecer |
| **Recibo** | Confirma o que a pessoa já decidiu | 06, 08, 09, 10, 12 | Baixo — cuidado é não enfiar upsell debaixo da confirmação |
| **Funil** | Pede uma ação | 01, 02, 03, 04, 07 | **Alto — aqui a regra do valor é obrigatória, não opcional** |

Não force grounding de conceito jurídico em todo fluxo funil — só onde o
tema realmente é o assunto do momento (I-94/I-797 em 01/02 fazem sentido;
forçar um conceito jurídico dentro do 04, que é sobre cobrança, soaria
colado). Nesses casos o valor vem de contexto de produto (status do caso,
item do checklist), que já é a abordagem usada no 04.

**Registro do que já está fundamentado** (não re-pesquisar — usar):
| Termo | Fonte já existente | Onde já é citado |
|---|---|---|
| I-94 | `content/leis/conceitos/status-vs-visto.md` (cbp.gov, INA §101/§214) | `lib/faqBank.ts`, fluxo 01/02/11 |
| I-797 | `lib/formGlossary.ts` (entrada `"I-797"`) | fluxo 01 |
| Status vs. visto | `content/leis/conceitos/status-vs-visto.md` | — |
| Unlawful presence | `content/leis/conceitos/unlawful-presence.md` | `lib/faqBank.ts` |
| Priority date | `content/leis/conceitos/priority-date.md` | — |

Termo que aparecer numa copy nova e não estiver nesta tabela nem em
`content/leis/`: siga o processo de `content/leis/fontes.md` (fontes
oficiais listadas lá, propor arquivo novo) — e adicione a linha aqui depois
de resolvido, para o próximo fluxo não repetir a pesquisa.

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

### Escopo do Resend (confirmado na reunião de 7/8)

O Resend cobre **todo** transacional e lifecycle deste índice — onboarding,
cobrança, cancelamento, mudança de plano. Ele **não** é a ferramenta para
campanha de marketing em base externa (lista comprada, lista importada de
outro lugar) — isso exigiria uma ferramenta separada e, mais importante,
não tem base nenhuma disso hoje: os únicos destinatários de qualquer fluxo
aqui são pessoas que criaram conta ou entraram na waitlist. Não é uma
decisão pendente, é só o registro de que a pergunta foi feita e a resposta
é "sim, um único remetente cobre tudo que existe hoje".

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
    <div style="text-align:center;margin-bottom:32px;">
      <img src="${APP_URL}/brand/immigrei-icone-verde.svg" width="26" height="26" alt="" style="vertical-align:middle;margin-right:8px;">
      <span style="font-family:Georgia,'Times New Roman',serif;font-size:24px;font-weight:700;color:#1E5E4E;letter-spacing:-.5px;vertical-align:middle;">immigrei</span>
    </div>
    <!-- MIOLO -->
    <!-- Footer: endereço físico + unsubscribe quando for marketing -->
  </div>
</body>
</html>
```

> **Corrigido em 7/8/2026 (reunião César/Felipe):** a casca antiga só tinha
> texto ("Immigrei", com I maiúsculo) — sem ícone e com a capitalização
> errada. Regra de marca: **"immigrei" nunca leva maiúscula na primeira
> letra**, nem no logo nem em nenhuma menção da marca. O ícone vem de
> `public/brand/immigrei-icone-verde.svg` (traço pine sobre fundo claro —
> use `immigrei-icone-claro.svg`, o inverso, se algum template tiver fundo
> escuro). **Já corrigido nas 6 funções de `lib/notifications.ts`** — os
> fluxos 01–12 deste índice ainda têm a casca antiga nos snippets HTML
> (retrabalho pendente, mesma correção).
>
> Ainda não existe um arquivo de logo **landscape** (ícone + wordmark) no
> repo — só os ícones isolados em `public/brand/`. O lockup acima (ícone +
> texto lado a lado) é a alternativa até um landscape de verdade existir;
> troque pelo arquivo landscape assim que ele for exportado.

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
| 06 | [Confirmação de assinatura](06-confirmacao-assinatura.md) | Transacional | Rascunho |
| 07 | [Retenção no cancelamento](07-retencao-cancelamento.md) | Híbrido (tela in-app + gatilha o 08) | Rascunho — decisão de produto pendente |
| 08 | [Cancelamento confirmado](08-cancelamento-confirmado.md) | Transacional | Rascunho |
| 09 | [Troca de ciclo (mensal ↔ anual)](09-troca-de-ciclo.md) | Transacional | Rascunho — nasceu da revisão de 7/8 |
| 10 | [Acesso encerrado (fim do período)](10-acesso-encerrado.md) | Transacional | Rascunho — nasceu da revisão de 7/8 |
| 11 | [Prazo do I-94](11-prazo-i94.md) | Transacional | **Já implementado** (`sendI94DeadlineAlert`, `sendI94ReminderToFillIn`) — documentação retroativa |
| 12 | [Reativação de assinatura](12-reativacao-de-assinatura.md) | Transacional | Rascunho — nasceu da revisão de 7/8 |

Numeração segue a ordem real de disparo: 06 no checkout, 07 é a tela que
intercepta o clique de cancelar (pode nunca chegar a gerar e-mail, se a
pessoa aceitar a oferta), 08 só dispara se ela insistir em cancelar depois
do 07.

Fluxos 06–08 nasceram do teste de compra real do dia 4/8/2026, que expôs que
**nenhum evento de assinatura hoje gera e-mail para o cliente** — o webhook
Stripe só dispara alertas internos no Slack (`notifySlackAlert`). Ver contexto
completo nos próprios arquivos.

Fluxos 09–10 nasceram da revisão de 7/8/2026: perguntamos "já existe fluxo
para mudança de plano?" e a resposta era não — nem mensal↔anual, nem o
momento em que o acesso de fato acaba depois do cancelamento (o 08 só avisa
que *vai* acabar). Upgrade Retrato→Jornada não ganha fluxo novo: é o 06, a
primeira compra já é o único "upgrade" que existe hoje (só há um plano pago).

Fluxo 11 documenta e-mails que **já existem em produção** (`lib/notifications.ts`)
mas nunca tinham entrado neste índice — entraram na revisão porque a pergunta
"onde o I-94 entra na jornada de comunicação" apareceu na reunião de 7/8.

Fluxo 12 é diferente do fluxo 05: o 05 é reengajar quem sumiu do produto
(qualquer plano); o 12 é confirmar que alguém que já tinha cancelado a
assinatura mudou de ideia antes do período acabar. Fechou a lista de
"alteração de status de assinatura" pedida na reunião de 7/8 — junto com os
fluxos 06 (primeira compra/upgrade), 08 (cancelamento), 09 (troca de ciclo)
e 10 (acesso encerrado), todo cenário de mudança de assinatura levantado nas
duas reuniões agora tem um fluxo.
