# Prompt — Carcaça do MVP (apenas Front-end / UX)
**Para rodar em:** Claude Code, chamando o skill `/frontend-design`
**Objetivo:** protótipo navegável, **só interface** — abas, botões, telas, estados visuais. **Nada conectado** (sem backend, sem auth, sem API, dados mockados).
**Quando usar:** cole o bloco `=== PROMPT START ===` logo após acionar `/frontend-design`.

---

=== PROMPT START ===

Construa o **protótipo front-end (somente UI/UX, sem backend)** de um app mobile-first de imigração para latinos nos EUA. É a "carcaça" navegável do MVP: todas as telas, abas e botões existem e navegam entre si, mas **nada está conectado** — use dados mockados/estáticos, sem chamadas de rede, sem autenticação real, sem persistência. Foco total em interface e experiência.

---

## CONTEXT PACK — a estratégia que guia o design (não ignore)

**Produto em uma frase:** um copiloto de conformidade migratória que mostra ao imigrante latino onde ele está, o que pode/não pode fazer, o que está vencendo, e qual o próximo passo — em português e espanhol primeiro.

**Veredicto de viabilidade:** VAI (7,48/10). Dor no pico geracional (enforcement Trump 2.0, 12M de processos pendentes no USCIS, EAD cortado de 5 anos para 18 meses).

**ICP âncora — "Persona A":** brasileiro, 34 anos, Flórida, no EUA há 3 anos com B1/B2, 2ª extensão I-539 pendente, quer ir F1 → CPT/OPT → H1B → green card → cidadania. Ansioso, já gastou milhares com advogado, fala português nativo e inglês funcional. Existem milhões de variações (mexicanos, venezuelanos, etc.).

**Wedge de lançamento:** candidatos a mudança de status **B1/B2 → F1** em FL/TX/NJ/MA.

**Modelo de negócio (refletir no paywall):**
- **Base — US$ 9/mês:** painel de status, rastreador de I-94/processo, cofre de documentos + lembretes, conteúdo PT/ES/EN.
- **Core — US$ 29/mês:** tudo do Base + recomendador de trajetória (IA), preparação de formulários (I-539, I-765, I-20), checklists de evidência, 1 check-in com advogado/ano.
- **Concierge — US$ 1.499/caso:** pacote completo + advogado de registro (attorney of record), rede de advogados parceiros.

**RESTRIÇÃO CRÍTICA DE UX — UPL-safe (não-negociável):** o produto entrega **informação + preparação de formulários + lembretes**, NUNCA aconselhamento jurídico personalizado. A UI **nunca** pode dizer "você deve aplicar para o visto X". Em vez disso, usa linguagem informativa: "Pessoas em situação parecida costumam considerar…", "Veja as opções e converse com um advogado". Todo recurso de IA e de "trajetória" precisa de um **disclaimer visível** ("Isto é informação, não aconselhamento jurídico"). O handoff para advogado é o caminho para qualquer decisão jurídica real.

**Lições de UX do concorrente líder (Lawfully, 2,5M usuários) — o que ESPELHAR:**
- Onboarding que pergunta nacionalidade (personaliza por país)
- Painel de status do caso com timeline visual ("Line Map")
- Estimativa de tempo de processamento por service center / receipt number
- Comparação com "casos parecidos" (gráficos de aprovação/RFE)
- Assistente de IA com limite de uso por plano
- Prova social no paywall (reviews, "X mil usuários no Premium")

**O que SUPERAR o Lawfully:**
- Eles são em inglês e cheios de anúncios no tier free → nós somos **PT/ES-first, limpos, sem ads**.
- Eles são um rastreador passivo → nós somos **proativos** (alertas de vencimento, próximos passos, preparação de formulários).
- Eles geram ansiedade com "112 fewer cases approved this month" → nós usamos tom **calmo e tranquilizador** (público ansioso).

**Tensão de confiança a resolver no design:** imigrantes latinos foram historicamente lesados por "notários" e golpistas. A UI precisa transmitir **confiança, transparência e legitimidade** em cada tela (sem parecer um escritório de advocacia frio).

