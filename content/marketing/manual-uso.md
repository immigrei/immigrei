# Manual de uso — como usar a immigrei

> Passo a passo real de cada tela, extraído do código (ago/2026). Serve
> de base pra tutorial em vídeo, help center, ou onboarding por e-mail.
> Se a UI mudar, revalidar contra o código antes de reusar — isto não é
> uma especificação, é uma foto do que existe hoje.

---

## 1. Onboarding — `/onboarding`

Uma pergunta por tela (não é wizard multi-página nem formulário longo).

1. Tela de boas-vindas → "Começar →"
2. Primeira pergunta: você está dentro ou fora dos EUA (`q_location`)
3. A partir daí, o fluxo ramifica conforme sua resposta — estudo,
   trabalho, negócio, família ou nacionalidade — sempre uma pergunta
   por vez, com "← Voltar" e "Próxima →" em todas as telas
4. No final: "Encontramos seu caminho." — um card com o visto
   recomendado pro seu perfil
5. Dependendo do resultado, você é direcionado pro painel, pra tela de
   `/vistos` (se houver mais de uma opção), ou pra um alerta de
   urgência (quando o caso pede atenção rápida)

## 2. Escolher seu caminho — `/vistos`

1. Os vistos aparecem em cards, agrupados por seção ("Baseado no seu
   perfil", "Estudo & Intercâmbio", "Negócios & Investimento")
2. Clique no card do visto que te interessa
3. Clique em "Quero seguir esse caminho →"
4. Confirme na barra fixa que aparece embaixo: "Confirmar {código} →"
5. Se você ainda não tem conta, a escolha é salva e você é levado pro
   cadastro (`/sign-up`); se já tem conta, vai direto pro painel

## 3. Seu painel — `/painel`

Aqui você acompanha sua jornada dia a dia.

1. No topo, um resumo da sua situação atual e da estratégia do seu caso
2. Card do seu I-94 (a data até quando você pode ficar nos EUA)
3. Se aplicável, um card de caminho paralelo (ex: via família)
4. Timeline "Sua jornada" — cada etapa aparece marcada como feita,
   atual, próxima, futura ou em alerta (essa timeline detalhada é do
   plano pago; no grátis você vê uma prévia)
5. Lista "Atenção — não pise na linha": os riscos específicos do seu
   caso que exigem cuidado
6. Se você ainda não fez o onboarding, o painel mostra "Complete o
   onboarding..." com um botão pra começar

## 4. Manual do seu visto — `/caminhos/{seu-visto}`

Não existe uma lista central de caminhos — você chega numa página
específica pelo painel ou pelos cards de `/vistos`.

1. No plano grátis, você vê um resumo e o botão "Assinar para
   desbloquear →"
2. No plano pago, a página completa mostra: o que é aquele caminho,
   quem pode e quem não pode seguir por ele, prazos e riscos, o passo a
   passo numerado de como funciona, e as fontes oficiais usadas
3. O botão "Ver o kit →" leva pro checklist de documentos daquele
   caminho especificamente

## 5. Preencher um formulário (PT → PDF oficial em inglês)

Caminho: `/documentos/{seu-visto}/formulario/{formulário}` — geralmente
acessado a partir do kit do seu caminho.

1. É uma página única e contínua (não é um wizard de várias telas) —
   você rola e preenche as seções na ordem que quiser
2. Uma barra no topo mostra quantas perguntas já foram respondidas
   ("X de Y")
3. O que você digita é salvo automaticamente conforme preenche
   (autosave) — pode fechar e voltar depois sem perder nada
4. Quando terminar, clique em "Exportar {código} preenchido (PDF)" —
   pra formulários que só existem online, o botão gera uma "colinha"
   bilíngue em vez do PDF
5. Confirmação na tela: "Formulário gerado e anexado no cofre ✓" — o
   PDF já fica salvo automaticamente no seu cofre de documentos

## 6. Cofre de documentos — `/documentos/cofre`

1. No plano grátis, você vê uma demonstração ilustrativa (não são seus
   documentos reais)
2. No plano pago, seus documentos aparecem organizados por categoria
3. Clique em "+ Adicionar" para abrir o formulário de upload de uma
   categoria específica
4. Cada documento é automaticamente cruzado com os itens do checklist
   do seu caminho — o cofre te avisa se aquele documento também precisa
   de tradução juramentada

## 7. Comunidade — `/comunidade`

1. Use a busca ou os filtros por tipo de visto pra encontrar relatos
   parecidos com sua situação
2. Clique em "Compartilhar meu relato" pra abrir o campo de escrita —
   título, texto livre, e uma opção de postar anonimamente
3. Relatos passam por aprovação antes de ficarem públicos
4. Em cada relato você pode reagir com "me ajudou"

## 8. Assinar o plano pago — `/planos`

1. Três opções aparecem lado a lado: Retrato (grátis, leva pro
   onboarding), Jornada mensal, e Jornada anual (com selo de "3 meses
   de graça" no preço)
2. Clique no botão do plano escolhido — isso abre o checkout do Stripe
3. A página deixa claro: "nunca vê nem armazena o número do seu
   cartão" — todo o pagamento é processado pelo Stripe

## 9. Escolas (intercâmbio/F-1/M-1) — `/escolas`

Pública — não precisa estar logado pra pesquisar.

1. Busque por nome da escola ou cidade, e filtre por estado ou tipo de
   instituição
2. Clique em "Escolher esta escola" — se você ainda não estiver
   logado, o app pede login nesse momento
3. A escolha fica salva no seu perfil e aparece automaticamente como
   uma etapa concluída no seu painel

---

## Observações pra quem for gravar tutorial

- O dashboard real se chama **painel** (`/painel`), não "dashboard" —
  use esse nome na fala.
- Não existe uma página `/caminhos` com lista de todos os caminhos —
  cada usuário só vê o caminho do seu próprio perfil.
- O preenchimento de formulário é **uma página só, com autosave** — não
  fale em "próxima etapa" como se fosse um wizard de várias telas.
