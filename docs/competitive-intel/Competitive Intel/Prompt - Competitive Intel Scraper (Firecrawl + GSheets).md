# Prompt — Coleta Competitiva via Firecrawl → Google Sheets
**Para rodar em:** Claude Code (com Firecrawl MCP + Google Sheets MCP / Drive)
**Saída:** uma planilha Google Sheets com 7 abas estruturadas
**Tempo estimado:** 30-60 min de execução

---

## Como usar
1. Garanta que o Claude Code tem **Firecrawl MCP** e **Google Sheets MCP** (ou pelo menos Drive + acesso de escrita) conectados.
2. Cole tudo dentro do bloco `=== PROMPT START ===` / `=== PROMPT END ===` em uma nova sessão do Claude Code.
3. Deixe rodar até o fim. Se ele pedir confirmação para criar a planilha, aprove.
4. No fim, ele vai te entregar o link da planilha.

---

=== PROMPT START ===

Você é um **analista de inteligência competitiva sênior** especializado em legaltech e SaaS de imigração. Sua tarefa é construir uma planilha do Google Sheets completa e citada, comparando 4 soluções incumbentes do mercado de imigração para os EUA.

## Alvos da pesquisa

| # | Empresa | URL principal | Notas |
|---|---------|---------------|-------|
| 1 | **Boundless Immigration** | https://www.boundless.com | Família + emprego; adquiriu Localyze em out/2025 |
| 2 | **SimpleCitizen**          | https://www.simplecitizen.com | Foco em formulários self-service |
| 3 | **Lawfully**               | https://www.lawfully.com | Case tracker USCIS, 2,5 mi usuários |
| 4 | **LegalOS**                | https://www.legalos.ai (verificar URL) | YC Winter 2026, AI-native immigration law firm |

## Ferramentas que você DEVE usar

- **Firecrawl** para:
  - `firecrawl_crawl` em cada domínio principal (incluindo **todos os subdomínios**: blog, help, app, docs, careers, etc.) com `maxDepth` adequado para cobrir páginas de produto, preços, FAQ, blog e termos.
  - `firecrawl_scrape` para páginas-chave individuais identificadas no crawl (pricing, terms of service, about, attorney disclaimer).
  - `firecrawl_search` para encontrar reviews externos, menções na imprensa, perfis em diretórios.
- **Google Sheets MCP** (ou criar via Drive API) para montar a planilha final.
- **WebSearch** como fallback se Firecrawl não encontrar algo.

## Regra de qualidade — não-negociável

Para **cada célula de dado** que você preencher na planilha, registre na aba `Sources Log`:
- a URL exata de onde tirou a informação
- timestamp da coleta
- nível de confiança: `Alta` (citação direta) / `Média` (inferida de contexto) / `Baixa` (estimativa)

Se não encontrar a informação, escreva `N/D` (não disponível) na célula — **nunca invente**.

---

## Estrutura da Planilha — 7 Abas

### Aba 1 — `00_Comparativo Master`
Matriz lado a lado das 4 empresas. Linhas = atributos, Colunas = empresas + 1 coluna "Nosso wedge proposto" (para preencher manualmente depois).

Linhas obrigatórias (agrupadas por categoria):

**Identidade da empresa**
- Nome jurídico
- Ano de fundação
- Sede (cidade, estado)
- CEO / fundadores
- Nº de funcionários (LinkedIn)
- Status (independente / adquirida / IPO)
- Última rodada / valuation (PitchBook, Crunchbase)
- Captação total acumulada

**Cobertura de produto**
- Tipos de visto suportados (lista)
- Foco família × emprego × ambos
- Suporta cidadania (N-400)?
- Suporta asilo?
- Países de origem atendidos
- Geografia (EUA todo / estados específicos)

**Idiomas**
- Idiomas da interface
- Idiomas do suporte humano
- Conteúdo em português? Em espanhol?

**Preço e empacotamento**
- Modelo (assinatura / por caso / freemium / híbrido)
- Preço menor (US$, frequência)
- Preço maior (US$)
- Garantia de reembolso (sim/não, condições)
- Plano de pagamento parcelado?
- Taxas governamentais incluídas?

**Modelo de advogado**
- Tem advogado de registro (Attorney of Record)?
- Advogados in-house ou rede?
- Quantos advogados parceiros (se divulgado)?
- País / estados onde os advogados são licenciados

**Tecnologia e IA**
- Usa IA generativa em alguma feature? Onde?
- App mobile (iOS / Android / só web)?
- API pública?
- Integrações divulgadas

**Tração e reviews**
- Nº de usuários divulgado
- Rating Trustpilot (nota + nº de reviews)
- Rating App Store (iOS) — nota + nº
- Rating Google Play — nota + nº
- Rating G2 — nota + nº
- BBB rating
- Reddit sentiment (positivo / misto / negativo, com link)

**Postura regulatória / UPL**
- Disclaimer de "não somos escritório de advocacia" presente? Onde?
- Termos de uso linkados? (URL exata)
- Modelo de UPL declarado (DOJ R&A / attorney of record / só formulários / outro)

**Marketing e distribuição**
- Tráfego mensal estimado (SimilarWeb se acessível)
- Top 5 keywords orgânicas (Ahrefs/SEMrush — se acessível)
- Presença em redes (Instagram, TikTok, YouTube — handles + nº de seguidores)
- Programa de afiliados?
- Tem comunidade própria? (Discord, fórum, WhatsApp)

---