---

## ESCOPO DO PROTÓTIPO

- **Plataforma:** web app mobile-first responsivo que simula um app nativo (moldura de celular, navegação por abas inferiores). Deve abrir e navegar 100% no browser.
- **Idiomas:** **Português como padrão**, com seletor PT / ES / EN visível (pode ser troca visual mockada — não precisa traduzir tudo, mas o seletor existe e troca pelo menos os rótulos principais).
- **Dados:** todos mockados/estáticos, realistas (use a Persona A como exemplo preenchido).
- **Estados:** mostre estados vazios, preenchidos, de carregamento e de alerta onde fizer sentido.
- **Nome de trabalho (placeholder, pode trocar):** "Norte" — sugere direção/guia, funciona em PT e ES. Use no logo/cabeçalho.

---

## ARQUITETURA DE INFORMAÇÃO

### A. Fluxo de Onboarding (antes do app principal)
1. **Boas-vindas / splash** — logo "Norte", tagline em PT, seletor de idioma PT/ES/EN, botões "Criar conta" e "Entrar" (mockados).
2. **Seleção de nacionalidade** — grid de bandeiras/países (destaque Brasil, México, Venezuela, Colômbia).
3. **Intake do caso** — formulário curto e amigável: status atual (B1/B2, F1, etc.), tipo de caso (I-539, I-485…), data de filing, receipt number (opcional). Barra de progresso. Tom acolhedor.
4. **Snapshot inicial (teaser)** — mostra um "score de conformidade" + 1-2 alertas, e um CTA "Complete seu perfil para desbloquear sua trajetória".

### B. App principal — navegação por 5 abas inferiores
1. **Painel** (Home / Dashboard)
2. **Trajetória** (Pathway)
3. **Documentos** (Forms & Vault)
4. **Meu Caso** (Tracker)
5. **Assistente** (AI chat)

(+ acesso a **Perfil/Config** e **Advogado/Concierge** via cabeçalho ou card destacado.)

---

## ESPECIFICAÇÃO TELA A TELA

### Aba 1 — Painel (a tela mais importante)
- **Cartão de status no topo:** "Você está em estadia autorizada" + selo de cor (verde/amarelo/vermelho) + explicação em 1 linha.
- **Contadores de vencimento (cards):** I-94, EAD, prazo de RFE, validade do visto — cada um com dias restantes e cor de urgência.
- **Score de conformidade:** medidor circular 0-100 com rótulo ("Saudável" / "Atenção" / "Risco").
- **Feed de alertas:** lista de avisos acionáveis ("Seu RFE vence em 12 dias", "Atualize seu endereço no USCIS").
- **Atalho "Próximo passo":** 1 ação recomendada (informativa, UPL-safe).
- Botões: "Ver minha trajetória", "Preparar documentos".

### Aba 2 — Trajetória
- **Mapa visual de trajetória:** ladder/stepper B1/B2 → F1 → CPT/OPT → H1B → Green Card → Cidadania, com "Você está aqui".
- **Cards de opções:** cada caminho possível com prós/contras informativos, indicador de "complexidade" e "tempo típico". **Disclaimer UPL** no rodapé do card.
- **Comparador:** F1 vs M1 vs O1 lado a lado (informativo).
- CTA: "Falar com um advogado sobre isto" (leva ao Concierge).
- Estado bloqueado para tier Base → overlay "Desbloqueie no Core".

### Aba 3 — Documentos
- **Checklist por tipo de caso:** itens com checkbox, status (pendente/enviado/revisado).
- **Cofre de documentos:** grid de uploads mockados (passaporte, I-797C, I-20…) com ícones de arquivo.
- **Preparação de formulários:** cards I-539, I-765, I-20 com barra de "prontidão %" e botão "Continuar preenchimento" (abre um form mockado de 2-3 campos só para mostrar UX).
- Banner: "Geramos o rascunho, um advogado revisa" (reforço UPL-safe).

