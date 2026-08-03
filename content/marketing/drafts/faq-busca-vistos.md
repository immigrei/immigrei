---
title: "Perguntas frequentes sobre vistos americanos — banco de respostas da busca in-app"
slug: faq-busca-vistos
type: faq-bank
query_target: "perguntas de intenção sobre F-1, H-1B, K-1, green card por casamento, overstay, DV Lottery — usadas pela busca semântica do app, não uma página publicada"
status: draft
compliance_check: PASS_WITH_FLAGS (flags resolved 2026-08-02 — see nota de processo abaixo)
reviewed_by: pending
byline: Equipe Immigrei
sources:
  - https://studyinthestates.dhs.gov/students
  - https://www.uscis.gov/working-in-the-united-states/students-and-exchange-visitors
  - https://cilawgroup.com/news/2026/07/24/uscis-eliminates-duration-of-status-for-f-j-and-i-nonimmigrants-mandatory-fixed-admission-periods-and-extension-of-stay-required-effective-sept-15-2026/
  - https://travel.state.gov/content/travel/en/us-visas/visa-information-resources/frequently-asked-questions.html
  - https://www.uscis.gov/laws-and-policy/other-resources/unlawful-presence-and-inadmissibility
  - https://www.uscis.gov/working-in-the-united-states/temporary-workers/h-1b-specialty-occupations
  - https://www.uscis.gov/i-129f
  - https://www.uscis.gov/i-130
  - https://i94.cbp.dhs.gov
  - https://travel.state.gov/content/dam/visas/Diversity-Visa/DV-Instructions-Translations/DV-2026-Instructions-Translations/DV%202026%20Plain%20Language%20Instructions%20and%20FAQs.pdf
verificado_em: pendente
---

> Nota de processo (revisão 2026-08-02, pós compliance-fact-check): removidas
> duas afirmações sobre o H-1B que não tinham rastreio em `content/leis` nem
> confirmação clara em fonte oficial (limite de participações no sorteio;
> ausência de restrição por nacionalidade) — ficaram de fora em vez de entrar
> sem fonte. A afirmação sobre exclusão do Brasil no DV Lottery foi corrigida
> e passou a citar a regra exata (50 mil imigrantes/5 anos, categorias
> familiar+trabalho) da fonte oficial listada acima.
>
> Nota de formato: as respostas abaixo viram texto plano em
> `lib/faqBank.ts` (campo `resposta: string`), mostrado dentro do overlay de
> busca, não uma página publicada — por isso não levam link inline por
> frase. A rastreabilidade de cada afirmação está na tabela do plano de
> implementação (`lib/faqBank.ts` ganha um campo `fonte` por entrada,
> apontando pro arquivo de `content/leis` correspondente).

Este não é um artigo publicado — é o conteúdo-fonte do banco de perguntas
frequentes usado pela busca dentro do app (`lib/faqBank.ts`). Cada entrada
aqui vira uma resposta curta mostrada quando a busca semântica entende que
o usuário está fazendo uma dessas perguntas, sempre ao lado dos vistos/kits
relacionados. Nenhuma resposta aqui é gerada em tempo real — é texto
pré-escrito e revisado antes de existir no produto.

Cada resposta traça direto para o arquivo correspondente em `content/leis/`
— não introduz nenhum fato que não esteja lá.

## Perguntas frequentes

**Posso trabalhar com visto de estudante?**
No campus, sim — até 20 horas por semana enquanto você estuda em tempo
integral. Fora do campus, só com autorização: CPT durante o curso ou OPT
depois de formado. Trabalhar sem essa autorização é considerado violação
grave do status.

**Quanto tempo posso trabalhar depois de formado (OPT)?**
O OPT dá 12 meses de autorização de trabalho ligada à sua área de estudo.
Quem se formou em curso da lista STEM pode estender por mais 24 meses. O
pedido (formulário I-765) tem uma janela específica: entre 90 dias antes e
60 dias depois da data de conclusão do curso.

