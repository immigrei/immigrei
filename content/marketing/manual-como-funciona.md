# Manual — Como funciona a immigrei

> Fonte de verdade pra roteiro de Reels/vídeo sobre o produto. Cada
> item aqui é uma feature real (não aspiracional) — confira contra o
> código antes de gravar se o produto tiver mudado desde a última
> atualização deste arquivo (ago/2026).
>
> Uso: cada seção abaixo é candidata a 1 Reel (15-30s). Ordem sugerida
> de gravação = ordem das seções, mas cada uma funciona sozinha.

---

## 1. O que é, em uma frase

A immigrei mostra onde seu processo de imigração está agora, o que
vem a seguir, e ajuda a preparar a documentação — tudo em português.
Não é escritório de advocacia, não dá conselho jurídico.

**Gancho pra Reel:** "Seu processo com a imigração americana, mas em
português e sem virar madrugada lendo site do governo."

---

## 2. Plano grátis ("Retrato") — sem cartão, sem gate

O que o usuário grátis já tem, hoje, sem pagar nada:

- Rastreamento do caso na USCIS em tempo real
- Alertas por e-mail a cada mudança de status
- Aviso de prazo do I-94 (a data até quando pode ficar nos EUA)
- Visa Bulletin acompanhado automaticamente (prioridade de data)
- Comunidade: postar e ler relatos de outros imigrantes
- Prévia da jornada completa (visão geral, sem o detalhe passo a passo)

**Gancho pra Reel:** "Isso aqui é tudo grátis" + mostrar a tela de
rastreamento em tempo real.

## 3. Plano pago ("Jornada") — US$ 29,90/mês ou US$ 269/ano

Tudo do Retrato, mais:

- Jornada completa etapa por etapa (não só a prévia)
- Kits e manuais passo a passo, específicos por tipo de visto
- Preencher formulário em português → exportar pronto em inglês, no
  formato oficial (ver seção 4)
- Cofre de documentos, ligado a cada item do checklist da jornada

**Gancho pra Reel:** "A diferença entre saber que falta um documento
e saber EXATAMENTE qual, quando e onde enviar."

## 4. Formulário em português → PDF oficial em inglês

Feature mais concreta e demonstrável em vídeo. O usuário preenche um
formulário da imigração (ex: I-130, I-765) em português, na
linguagem do dia a dia, e a immigrei gera o PDF pronto, no formato
exato que a USCIS exige (mesmo layout do PDF oficial, campos
preenchidos corretamente, datas no formato mm/dd/aaaa que os EUA
usam).

13 formulários já cobertos: I-130, I-130A, I-485, I-864, I-131,
I-765, I-765-AOS, I-90, I-539, N-400, I-129F, G-1145, EOIR-29.

**Gancho pra Reel:** tela dividida — esquerda "o que você digita" (PT,
simples), direita "o que sai" (PDF oficial em inglês, formatado).
"Você preenche isso ↓ a immigrei te devolve isso ↓"

## 5. Jornada por tipo de visto (kits/manuais)

Cada visto (F-1, H-1B, O-1, ajuste de status, etc.) tem um manual
próprio: o que fazer, em que ordem, quais documentos guardar — e o
cofre de documentos já vem ligado a cada item desse checklist.

**Gancho pra Reel:** "Seu visto tem um manual. A gente já escreveu."

## 6. Advogado x immigrei — não é ou/ou

A immigrei não substitui advogado — ela organiza tudo (caso,
documentação, próximos passos) em português, pra quem já tem
advogado chegar mais preparado nas conversas, e pra quem ainda não
tem, entender o processo antes de precisar pagar uma consulta cara só
pra tirar dúvida básica.

**Gancho pra Reel:** "Tem advogado? Ótimo, continua com ele — a gente
não compete, a gente organiza pra você aproveitar melhor cada
consulta."

## 7. Comunidade

Espaço pra postar e ler relatos reais de outros imigrantes
brasileiros passando pelo mesmo processo — grátis, sem paywall.

**Gancho pra Reel:** print/depoimento real da comunidade (com
permissão) + "você não tá sozinho nisso."

---

## O que NÃO existe (não usar em roteiro até virar realidade)

- Guia de "documentos iniciais ao chegar nos EUA" / checklist de
  recém-chegado — não é uma feature hoje.
- Qualquer promessa de acesso em tempo real ao status oficial via API
  de produção da USCIS — o cron ainda roda em sandbox
  (`api-int.uscis.gov`), não produção. Evitar prometer "instantâneo"
  ou "direto da USCIS" de forma que soe como integração oficial já
  liberada.
- Conselho jurídico personalizado de qualquer tipo — sempre a régua do
  `compliance-fact-check` antes de publicar qualquer draft que toque
  em UPL.

## Regras de tom pro roteiro (do CLAUDE.md)

- Português sempre, "você" nunca "o usuário".
- Nunca soar vendedor — cada peça entrega valor real (ser direto,
  aprofundar um tema, ou explicar uma sigla) antes/além de pedir clique.
- Toda sigla (I-94, RFE, I-797...) explicada na primeira menção.
- Cores da marca (verde pinho, âmbar, creme) — nunca azul/cinza de
  concorrente.
