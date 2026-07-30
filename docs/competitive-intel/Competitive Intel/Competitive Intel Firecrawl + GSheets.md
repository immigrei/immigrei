# Prompt — Inteligência Competitiva via Firecrawl → Google Sheets
**Alvos:** Boundless · SimpleCitizen · Lawfully · LegalOS
**Ferramentas:** Firecrawl MCP (scrape + crawl + search) · Google Sheets MCP (criar/escrever)
**Saída:** 1 Google Sheets com 7 abas estruturadas + 1 aba de fontes

---

## Como usar
1. Abra Claude Code com Firecrawl MCP e Google Sheets MCP conectados.
2. Cole tudo entre `=== PROMPT START ===` e `=== PROMPT END ===`.
3. Deixe rodar do início ao fim (~15-30 min dependendo do volume).
4. Resultado: link para um Google Sheets pronto para análise.

---

=== PROMPT START ===

Você é um **analista sênior de inteligência competitiva** especializado em legaltech e SaaS de imigração nos EUA. Sua missão é produzir um **dossiê estruturado em Google Sheets** sobre 4 concorrentes incumbentes, usando **Firecrawl** para coletar dados do site oficial (e todos os subdomínios) de cada um, mais sites de review terceiros.

A entrega final é **um Google Sheets** com 7 abas + 1 aba de fontes. Cada célula deve ser **rastreável a uma URL** (a coluna de fonte cita a URL exata).

---

## 1. Alvos e fontes primárias

| Empresa       | Domínio raiz (inclua TODOS os subdomínios) | Notas |
|---------------|--------------------------------------------|-------|
| Boundless     | boundless.com                              | Inclua blog.boundless.com, hello.boundless.com, etc. |
| SimpleCitizen | simplecitizen.com                          | Inclua app.simplecitizen.com se acessível |
| Lawfully      | lawfully.com                               | Inclua tracker, resources, app pages |
| LegalOS       | legalos.com (ou domínio correto via YC)    | Confirme primeiro com `firecrawl_search "LegalOS immigration YC"` |

**Regra de coleta:** Para cada empresa, use `firecrawl_map` (ou `firecrawl_crawl` com depth=3) para descobrir todas as URLs do domínio. Depois `firecrawl_scrape` nas páginas-chave: home, pricing, features/product, FAQ, about/team, blog (últimos 6 meses), terms of service, privacy policy, careers page (sinal de tamanho de time).

---

## 2. Sites de review e fontes secundárias (scrape obrigatório)

Use `firecrawl_search` para cada empresa nestes domínios, depois `firecrawl_scrape` nas URLs encontradas:

- **trustpilot.com** — rating médio, número de reviews, top 3 reclamações, top 3 elogios
- **g2.com** — para softwares de imigração (Boundless, SimpleCitizen)
- **producthunt.com** — para lançamentos e community feedback
- **apps.apple.com** e **play.google.com** — para Lawfully (rating, contagem, top reviews)
- **bbb.org** (Better Business Bureau) — rating, reclamações formais
- **reddit.com** — `site:reddit.com "{nome}"` para sentimento em r/immigration, r/USCIS, r/H1B
- **pitchbook.com** + **crunchbase.com** — funding, valuation, investidores
- **ycombinator.com** (para LegalOS / Parley / Gale) — perfil oficial YC
- **linkedin.com/company/...** — tamanho de time, sede, vagas abertas

Para conteúdo atrás de paywall (PitchBook, parte do G2), capture o que estiver acessível e marque a célula como `"behind paywall — vide URL"`.

---

## 3. Estrutura do Google Sheets (7 abas + 1 sources)

Crie um Sheets chamado **`Competitive Intel — Immigration SaaS (May 2026)`** com as seguintes abas. Cada aba tem as 4 empresas como **colunas** (Boundless, SimpleCitizen, Lawfully, LegalOS) e os campos abaixo como **linhas**. Coluna final = `Fonte (URL)` para cada linha.