**Meu visto venceu, ainda posso ficar nos EUA?**
Visto e status são coisas diferentes. O visto é só o carimbo que permite
pedir entrada na fronteira — pode vencer com você já dentro dos EUA sem
problema nenhum. Quem decide se você está em situação regular é o status,
definido pela data no seu I-94, não pela validade do visto. Vale sempre
conferir o I-94 direto em i94.cbp.dhs.gov.

**Fiquei mais tempo que podia, sou ilegal?**
Depende do seu tipo de visto. Hoje, quem está em F-1 ou J-1 não acumula
presença irregular automaticamente ao passar do prazo — isso só conta
depois de uma decisão formal do USCIS ou de um juiz de imigração. Já em
H-1B, M-1, B-1/B-2 e a maioria dos outros vistos, o relógio começa a contar
sozinho a partir da data do I-94. Essa diferença muda a partir de setembro
de 2026, quando uma nova regra passa a valer para F-1/J-1 também.

**Quanto tempo de overstay pra ficar barrado de voltar?**
As barras só entram em jogo se você sair dos EUA depois de acumular
presença irregular: mais de 180 dias gera barra de 3 anos pra voltar; um
ano ou mais gera barra de 10 anos. Enquanto você permanece dentro dos EUA
sem sair, essas barras não são acionadas — e quem ajusta status por dentro
(por exemplo, casando com cidadão americano) pode nunca chegar a acioná-las.

**Vale a pena tentar H-1B sendo brasileiro?**
A dificuldade do H-1B está em duas exigências: um empregador americano
disposto a peticionar por você, e ser sorteado no processo anual — 65 mil
vagas, mais 20 mil pra quem tem mestrado ou doutorado nos EUA. Desde 2026 a
seleção não é mais só aleatória: é ponderada pelo salário da vaga, então
cargos mais bem pagos entram mais vezes na urna.

**Como trazer minha esposa, marido ou namorado(a) pros EUA?**
Depende de vocês já serem casados ou não, e de quem tem o quê nos EUA. Se
você é cidadão americano e ainda não casou, o caminho costuma ser o K-1
(visto de noivo(a)) — o casamento precisa acontecer em até 90 dias depois
da entrada. Se vocês já são casados e você é cidadão, o caminho é o I-130
direto, sem fila de espera. Se você é residente permanente (green card, não
cidadão), a petição pelo cônjuge entra numa fila que pode oscilar bastante.

**Quanto tempo demora o green card por casamento?**
Varia bastante conforme quem é o cônjuge americano. Se for cidadão, a
categoria de parente imediato não tem fila — o tempo depende só do
processamento do USCIS. Se for residente permanente (green card), a
petição entra na fila F2A, que pode ser curta ou ficar zerada dependendo do
mês — vale sempre conferir o Boletim de Vistos atualizado, nunca uma
estimativa fixa.

**Existe sorteio de green card pra brasileiro?**
Existe o programa (Diversity Visa Lottery), mas ficam de fora os países que
enviaram mais de 50 mil imigrantes aos EUA — via categorias familiares e de
trabalho — nos últimos 5 anos, e o Brasil se enquadra nesse grupo nos
ciclos mais recentes. Essa lista é recalculada todo ano pelo governo
americano, então vale sempre confirmar a elegibilidade do seu país no ciclo
atual antes de assumir que está de fora.

**Visto aprovado garante que vou entrar nos EUA?**
Não. O visto só te dá o direito de se apresentar na fronteira e pedir
entrada — quem decide se você entra, por quanto tempo e sob qual status é o
oficial de imigração no momento da chegada, não o consulado que emitiu o
visto. É por isso que o que importa depois de entrar é o seu I-94, não o
visto em si.

---

*Este conteúdo é informativo e não constitui aconselhamento jurídico;
consulte um advogado de imigração licenciado para o seu caso.*
