# Pacote de Revisão Jurídica — Immigrei · Pathway B1/B2 ➔ F-1

**Para:** Advogado(a) parceiro(a)
**De:** Equipe Immigrei (César Tse)
**Data:** 2026-07-04
**Objetivo:** aprovação das mensagens exibidas ao usuário e da tradução livre, antes do lançamento.

## 1. Contexto em um parágrafo

O Immigrei é um software de automação ministerial: valida requisitos técnicos
objetivos (datas, documentos, taxas) contra regras federais e compila
formulários. **Não** sugere caminho imigratório, **não** analisa mérito e
**não** prevê resultados. Quando um caso não passa numa regra, o app exibe
uma mensagem fixa pré-aprovada (as deste documento), cita e linka a norma
oficial, e encaminha ao advogado parceiro. Um teste automatizado impede
tecnicamente que qualquer mensagem contenha verbos de conselho
("recomendamos", "você deveria", "espere" etc.).

## 2. O que pedimos que você revise

1. As **13 mensagens de UI** abaixo (tom, precisão jurídica, adequação UPL);
2. A **tradução livre** do trecho do 9 FAM (fidelidade ao original);
3. As **citações** — conferimos todas contra o eCFR/FAM em 2026-07-04, mas
   queremos seus olhos;
4. As **2 questões específicas** da seção 6.

## 3. Mensagens de bloqueio e disclosure (exibidas quando uma regra falha)

> Placeholders entre chaves são preenchidos com dados do caso: `{i94_date}`
> (data), `{days}` (número), `{official_text_pt}` (tradução da seção 4).

**B1 — I-94 vencido** (fonte: 8 CFR § 248.1(b))
"Não conseguimos preparar este pedido. A regra federal 8 CFR § 248.1(b) exige que a mudança de status seja protocolada enquanto o seu período autorizado de permanência (I-94) está vigente — e o seu I-94 registra {i94_date} como data-limite. Sabemos que essa notícia é difícil. Casos fora dos parâmetros do nosso compilador precisam de análise individual: podemos te conectar agora com um advogado parceiro. Ver a norma oficial →"

**B2 — Data do I-94 ausente** (fonte: 8 CFR § 248.1(b))
"Não conseguimos preparar este pedido. A regra federal 8 CFR § 248.1(b) exige que a mudança de status seja protocolada enquanto o seu período autorizado de permanência (I-94) está vigente, e ainda não encontramos a data \"Admit Until\" do seu I-94 no seu caso. Você pode consultar o documento mais recente em i94.cbp.dhs.gov e informar essa data para continuar. Seu progresso fica salvo. Se preferir, um advogado parceiro pode orientar seus próximos passos."

**B3 — Disclosure dos 90 dias** (fonte: 9 FAM 302.9-4(B)(3)(g)(2); não bloqueia — exige ciência)
"Antes de continuar, precisamos que você leia uma regra oficial do Departamento de Estado. Você entrou nos EUA há {days} dias. O manual 9 FAM 302.9-4(B)(3)(g)(2) diz, em tradução livre: \"{official_text_pt}\" [texto original em inglês →]. O Immigrei não avalia como essa regra se aplica ao seu caso — isso é uma análise jurídica individual. Você pode prosseguir com o preenchimento por sua própria decisão, ou conversar antes com um advogado parceiro. ☐ Li a regra oficial acima e decido prosseguir por conta própria."

**B4 — Data de entrada ausente** (fonte: 9 FAM 302.9-4(B)(3)(g)(2))
"Não conseguimos preparar este pedido. A regra 9 FAM 302.9-4(B)(3)(g)(2) do Departamento de Estado depende da data da sua última entrada nos EUA, e ainda não encontramos essa informação no seu caso. Você pode consultar a data no seu I-94 em i94.cbp.dhs.gov e informá-la para continuar. Seu progresso fica salvo. Se preferir, um advogado parceiro pode orientar seus próximos passos."

**B5 — Sem I-20/SEVIS** (fonte: 8 CFR § 214.2(f)(1)(i)(A))
"Para compilar este pedido, o formulário federal exige um Form I-20 emitido por uma escola certificada pelo SEVP, com número SEVIS no formato N + 10 dígitos (regra 8 CFR § 214.2(f)(1)(i)(A)). Ainda não encontramos esse dado no seu caso. O I-20 é emitido pela escola após a sua admissão — você pode consultar escolas certificadas na ferramenta oficial do governo (studyinthestates.dhs.gov) e voltar aqui quando o documento chegar. Seu progresso fica salvo. Se preferir, um advogado parceiro pode orientar seus próximos passos."

