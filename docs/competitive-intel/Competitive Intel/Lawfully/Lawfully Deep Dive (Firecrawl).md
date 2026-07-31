# Prompt — Intel Profunda do LAWFULLY (Firecrawl, otimizado para tokens)
**Para rodar em:** Claude Code (com Firecrawl MCP + Google Sheets MCP ou Drive)
**Escopo:** apenas **Lawfully** (template reutilizável para Boundless, SimpleCitizen, LegalOS depois)
**Saída:** 1 planilha Google Sheets com 5 abas focadas

---

## Como usar
1. Garanta que o Claude Code tem Firecrawl MCP + Google Sheets/Drive conectados.
2. Cole tudo dentro de `=== PROMPT START ===` / `=== PROMPT END ===` em uma sessão nova.
3. Aprove a criação da planilha quando ele pedir.
4. Tempo esperado: 15-25 min (otimizado, ~70% menos tokens que o prompt agregado).

---

=== PROMPT START ===

Você é um **analista sênior de inteligência competitiva** em legaltech / SaaS de imigração. Sua missão hoje: produzir um dossiê profundo, citado e enxuto sobre o **Lawfully** — uma das 4 incumbentes do mercado de imigração para os EUA. O resultado vai para uma planilha Google Sheets que servirá de base para decisões de produto e GTM de um SaaS Latino-first concorrente.

---

## FACT PACK — o que já sabemos (NÃO reverifique, NÃO gaste tokens scrapeando)

O usuário capturou prints diretos do app iOS do Lawfully. Trate os fatos abaixo como **VERIFICADOS** e use-os como ponto de partida. Sua tarefa é **complementar**, não duplicar.

### Produto (in-app, confirmado)
- **Nome do produto:** Lawfully + "Lawfully Premium" + "Case Analysis Pro" (3 SKUs)
- **Plataformas:** iOS + Android + Web
- **Sistemas rastreados:** USCIS, NVC, EOIR
- **Categorias de caso:** I-539, I-485, I-130, I-765, N-400 (lista completa não-confirmada)
- **Recursos premium:**
  - Tracking USCIS/NVC/EOIR
  - Estimativa de tempo de processamento (por receipt number prefix: MSC, IOE, YSC, EAC, WAC, SRC, MCT, LIN, AAO)
  - "Case Analysis Pro" — donut chart com distribuição de status (Approval/Received/Denied/Rejected/Notice/Transferred/Withdrawal/RFE Response/Card Document/Processing/Others)
  - "Ask Lawfully AI" — até **300 perguntas/mês**
  - USCIS interview reviews (acesso a relatos de entrevistas)
  - Templates de expedite request (download)
  - Cupons de desconto para consulta jurídica + mock interview
- **Métricas que mostram ao usuário:**
  - "Total cases" no período (ex: 216.234 cases em 12 meses)
  - Approval rate global (ex: 70,1%)
  - Approval rate da categoria + RFE rate (84,9% / 5,0% baseado em 1.231.074 casos)
  - "X% fewer/more cases approved this month vs last month"
  - "There are N similar cases"
  - Avg time to approval por receipt prefix (chart de barras com "YOU" destacado)
  - Total avg days da categoria
  - Days since filing + days since last update

### Pricing (in-app, confirmado em USD)
- **Pay Monthly:** $14.99/mês
- **Pay Quarterly:** $34.99 a cada 3 meses ($11.66/mês equivalente)
- Sem plano anual visível na tela mostrada
- Cancelamento a qualquer momento
- **Premium subscribers ativos:** 11.228 (declarado no paywall em mai/2026)

### Dados-chave declarados pelo app
- "We have **20M+ cases** to analyze their status" (claim na tela do trend)
- Approval & RFE rate baseado em **1.231.074 cases** decididos entre mai/2023 – out/2025
- Total avg de 87 dias para a categoria I-539 mostrada
- Compara aplicações por proximidade de data de filing

### Monetização cruzada (in-app, confirmado)
- **Display ads no tier free** (vimos banners de @realty e Word Editor)
- **Referral de consulta jurídica** (cupons → comissão presumida)
- **Subscription** (Premium)

### UX / táticas de growth (in-app, confirmado)
- Countdown de escassez no Case Analysis Pro ("1d 23h 57m left")
- Mascote: Statue of Liberty (acolhedor, não-corporativo)
- Onboarding com pergunta de "Select your nationality" (relevante: nicho de cada nacionalidade)
- "Complete case profile to unlock more insights" — gamificação
- Reviews exibidos no paywall (AppStore + TrustPilot + PlayStore) — prova social
- "11,228 users are enjoying Lawfully Premium" no paywall (FOMO + prova de tração)