### Aba 4 — Meu Caso
- **Cabeçalho do caso:** "I-539 · LIN259014823O" + status atual.
- **Line Map / timeline:** estágios (Recebido → RFE → Resposta → Decisão) com etapa atual destacada.
- **Estimativa de tempo:** "80% dos casos concluídos em 6 meses" + comparação com casos parecidos (mini gráfico de barras por service center, com "VOCÊ" destacado — espelha o Lawfully, mas em PT).
- **Histórico de mensagens:** lista expansível de updates do USCIS (mockados).
- Botão "Verificar no site do USCIS" (link mockado).

### Aba 5 — Assistente (IA)
- **Chat UI** com bolhas, campo de input, e **disclaimer fixo no topo** ("Informação, não aconselhamento jurídico").
- **Perguntas sugeridas** (chips): "O que acontece se meu I-539 for negado?", "Posso trabalhar com meu LLC?", "O que é CPT?".
- Indicador de uso por plano: "12 de 300 perguntas usadas este mês" (espelha Lawfully).
- Estado de upsell quando atinge limite no tier Base.

### Telas transversais
- **Paywall / Planos:** 3 cards (Base $9 / Core $29 / Concierge $1.499) com features, destaque no Core, prova social ("11 mil+ usuários", reviews mockados), CTA "Assinar". Toggle mensal/trimestral.
- **Advogado / Concierge:** matchmaking — cards de advogados parceiros (foto, idiomas, especialidade, avaliação), botão "Agendar consulta" (mockado), explicação do modelo "advogado de registro".
- **Perfil / Configurações:** dados da Persona A, seletor de idioma, notificações, gestão de assinatura, logout.
- **Notificações:** lista de alertas/push mockados.

---

## DIREÇÃO DE DESIGN / PRINCÍPIOS DE UX

- **Tom:** calmo, claro, tranquilizador. Público ansioso — nada de alarmismo. Linguagem simples, nunca jurídica.
- **Confiança visível:** selos de "seus dados são privados", transparência sobre o que é informação vs. aconselhamento, advogados reais com rosto.
- **Mobile-first de verdade:** áreas de toque generosas, hierarquia clara, navegação por polegar.
- **Acessibilidade:** alto contraste, fontes legíveis, suporte a textos longos (PT/ES são ~20% mais longos que EN).
- **Identidade visual:** quente mas profissional. Sugestão de paleta — azul-confiança profundo + um acento quente (âmbar/terracota) que remeta a acolhimento latino, neutros claros. Evite o azul corporativo frio genérico e evite clichês de bandeira. Cantos arredondados, generoso espaço em branco, ilustração amigável (um mascote leve é bem-vindo, à la Statue of Liberty do Lawfully, mas original).
- **Microcopy:** escreva os textos de exemplo em **português**, com personalidade humana ("Vamos resolver isso juntos", "Você está em dia").

---

## RESTRIÇÕES TÉCNICAS

- Apenas front-end. Sem backend, sem banco, sem auth real, sem chamadas de API.
- Dados mockados em arquivos/constantes locais.
- Navegação entre todas as telas deve funcionar (cliques levam às telas certas).
- Botões de ação podem mostrar estados (hover, pressed, disabled) mas não executam lógica real.
- Single codebase, rodável no browser. Componentização limpa e reutilizável.
- Comente no código onde futuramente entraria a integração (ex: `// TODO: conectar ao USCIS case API`).

---

## ENTREGÁVEL

- Protótipo navegável (todas as telas acima), abrindo no browser em moldura mobile.
- Um índice/menu de navegação para pular entre telas durante a demo.
- Breve README de 1 parágrafo: como navegar o protótipo e o que está mockado.

## FORA DE ESCOPO (não faça agora)

- Qualquer integração real (USCIS, pagamento, IA, login).
- Tradução completa de todo o conteúdo (basta o seletor funcionar nos rótulos principais).
- Lógica de negócio, cálculos reais, validação de formulário de verdade.

=== PROMPT END ===