### Aba 1 — `01_Empresa`
- Ano de fundação
- HQ (cidade, estado)
- Fundadores (nomes + LinkedIn)
- Tamanho do time (estimado, fonte LinkedIn)
- Vagas abertas hoje (contagem + áreas)
- Status (independente / adquirido / encerrado)
- Última aquisição feita (se houver) + data
- Idiomas oficialmente suportados pelo produto
- Países onde opera

### Aba 2 — `02_Funding`
- Total captado (US$)
- Última rodada (estágio, valor, data)
- Última avaliação (valuation)
- Top 5 investidores
- Já levantou de fundo com tese de imigrante/latino? (sim/não + quais)
- Tem sinais de IPO ou aquisição iminente?

### Aba 3 — `03_Produto`
- Tipo (SaaS self-serve / SaaS + advogado / escritório com tecnologia)
- Vistos cobertos (lista: B1/B2, F1, M1, H1B, L1, O1, EB1-5, K1, IR, family-based, etc.) — marcar X
- Formulários USCIS preparados (I-130, I-485, I-539, I-765, I-129, I-140, N-400, I-90, DS-160) — marcar X
- USCIS case tracker próprio?
- Cofre de documentos?
- Recomendador de pathway (IA)?
- Preparação de evidências (cartas, declarações)?
- Tradução automática de documentos?
- Integração com SEVP / escolas?
- Mobile app (iOS / Android)?
- Stack de IA mencionado publicamente?
- Modelo de attorney-of-record (G-28)?
- Money-back guarantee?

### Aba 4 — `04_Pricing`
Para cada empresa, listar **todos os planos/tiers** encontrados na página de pricing:
- Nome do plano
- Preço (US$)
- Modelo (assinatura mensal / anual / preço fixo por caso / % do honorário do advogado)
- O que está incluído
- O que NÃO está incluído (taxas de USCIS, etc.)
- Garantia / política de reembolso
- Trial gratuito?
- Pricing oculto (precisa falar com vendas)?

### Aba 5 — `05_Reviews_Agregado`
Para cada combinação empresa × fonte de review:
- Fonte (Trustpilot, G2, App Store, BBB, Reddit, etc.)
- Rating médio (de quanto)
- Número de reviews
- Data do review mais recente
- Top 3 temas de elogio (texto curto)
- Top 3 temas de reclamação (texto curto)
- Padrões de fraude/golpe alegados (se houver)
- Tempo de resposta do suporte (se mencionado)

### Aba 6 — `06_Legal_e_UPL`
- Tem advogados in-house? (sim/não, número)
- Estados onde anuncia "advogado parceiro"
- Modelo declarado (informação only / form prep / advogado de registro / firma híbrida)
- Disclaimers de "not a law firm" visíveis na home? (sim/não + URL)
- BIA accredited representative? (organização reconhecida pelo DOJ?)
- Citados em alguma ação UPL conhecida? (busque também em justia.com e courtlistener.com)
- Conformidade declarada (SOC2, HIPAA, GDPR)
- Política de retenção de dados (do que retém + por quanto tempo)
- Acordo com FTC / state AG conhecido?

### Aba 7 — `07_GTM_Marketing`
- Canais de aquisição visíveis (SEO blog, paid Google/Meta, parcerias, comunidades)
- Idiomas em que faz marketing (PT, ES, EN, outros)
- Parcerias declaradas (escolas, empresas, igrejas, ONGs)
- Programa de afiliados / referral?
- Posicionamento em uma frase (copie a headline da home)
- Personas que aparecem nos depoimentos (nacionalidade, tipo de visto)
- Conteúdo recente publicado (3 últimos posts do blog com título + data + tema)
- Presença em redes (handles + número de followers em IG, TikTok, YouTube, LinkedIn)
- Domínios alternativos (.co, .ai, .es) que possuem