### Reviews já vistos no app (in-app, capturados)
1. AppStore 5★ (05/nov/2025): "I was introduced by a friend and that app has helped me with an update until it finally got to NVC."
2. TrustPilot 5★ (17/ago/2025): "Lawfully has been so helpful and accurate giving me information about my case."
3. PlayStore 5★ (16/ago/2025): "An excellent app that provides real-time updates and gives one knowledge about how likely the case will be approved or denied."

---

## SUA TAREFA — preencher 6 lacunas críticas

Tudo acima já está confirmado. Use Firecrawl + WebSearch APENAS para responder as 6 perguntas abaixo, com fonte e nível de confiança (`Alta` / `Média` / `Baixa`).

### Lacuna 1 — Empresa e captação
- Quem é a empresa por trás (entidade jurídica, fundador, ano de fundação, sede)?
- Captação total, rodadas, investidores, valuation
- Equipe (LinkedIn: nº de funcionários, principais cargos)
- Adquiriram alguém? Foram adquiridos?
- **Fontes recomendadas:** crunchbase.com/organization/lawfully, pitchbook.com, linkedin.com/company/lawfully, sec.gov

### Lacuna 2 — Surface oficial completo (lista de URLs)
Faça **`firecrawl_map`** em `https://www.lawfully.com` para descobrir todas as URLs do domínio + subdomínios. Não faça crawl completo — só descubra a estrutura.

Depois, faça **`firecrawl_scrape`** APENAS nas páginas-chave (uma chamada por URL, com `formats: ["markdown"]`, `onlyMainContent: true`):
- `/` (home)
- `/pricing` ou `/premium` (se existir na web — provável que pricing só apareça in-app)
- `/about` ou `/team` ou `/company`
- `/terms` (Terms of Service)
- `/privacy` (Privacy Policy)
- `/blog` (índice) + os 3 artigos mais recentes
- `/case-tracker` ou similar (página de produto)
- Páginas em outros idiomas se houver (ex: `/es`, `/pt`)

Extraia:
- Linguagens oficialmente suportadas no site
- Disclaimer UPL completo (citação literal, ≤ 300 chars)
- Política de reembolso
- Jurisdição declarada
- Lista de tipos de visto explicitamente cobertos

### Lacuna 3 — App Store / Play Store metadata
- iOS App Store: número total de avaliações, rating médio, posição em categorias, última atualização, tamanho do app, idiomas
- Google Play: mesmas métricas + número de downloads
- Histórico de lançamentos (mudanças nos últimos 12 meses, via release notes)
- **Fontes:** appfigures.com, sensortower.com (se acessível), páginas oficiais das lojas

### Lacuna 4 — Reviews externos (cap = 50 reviews totais, priorize qualidade)
Use `firecrawl_search` ou `firecrawl_scrape` direcionado:
- **Trustpilot:** https://www.trustpilot.com/review/lawfully.com — primeiras 2 páginas
- **BBB:** https://www.bbb.org — busca "Lawfully"
- **Reddit:** queries `site:reddit.com lawfully app` e `lawfully review` em r/immigration, r/USCIS, r/h1b — pegue os 10 threads mais comentados
- **App Store reviews:** scrape da página do app — pegue 15 reviews mais recentes (diversifique: 1★, 3★, 5★)
- **Play Store reviews:** mesmo
- **YouTube:** busca `lawfully app review` — 3 vídeos mais vistos, pegue os 5 comentários mais upvotados de cada

Para cada review extraído, registre na aba `02_Reviews`: plataforma, data, rating, idioma, trecho ≤ 200 chars, sentimento (positivo/neutro/negativo), categoria (`Precisão`, `Preço`, `UX`, `Atendimento`, `Privacidade`, `Bug`, `Funcionalidade Premium`, `Outro`).

### Lacuna 5 — Posicionamento, SEO e canais
- Top 10 keywords orgânicas (use SimilarWeb, Semrush ou Ahrefs free preview se acessível)
- Volume mensal de tráfego estimado (SimilarWeb)
- Top fontes de tráfego (organic / direct / paid / social / referral)
- Handles e número de seguidores: Instagram, TikTok, YouTube, X/Twitter, LinkedIn, Facebook
- Frequência de publicação de blog (últimos 6 posts: datas e títulos)
- Tem programa de afiliados? Tem influenciador parceiro recorrente?