**B6 — Taxa I-901 não paga** (fonte: 8 CFR § 214.13(a)(3))
"Não conseguimos preparar este pedido. A regra federal 8 CFR § 214.13(a)(3) exige o pagamento da taxa SEVIS I-901 antes da mudança de status para F-1. Ainda não encontramos esse comprovante no seu caso — o pagamento é feito diretamente em fmjfee.com, e você pode voltar aqui assim que tiver o recibo. Seu progresso fica salvo. Se preferir, um advogado parceiro pode orientar seus próximos passos."

**B7 — Matrícula antes da aprovação** (fonte: 8 CFR § 214.2(b)(7))
"Não conseguimos preparar este pedido. A regra federal 8 CFR § 214.2(b)(7) trata o início de um curso de estudos durante o status B1/B2 como violação das condições desse status. O seu caso registra essa informação. Sabemos que essa notícia é difícil. Casos fora dos parâmetros do nosso compilador precisam de análise individual — podemos te conectar agora com um advogado parceiro. Ver a norma oficial →"

**B8 — Trabalho não autorizado** (fonte: 8 CFR § 214.1(e); INA § 248(a)(1))
"Não conseguimos preparar este pedido. As regras federais 8 CFR § 214.1(e) e INA § 248(a)(1) impedem a mudança de status de quem não manteve o status B1/B2 — o que inclui o exercício de trabalho sem autorização. O seu caso registra essa informação. Sabemos que essa notícia é difícil. Casos fora dos parâmetros do nosso compilador precisam de análise individual — podemos te conectar agora com um advogado parceiro. Ver a norma oficial →"

## 4. Tradução livre do 9 FAM (usada na mensagem B3)

**Original** (9 FAM 302.9-4(B)(3)(g)(2)(a), rev. CT:VISA-2002, 05-31-2024):
"If an individual engages in conduct inconsistent with their nonimmigrant status within 90 days of visa application or admission to the United States, as described in subparagraph (2)(b) below, you may presume that the applicant made a willful misrepresentation (i.e., you may presume that the applicant's representations about engaging in only status-compliant activity were willful misrepresentations of their true intentions in seeking a visa or admission to the United States). You must provide the applicant with the opportunity to rebut the presumption of misrepresentation by verbally presenting the applicant with your factual findings as to why you believe they are ineligible 6C1."

**Tradução livre proposta** (sempre exibida com o rótulo "tradução livre" e link para o original):
"Se um indivíduo agir de forma inconsistente com o seu status de não imigrante dentro de 90 dias do pedido de visto ou da admissão nos EUA, pode-se presumir que o requerente fez uma declaração falsa intencional (isto é, pode-se presumir que as declarações do requerente sobre exercer apenas atividades compatíveis com o status eram declarações falsas e intencionais sobre suas verdadeiras intenções ao buscar o visto ou a admissão). O requerente deve ter a oportunidade de refutar essa presunção."

## 5. Textos educativos dos campos (helpers)

H1 (I-94): "Registro eletrônico de entrada e saída criado pelo CBP quando você entra nos EUA. Consulte o seu em i94.cbp.dhs.gov."
H2 (Data de entrada): "Data que consta no seu I-94 — o mesmo registro eletrônico de entrada e saída emitido pelo CBP."
H3 (Admit Until): "Data-limite da sua permanência autorizada, definida pelo CBP — campo \"Admit Until\" do I-94."
H4 (SEVIS ID): "Número no topo do seu Form I-20, emitido pela escola. Formato N seguido de 10 dígitos."
H5 (Taxa I-901): link para fmjfee.com.

## 6. Questões específicas para sua avaliação

**Q1 — Postura da disclosure dos 90 dias (mensagem B3).** A regra do DOS não
proíbe o protocolo, então optamos por: exibir a norma verbatim + tradução,
registrar ciência com timestamp imutável, e deixar o usuário decidir — sem
bloquear e sem sugerir espera (sugerir espera nos pareceria conselho
estratégico). Essa é a postura que você considera correta? Alguma mudança de
texto?

**Q2 — Autorrelato dos checkboxes (mensagens B7/B8).** O usuário declara
sozinho se "começou a estudar" ou "trabalhou sem autorização". Sabemos que
esses conceitos têm zona cinzenta (curso recreativo vs. course of study;
atividade B-1 permissível vs. employment). Hoje não definimos os termos —
apenas bloqueamos se marcado. Você recomenda: (a) manter assim, (b)
adicionar definições citando fonte oficial, ou (c) outra abordagem?

## 7. Onde isso vive (para auditoria)

- Mensagens: `lib/rules/messages.pt.ts` (guard automatizado anti-conselho:
  `lib/rules/messages.upl-guard.test.ts`)
- Textos oficiais verbatim: `lib/rules/cosB2F1.ts` + tabela
  `compliance_rules` no banco (com fonte e URL)
- Trilha de auditoria por usuário: tabela `case_rule_results` (veredito +
  citação + timestamp, append-only)