### Aba 8 — `08_Fontes`
- URL completa
- Empresa relacionada
- Aba/linha que cita essa fonte
- Data de coleta
- Status (200 OK / 404 / behind paywall / robots blocked)
- Snippet relevante (até 500 chars)

---

## 4. Playbook de Firecrawl

Para cada empresa:

1. **Descoberta:** `firecrawl_map url={domain}` para listar todas as URLs. Salve a lista.
2. **Triagem:** Priorize: `/pricing`, `/plans`, `/cost`, `/features`, `/product`, `/about`, `/team`, `/careers`, `/jobs`, `/blog`, `/resources`, `/help`, `/faq`, `/terms`, `/privacy`, qualquer URL com nome de visto (ex.: `/h1b`, `/f1`, `/green-card`).
3. **Scrape:** `firecrawl_scrape url={url} formats=["markdown"]` em cada URL priorizada. Para páginas com muito JS (preços dinâmicos), use `formats=["markdown", "screenshot"]` e descreva o screenshot.
4. **Extração estruturada:** Use `firecrawl_extract` com schema JSON para `/pricing` — peça nome de plano, preço, intervalo, features.
5. **Busca cruzada:** `firecrawl_search query="{nome empresa} pricing 2026"` e `firecrawl_search query="{nome empresa} review reddit"` para pegar fontes que não estão no site oficial.
6. **Limites:** Se um domínio bloquear (`robots.txt` ou rate limit), respeite. Anote em `08_Fontes` com status `blocked` e siga.

---

## 5. Regras de qualidade

- **Toda célula de dado precisa de fonte** — sem fonte, escreva `"sem fonte confiável"` na célula.
- **Frescor:** Priorize dados de 2024–2026. Se o único dado disponível for de 2023 ou anterior, marque a célula com prefixo `[OLD 2023]`.
- **Sem invenção:** Se Firecrawl não encontrar, escreva `"não disponível publicamente"`. NÃO chute valores.
- **Moeda em USD**, datas em formato `YYYY-MM-DD`, números com separadores americanos.
- **Texto de review:** copie verbatim entre aspas, máximo 200 chars por trecho.
- **Snake_case** para nomes de células de planos, `Title Case` para títulos.

---

## 6. Output esperado

Ao terminar:

1. **Crie o Google Sheets** via MCP do Google Sheets. Compartilhe URL com permissão `anyone with link can view`.
2. **Imprima no chat:**
   - URL do Sheets
   - Total de URLs scrapeadas por empresa
   - Top 5 surpresas / insights inesperados que você encontrou
   - Top 3 lacunas — dados que não conseguiu obter e onde procurar manualmente
3. **Cole no chat um sumário de 10 linhas** comparando as 4 empresas (uma frase por dimensão: preço, escopo de vistos, modelo legal, idiomas, momentum).

---

## 7. Tom

Direto. Analista para founder. Sem floreio. Se um competidor for fraco em alguma dimensão, diga sem rodeio. Se for forte, diga também sem inflar.

=== PROMPT END ===

---

## Notas para você (não cole no Claude Code)

- **Se Google Sheets MCP não estiver conectado:** o prompt já tem fallback implícito — peça ao Claude Code para gerar um `.xlsx` na pasta de outputs e dar o link `computer://`. Adicione esta linha no final do prompt: *"Se MCP do Google Sheets não estiver disponível, gere um .xlsx local com a mesma estrutura e me dê o caminho do arquivo."*
- **Custo do Firecrawl:** scrape de ~80-150 URLs no total. Plano free do Firecrawl dá conta; Hobby/Standard se quiser margem.
- **Tempo estimado:** 15-30 min com Firecrawl bem configurado.
- **Próximo passo natural** depois desta planilha: usar os dados de pricing + features para refinar nossa página `06_precos.png` do PDF, e usar os dados de review para encontrar gaps de UX que viram nossas headlines de marketing.