### Lacuna 6 — Postura regulatória + ASK LAWFULLY AI (importante)
- Como eles descrevem o "Ask Lawfully AI" nos Termos? É posicionado como informação ou conselho?
- Têm disclaimer específico para o AI feature?
- Algum caso público de UPL, FTC complaint ou processo contra Lawfully? Busque: `"Lawfully" + lawsuit`, `"Lawfully" + UPL`, `"Lawfully" + FTC`, `"Lawfully" + complaint`
- Como tratam dados sensíveis de imigração (LGPD-equivalente americano, HIPAA não aplica, mas tem outras regras)?

---

## ESTRUTURA DA PLANILHA — 5 abas

Crie 1 Google Sheet chamada **`Intel Competitiva — Lawfully (Maio 2026)`**.

### Aba 1 — `00_Resumo Executivo`
Em formato narrativo:
- **2 parágrafos:** o que é o Lawfully em 2026, modelo de negócio, momento atual
- **Tabela: KPIs principais** (preço, usuários Premium, app ratings, captação, posição competitiva)
- **3 bullets — ameaça ao nosso wedge:** por que eles são perigosos para um SaaS Latino-first
- **3 bullets — fraqueza explorável:** onde podemos atacar
- **5 features que devemos COPIAR**
- **5 features que devemos EVITAR**

### Aba 2 — `01_Empresa e Captação`
| Campo | Valor | Fonte (URL) | Confiança |
- Razão social, ano fundação, sede, fundadores
- CEO atual, número de funcionários
- Rodadas: data, valor, lead investor, total acumulado
- Aquisições / partnerships relevantes
- Notícias relevantes últimos 18 meses (5 itens com link)

### Aba 3 — `02_Reviews`
| Plataforma | Data | Rating | Idioma | Trecho (≤200 chars) | Sentimento | Categoria | URL |
- Inclua os 3 reviews já capturados in-app (pré-preencher)
- Mínimo 30 reviews novos, máximo 50 (priorize qualidade > quantidade)
- Última linha: contagem por categoria + média de rating por plataforma

### Aba 4 — `03_Pricing e Features Detalhado`
Cruze SKU × feature × condição:
| SKU | Preço | Frequência | Features inclusas | Limite (se houver) | Garantia | Link |
- Free, Premium Mensal, Premium Trimestral, Case Analysis Pro (se separado)
- Adicione coluna "Nossa proposta (Base $9 / Core $29)" para comparação direta

### Aba 5 — `04_Surface Web + UPL`
- Lista completa de URLs descobertas via `firecrawl_map`
- Para cada página-chave scrapeada: resumo de 50 palavras + link
- Citação literal do disclaimer UPL (≤300 chars)
- Citação literal da seção do AI no Terms (≤300 chars)
- Lista de processos/complaints encontrados (ou "Nenhum encontrado" explícito)

### Aba 6 — `05_Sources Log`
| # | URL | Tipo | Data acesso | Status HTTP | Tokens estimados | Usado em qual aba |

---

## REGRAS DE OTIMIZAÇÃO DE TOKENS

1. **Sempre use `formats: ["markdown"]` + `onlyMainContent: true`** no Firecrawl. Nunca HTML completo.
2. **Use `firecrawl_map` primeiro** para descobrir URLs antes de scrapear. Evita crawls desnecessários.
3. **Máximo 30 chamadas Firecrawl no total** para esta tarefa.
4. **Não revalide nada no FACT PACK acima.** Se você se pegar verificando pricing ou nº de Premium subscribers, pare — já temos.
5. **Reviews:** pare assim que tiver 30. Mais que isso é overkill.
6. **Se uma fonte falhar (rate limit, bloqueio):** registre no Sources Log e siga, não tente 3x.
7. **Tudo que for "N/D" (não disponível) deve ser declarado**, não inventado.

---

## ENTREGÁVEL FINAL

1. Link da planilha
2. Resumo de **300 palavras em PT-BR** respondendo:
   - O Lawfully é mais ameaça ou mais oportunidade para nosso wedge Latino-first?
   - Qual é o feature deles mais difícil de copiar?
   - Qual é o feature deles que dá para superar com pouco esforço se mirarmos em PT/ES?
   - Eles têm vulnerabilidade regulatória (UPL / AI claims / privacy)?
3. Lista de **5 perguntas que ficaram sem resposta** (próximos passos: criar conta paga, entrevistar usuário, etc.)

## TOM

Direto. Cada afirmação rastreável. Sem floreio. Se algo for hipótese, marque como `[hipótese]` explicitamente.

=== PROMPT END ===
