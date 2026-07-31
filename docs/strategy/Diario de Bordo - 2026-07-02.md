# Immigrei — Diário de Bordo · 2 de julho de 2026

> Sessão com Claude (Fable 5). Tudo abaixo está commitado no repo `immigrei/immigrei` e, salvo indicação, no ar em produção.

---

## ✅ O que foi feito hoje

### 1. Supabase — resgatado e blindado
- Projeto estava **pausado** (free tier) → restaurado no mesmo dia, dados intactos
- **Falha de segurança fechada:** RLS nunca tinha sido aplicado no banco vivo — a chave pública (que vai no navegador de qualquer visitante) conseguia ler todos os perfis com e-mails
- 3 tabelas que só existiam no código foram criadas no banco (`case_history`, `consulate_events`, `consulate_subscriptions`) + coluna `location` pendente
- Migrations 006/007/008 aplicadas e versionadas no repo
- ⚠️ **Rotina nova:** acessar o dashboard do Supabase toda semana para não pausar de novo (decisão: manter free tier)

### 2. immigrei.com — no ar 🌐
- Domínio conectado ao Vercel via Cloudflare (CNAME, DNS-only), SSL ativo
- `www.immigrei.com` → redirect 308 para o apex (depois de um vai-e-vem: chegou a ficar invertido; corrigido)
- **Gate pré-lançamento:** qualquer rota em immigrei.com mostra só a landing; o app completo segue em immigrei.vercel.app para o time

### 3. E-mails oficiais 📧
- Domínio verificado no Resend (já estava, desde junho) + `EMAIL_FROM` configurado no Vercel
- Alertas (USCIS, visa bulletin, consulados) agora saem de **noreply@immigrei.com**
- Testado ponta a ponta, chegando na inbox (não no spam)

### 4. Stripe — ciclo de receita completo 💰
- Produtos criados (test mode): **Base US$ 9/mês**, **Core US$ 29/mês** (Concierge US$ 1.499 fora do checkout — venda manual)
- Página `/planos` + checkout + webhook + tabela `subscriptions`
- **Validado com pagamento de teste real:** checkout → Stripe → webhook (200) → Supabase. Fatura paga, assinatura ativa
- Conta Stripe: "VisaEmDia sandbox" (login visaemdia2026@gmail.com) — renomear para Immigrei antes do lançamento

### 5. Landing page — de esboço a máquina de conversão
Arco completo: hero → 3 pilares → **seção de dor** ("perguntas de madrugada") → **quem somos** (Cesar + Felipe, primeiros nomes e países — decisão consciente até o green card do Felipe resolver) → **FAQ (8 perguntas)** com schema.org para o Google → CTA final repetido
- FAQ fundamentado no relatório de viabilidade (redação UPL-safe), intel da Lawfully e clima 2026 (congelamento de vistos, medo de compartilhamento de dados)
- Decisões: plano grátis mencionado sem preços; lançamento "em breve"; pergunta sensível (status vencido) incluída com tom "sem julgamento"

### 6. Página "Nossa história" 📖
- Narrativa em 3 atos + valores em linguagem quente + CTA
- Segunda página indexável do site (SEO começando)

### 7. Marca e crescimento orgânico
- **Símbolo interino criado:** broto (folha creme + folha amber) — ecoa o 🌱 do onboarding
- **Card de WhatsApp:** preview rico ao compartilhar immigrei.com — poster da marca em fundo pine, wordmark Fraunces
- **Loop de indicação:** botão "Compartilhar no WhatsApp" pós-cadastro E no e-mail de boas-vindas
- Estratégia definida: WhatsApp (grupos de brasileiros) é o canal orgânico primário; SEO por conteúdo vem depois

### 8. E-mail de boas-vindas — v5 aprovada ✉️
- 5 rodadas de revisão (novo fluxo: draft renderizado no chat → aprovação → teste no Gmail → commit)
- Dor fundamentada em dado real: **11 milhões de casos parados no USCIS** + a ligação de US$ 300
- 6 features sem revelar free/pago; monitoramento primeiro; "caminhos possíveis + requisitos" (UPL-safe); kits com "os detalhes que causam negação"; documentos em um lugar só; radar de datas; profissionais como "julgamento humano" — o app nunca passa a bola
- CTA duplo: "Conhecer a nossa história" + "Indicar no WhatsApp"

---

## 📋 Pendências

### Imediatas (Cesar)
- [ ] **Push final** no GitHub Desktop (e-mail v5, commit `d387561`)
- [ ] Revisar com Felipe: página /nossa-historia (o texto é de vocês), FAQ e matriz de planos

