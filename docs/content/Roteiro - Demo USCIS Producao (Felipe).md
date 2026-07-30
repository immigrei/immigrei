# Roteiro — Demo de Produção da Case Status API (USCIS)

> Para o Felipe conduzir. Janela: **quartas ou quintas, 13h–14h EST** (fuso da Flórida).
> Fontes: [processo de produção](https://developer.uscis.gov/get-started/production-access), [demo](https://developer.uscis.gov/get-started/production-access/demo), [chaves](https://developer.uscis.gov/article/api-key-management-policy). Preparado em 08/07/2026.

## Antes de agendar (pré-requisitos — Cesar/Claude preparam)

- [ ] Tráfego de teste suficiente no **sandbox** (Claude gera com os recibos de teste)
- [ ] E-mail ao time do USCIS pedindo início do processo → eles validam as requisições do app e enviam o **Attestation**
- [ ] **Affidavit** assinado e devolvido (chega por e-mail após o atestado)
- [ ] Empresa americana constituída (requisito verificado: site, Privacy Policy e Terms of Service — os três já estão no ar em immigrei.com)

## O que o USCIS exige ver na demo (regras do jogo)

1. **Demonstração completa, do início ao fim** — não aceita mostrar só um pedaço
2. **Fluxos reais de usuário** que invocam a API ao vivo
3. **Tratamento de TODOS os códigos de resposta documentados**
4. Time de desenvolvimento presente para responder perguntas técnicas

## Sequência sugerida (~20 min)

**1. Contexto (2 min):** o que é o Immigrei — plataforma de organização de jornada migratória para brasileiros, em português. A API alimenta o acompanhamento de casos que o usuário cadastra voluntariamente.

**2. Fluxo completo do usuário (8 min):**
   1. Cadastro/login (Clerk) → dashboard
   2. Seção "Meu caso no USCIS" → colar recibo de teste → **Verificar status** (chamada live à API)
   3. Mostrar o status renderizado em português + histórico do caso
   4. Mostrar o cron semanal (código/logs) e o e-mail de alerta de mudança (Resend)

**3. Códigos de resposta (6 min)** — mostrar ao vivo, um a um:
   | Código | Como provocar | O que o app mostra |
   |---|---|---|
   | 200 | Recibo de teste válido | Status + descrição em PT |
   | 400 | Recibo malformado que passe do front (ou via curl) | "Número de recibo inválido" |
   | 401 | Token expirado (mostrar o retry automático no código) | Renova token e refaz — invisível ao usuário |
   | 404 | Recibo bem-formado inexistente | "Caso não encontrado" + instrução do I-797 |
   | 429 | Explicar a estratégia (cron espaçado; mensagem "muitas consultas") | "Sua verificação será refeita automaticamente" |
   | 5xx | Mostrar o teste unitário + mensagem | "USCIS temporariamente indisponível" |
   *Todos os caminhos têm teste automatizado (lib/uscis.api.test.ts — 222 testes no repo).*

**4. Segurança (4 min):**
   - **Backend mediator:** navegador nunca fala com o USCIS; tudo passa pelas rotas de servidor (Next.js/Vercel) — mostrar o código da rota
   - Chaves em variáveis de ambiente (Vercel), fora do repositório; rotação anual agendada
   - Dados do usuário: recibo é fornecido voluntariamente; política de privacidade pública em immigrei.com/privacidade

## Perguntas prováveis e respostas

- **"Qual o volume esperado?"** — Pré-lançamento; centenas de usuários no primeiro ano; cron semanal por caso + consulta manual sob demanda (baixo volume, espaçado).
- **"Onde as chaves ficam?"** — Variáveis de ambiente no Vercel; nunca no cliente, nunca no repo.
- **"O que fazem com os dados?"** — Exibimos ao próprio usuário e alertamos mudanças; não revendemos; política pública no site.
- **"Quem é a empresa?"** — [preencher após a constituição: nome da LLC, estado, EIN]

## No dia

- Entrar 10 min antes; ter o app aberto em produção E o código no editor
- Cesar/Claude de prontidão assíncrona (fuso Austrália) — perguntas que o Felipe não souber: "our backend engineer can follow up by email"