### Aba 2 a 5 — `01_Boundless`, `02_SimpleCitizen`, `03_Lawfully`, `04_LegalOS`
Aba dedicada por empresa, formato narrativo + bullets, em ~10 seções:

1. **Visão geral** — 2 parágrafos descrevendo a empresa, modelo de negócio, momento atual
2. **Captable e histórico de captação** — tabela de rodadas (data, valor, investidores líderes, fonte)
3. **Catálogo de produtos** — lista exaustiva de produtos e SKUs com preço
4. **Linha do tempo de mudanças relevantes** (últimos 24 meses) — lançamentos, aquisições, pivôs, mudanças de preço
5. **Jornada do usuário** — descreva passo a passo o fluxo de cadastro → primeiro caso (a partir do que o crawl mostrar)
6. **Estratégia de conteúdo** — temas dominantes do blog, frequência de publicação, autores
7. **Termos de uso destrinchados** — cláusulas críticas: UPL disclaimer, política de reembolso, escopo de serviço, jurisdição
8. **Top 10 reclamações recorrentes** (extraídas de Trustpilot, BBB, Reddit, App Store)
9. **Top 10 elogios recorrentes** (mesma origem)
10. **Lacunas observadas** — o que essa empresa NÃO faz e que poderíamos fazer

---

### Aba 6 — `05_Reviews Aggregator`
Tabela de reviews individuais coletados. Colunas:

| Empresa | Plataforma | Data review | Rating (0-5) | Idioma | Trecho citado (≤ 200 chars) | Sentimento | Categoria do feedback | URL |
|---------|------------|-------------|--------------|--------|------------------------------|------------|------------------------|-----|

Categorias do feedback (use estas tags): `Preço`, `Atendimento`, `Velocidade`, `Qualidade do form`, `Comunicação`, `Aprovação/Negativa`, `Idioma/UX`, `Bug técnico`, `Outro`.

**Sites de review obrigatórios a varrer (use firecrawl_search):**
- Trustpilot — `https://www.trustpilot.com/review/{dominio}`
- BBB — `https://www.bbb.org` (busca por nome)
- Google Maps (reviews da empresa, se aplicável)
- App Store (iOS) — reviews textuais via crawl da página do app
- Google Play — reviews textuais via crawl
- G2 — `https://www.g2.com`
- Capterra — `https://www.capterra.com`
- Reddit — `r/immigration`, `r/USCIS`, `r/h1b`, `r/USCitizenship` — busque menções por nome
- Product Hunt — página da empresa, comentários
- YouTube — comentários em vídeos oficiais e em vídeos de reviewers

**Meta:** mínimo de 30 reviews por empresa (mais se possível). Diversifique fontes — não pegue só Trustpilot.

---

### Aba 7 — `06_Preços Detalhados`
Cruzamento empresa × tipo de visto. Colunas:

| Empresa | Visto / Caso | Preço base | Preço total c/ tudo (estimado) | Inclui taxa governo? | Inclui advogado? | Garantia | Fonte URL |
|---------|--------------|------------|-------------------------------|---------------------|------------------|----------|-----------|

Tipos de visto a investigar (uma linha por intersecção, mesmo se for "Não oferece"):
- Marriage Green Card (I-130 + I-485)
- Family Green Card (outros)
- Naturalization (N-400)
- Work visa H-1B
- O-1 extraordinary ability
- F-1 change of status (de B1/B2)
- I-539 extension / change of status
- I-765 EAD application
- Citizenship test prep
- Asylum (I-589)

---

### Aba 8 — `07_Sources Log`
Linha por linha, registro de cada URL acessada. Colunas:

| # | Empresa | URL | Tipo (página oficial / review / artigo / etc.) | Data acesso | Status (200/404/etc.) | Usado em qual aba/célula |

---

## Sequência de execução recomendada

1. Para cada uma das 4 empresas:
   a. `firecrawl_crawl` no domínio principal com `maxDepth: 3` e `limit: 200`
   b. Salve as URLs descobertas em `07_Sources Log`
   c. Identifique manualmente as páginas-chave: home, /pricing, /about, /terms, /privacy, /careers, /blog
   d. `firecrawl_scrape` nessas páginas-chave com `formats: ["markdown"]` e extraia dados estruturados
   e. Preencha as células da `Aba 1` e da aba dedicada da empresa

2. `firecrawl_search` para cada empresa nos sites de review listados; agregue na `Aba 6`

3. Pesquise no Crunchbase / PitchBook / TechCrunch o histórico de captação; preencha a tabela de funding

4. Última passada: revise `00_Comparativo Master` e marque com cor (verde/amarelo/vermelho) as células onde nosso wedge (Latino-first, PT/ES, $9-29/mês + Concierge $1.499) tem vantagem vs. desvantagem vs. paridade.

## Saída final

- Link da planilha Google Sheets criada
- Resumo de 200 palavras em texto, em PT-BR, respondendo:
  1. Qual incumbente é a maior ameaça direta ao nosso wedge?
  2. Qual lacuna mais clara e maior que poderíamos atacar primeiro?
  3. Que feature ou política deveríamos copiar / evitar de cada um?
- Lista das **5 perguntas que ficaram sem resposta** e que o usuário deveria validar de outra forma (entrevista, demo, conta-teste paga)

## Tom

Direto, sem floreio. Cada afirmação rastreável. Se Firecrawl falhar em algum domínio (rate limit, bloqueio), registre no Sources Log e siga com WebSearch. Não pare por causa de uma falha.

=== PROMPT END ===