### Decisões abertas
- [ ] **Nome da carta semanal:** O Próximo Passo / Radar da Imigração / Papo de Imigrante (critério sugerido: qual o leitor encaminharia com orgulho?)
- [ ] Nome definitivo do "Radar de datas e eventos" (provisório, sem apego)
- [ ] Validar matriz de features por plano com Felipe (está na memória do Claude e no chat de hoje)

### Backlog de produto (compromissos assumidos)
- [ ] **Cofre de documentos** — prometido no e-mail de boas-vindas; não existe no app ainda (hoje /documentos = checklists). Feature de retenção forte
- [ ] Screenshot/preview do produto na landing
- [ ] Select de segmentação no formulário da waitlist ("qual seu momento?")
- [ ] Sequência de boas-vindas D+3 e D+7 + newsletter semanal (precisa: template, cron, **link de descadastro** — obrigatório por lei)

### Lançamento (quando chegar a hora)
- [ ] Clerk produção (pk_live) + desligar login do Facebook (quebrado na instância dev)
- [ ] Stripe: ativar conta live + renomear "VisaEmDia" → Immigrei + preços live (`STRIPE_PRICE_BASE/CORE` no Vercel)
- [ ] Remover o gate da landing no `proxy.ts` (bloco marcado com comentário)
- [ ] Onboarding não coleta `arrival_date` (pendência antiga)

---

## 🧭 Contexto novo: NotebookLM jurídico (sessão Gemini do Cesar)

Registrado na memória do Claude para as próximas sessões. Resumo:

- **Dois notebooks separados:** Estratégia/Produto vs. Motor de Conformidade Legal (nunca misturar — risco de a IA confundir preço de concorrente com taxa oficial da USCIS)
- **Escopo legal do MVP:** Manual USCIS **Volume 2, Parts A, C e F apenas**; formulários I-539/I-539A, I-20, I-765, I-94, e (em pasta separada) I-130 + I-485; grounding em 4 agências (USCIS, CBP, DOS, ICE/SEVP)
- **Os 3 mandamentos UPL** que governam o app:
  1. Nunca sugerir benefício ("recomendamos F-1") — só opções estáticas que o usuário clica
  2. Validações factuais, nunca análise de mérito ("sistema não processa datas retroativas" ✔ / "você está ilegal" ✘)
  3. Doutrina da "máquina de escrever inteligente" — o software posiciona os dados do usuário no PDF, sem aconselhar
- **Ideia guardada:** UX Canvas/conversacional — IA só em via de extração de fatos, proibida de conselho tático
- **Próximos passos do lado Gemini:** system prompts anti-UPL do notebook + modelagem das tabelas Supabase para regras I-539/I-20

## 💡 Sugestão de pauta para amanhã
1. Modelagem das **tabelas Supabase para o fluxo I-539/I-20** (conecta o trabalho do Gemini com o app — posso fazer)
2. **Cofre de documentos** (spec + build — honra a promessa do e-mail)
3. Definir nome da carta semanal e montar a sequência D+3/D+7

---

## 🌙 Turno da madrugada (executado pelo Claude enquanto Cesar dormia)

**Código (commit `d4cc8f0` — local, aguardando seu push):**
- **sitemap.xml e robots.txt de verdade** — descoberta: o gate estava servindo a landing em HTML no lugar do sitemap; o Google receberia lixo. Corrigido e liberado no gate.
- **Select de segmentação na waitlist** — "Qual seu momento?" (opcional): turista / estudante / trabalho / green card / no Brasil / outro. O backend tolera a migration ainda não aplicada (testado: cadastro nunca quebra).
- Migration `009_waitlist_momento.sql` pronta — **rodar no SQL Editor** (Cmd+A, colar, Run).

**Documentos para revisão (nesta pasta):**
- `Proposta - Modelagem Supabase I-539 e Cofre de Documentos.md` — as tabelas do fluxo B1/B2→F-1 seguindo os 3 mandamentos UPL + spec do cofre com alertas de vencimento. 3 decisões marcadas no final.
- `Rascunho - Sequencia de Emails D3 e D7.md` — copy completa dos dois e-mails + lista da infra necessária (descadastro, remetente respondível).

**Checklist matinal do Cesar:**
1. [ ] GitHub Desktop → Push (leva sitemap + select ao ar)
2. [ ] SQL Editor → migration 009 (peça ao Claude para copiar ao clipboard)
3. [ ] Ler as 2 propostas → aprovar/ajustar → Claude constrói
