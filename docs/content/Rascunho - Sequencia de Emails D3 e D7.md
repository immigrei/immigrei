# Rascunho — Sequência de boas-vindas: e-mails D+3 e D+7

> Claude · 2026-07-02 (madrugada) · **Copy para revisão de Cesar & Felipe — nada será enviado sem aprovação.**
> D0 ("Você está dentro 💚") já está no ar, aprovado. Nome da carta semanal ainda em aberto.

---

## E-mail D+3 — "Os 5 caminhos mais comuns de brasileiros nos EUA"

**Assunto:** Os 5 caminhos que a maioria dos brasileiros segue nos EUA 🧭
**Objetivo:** primeiro valor real; provar competência sem pedir nada.

> Olá! Aqui é o Cesar, da Immigrei.
>
> Enquanto construímos o app, queria te entregar algo útil já: os 5 caminhos que mais vemos brasileiros percorrendo nos EUA — e o primeiro requisito de cada um.
>
> **1. Turista → Estudante (B1/B2 → F-1)** — o caminho mais comum de quem decide ficar mais tempo. Requisito de partida: um I-20 emitido por escola certificada SEVP. Sem ele, nada anda.
>
> **2. Extensão de turismo (B1/B2 + I-539)** — para quem precisa de mais alguns meses. O detalhe que ninguém conta: o protocolo tem que entrar ANTES do vencimento do I-94 — que nem sempre é a data do carimbo no passaporte.
>
> **3. Estudante → Trabalho (F-1 → OPT → H-1B)** — a escada clássica pós-estudos. Cada degrau tem janela de datas própria.
>
> **4. Casamento com cidadão/residente (I-130 + I-485)** — o caminho de família. Muda tudo: você passa de "não-imigrante" para "imigrante", com regras próprias.
>
> **5. Habilidade extraordinária (O-1/EB-2)** — para quem construiu carreira comprovada. Mais raro, mas cada vez mais usado por brasileiros de tech, saúde e esportes.
>
> Qual desses é o seu? No app, cada um vira um mapa com etapas, documentos e prazos — em português.
>
> [CTA: Ver como vai funcionar → /nossa-historia]
>
> *A Immigrei organiza informação; não é aconselhamento jurídico. Cada caso tem particularidades — para decisões, consulte um profissional licenciado.*

**Nota UPL:** o e-mail DESCREVE caminhos e requisitos factuais; nunca diz "o melhor para você é X". O disclaimer fecha.

---

## E-mail D+7 — "Por que dois brasileiros largaram tudo para construir isso"

**Assunto:** A pergunta que não saía da nossa cabeça
**Objetivo:** vínculo + resposta do usuário (melhora entregabilidade no Gmail e segmenta).

> Semana passada você entrou na lista da Immigrei. Hoje quero te contar rapidinho por quê ela existe.
>
> Eu (Cesar) fui para a Austrália. O Felipe, para os EUA. Países diferentes, a mesma cena: madrugada, portal do governo aberto, e a pergunta — **"qual é o meu próximo passo?"**
>
> Advogado cobrava US$ 300 para responder o básico. O Google se contradizia. Os apps mostravam um status em inglês e paravam aí.
>
> Então estamos construindo o que procuramos e não achamos: sua jornada completa, em português, com cada etapa clara — e alertas que trabalham enquanto você dorme.
>
> **Me responde uma coisa?** (é só apertar responder) — *Em que momento você está: turista, estudante, trabalho, green card, ou ainda no Brasil?* Cada resposta molda o que construímos primeiro.
>
> Abraço,
> Cesar & Felipe
>
> [CTA secundário: Indicar para alguém no WhatsApp]

**Nota técnica:** "responda este e-mail" exige trocar o remetente da sequência de noreply@ para um endereço monitorado (ex.: ola@immigrei.com — criar no Resend/inbound ou redirecionar). Decidir antes de ativar.

---

## Infra necessária para ativar (build de ~1 sessão)
1. Coluna `welcome_stage` ou tabela `email_queue` na waitlist + **cron diário** (Vercel cron já existe como padrão no projeto)
2. **Link de descadastro** (obrigatório — CAN-SPAM): rota `/api/unsubscribe?token=...` + coluna `unsubscribed`
3. Remetente respondível para o D+7 (ola@immigrei.com)
4. Depois: a carta semanal (nome pendente) usa a mesma infra
