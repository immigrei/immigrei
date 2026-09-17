# Reel template — padrão visual Immigrei

Esqueleto fixo para todos os Reels verticais da marca. Derivado do primeiro
Reel produzido no Claude Design (`immigrei x advogado`, set/2026). Quem escreve
o roteiro é o `distribution-assist` (`reel.md`); este arquivo define **como
esse roteiro vira imagem e movimento** — para o Reel sair reconhecível toda vez.

## Formato

| | |
|---|---|
| Resolução | 1440×2560 (9:16) |
| FPS | 30 |
| Duração | 18–22s (alvo ~19s) |
| Estrutura | 4 cenas + fade-to-black. 1 ideia por cena, ~4–5s cada. |
| Áudio | trilha suave, sem locução obrigatória (texto carrega a mensagem) |

## Regra do thumbnail legível (não-negociável)

O Instagram mostra a **Cena 1 parada** como capa — no feed, no story tray, e
antes de a pessoa apertar play. Se a ideia só existe no áudio ou no movimento
das cenas seguintes, ela nunca chega em quem não clicou. Por isso:

- A Cena 1 sozinha, sem áudio e sem avançar quadro, precisa comunicar o
  **gancho inteiro** — não só uma pergunta solta esperando resposta na Cena 2.
- Teste antes de exportar: **tire um print só da Cena 1 (ou o frame no tempo
  0) e leia sem tocar em nada.** Se não dá pra entender do que se trata, a
  cena falhou — reescreve o texto da Cena 1, não conta com o resto do vídeo
  pra compensar.
- Vale para carrossel também: o Slide 1 é o único que aparece no feed antes
  do toque — ver a mesma regra em `distribution-assist/SKILL.md`.

## Grid e elementos fixos

- Tudo **alinhado à esquerda**. Margem lateral ~8% (115px em 1440).
- **Marca no topo-esquerdo o vídeo inteiro:** `immigrei` + ícone (cena 1 sobre
  pine) / `immigrei` + bolinha âmbar (cenas em cream).
- Headline no terço central. CTA (quando há) logo abaixo da headline.
- **Disclaimer UPL sempre na última cena**, fine print, sobe por último:
  *"Este conteúdo é informativo e não constitui aconselhamento jurídico;
  consulte um advogado de imigração licenciado para o seu caso."*
- **"Link na bio" sempre presente** — botão CTA âmbar na Cena 4, texto
  literal "Link na bio" (ou "Acompanhe sua jornada no immigrei" + "Link na
  bio" junto). Nunca sobe um Reel sem esse CTA escrito na tela.

## "immigrei" sempre minúsculo (não-negociável)

Em qualquer texto que aparece **na tela** de uma peça — wordmark, CTA, corpo
de texto, legenda de slide — o nome da marca é `immigrei`, sempre minúsculo,
nunca "Immigrei". Isso vale para SVG, roteiro de Reel, carrossel, story.
(Nos documentos internos do repositório — este README, `CLAUDE.md`, drafts de
blog — "Immigrei" maiúsculo no início de frase continua correto: é uma regra
só do que vira arte final, não da escrita interna.)

## O wordmark oficial (não inventar de novo)

Fonte da verdade: `app/components/Logo.tsx` (comentário cita o **Manual de
Identidade Visual V1.0**, em `docs/brand/Identidade Visual/`). Regras que já
causaram erro uma vez — não repetir:

- **Fonte é Fraunces 600**, não Hanken Grotesk. O wordmark nunca é caixa-alta
  nem tracking largo tipo logotipo corporativo — é `immigrei` normal, em
  itálico serifado.
- **Nunca o ícone (6 pontinhos + seta âmbar) junto do wordmark em tamanhos
  pequenos** — abaixo de ~40px os pontinhos "viram lama" (cabeçalho de Reel/
  carrossel/story é sempre pequeno → **só o texto**, sem ícone). O ícone só
  aparece sozinho, em tamanho grande (app icon, favicon, carimbo, fechos
  grandes) — nunca ao lado do wordmark nesse caso.
- Ícone: trajetória inclinada **12° fixo** — nunca rotacionar além disso nem
  espelhar. Seta sempre âmbar, nunca recolorida.
- Cor do wordmark: pine sobre cream, cream sobre pine — nunca fora da
  paleta, nunca sobre fundo de baixo contraste.

## Datas sempre em formato brasileiro (DD/MM/AAAA)

Nunca copiar uma data direto de uma fonte americana (MM/DD/AA, como aparece
no rodapé de formulários do USCIS) para uma peça em português. Converta
sempre para DD/MM/AAAA. Se o número exato como impresso no formulário for
relevante (ex.: "a edição impressa diz 09/15/26"), explique entre parênteses
que é o formato americano — nunca deixe o número cru sem contexto, porque em
DD/MM ele lê errado.

## Tokens (nunca hardcodar outro valor)

| Uso | Token | Hex |
|---|---|---|
| Fundo escuro (cena gancho) | `--pine` | `#1E5E4E` |
| Fundo claro (demais cenas) | `--cream` | `#F4EEE2` |
| Acento / CTA / checks / chip immigrei | `--amber` | `#E8A33D` |
| Card de prova, chip advogado | `--pine` | `#1E5E4E` |
| Texto sobre pine | branco / `--cream` | |
| Texto sobre cream | `--ink` | `#1B2520` |

Tipografia: **Fraunces** (600) nas headlines e frases de efeito · **Hanken
Grotesk** em label, checklist, botão e disclaimer. Nunca Fraunces em label/botão.

**Arquivos de fonte oficiais** (mesmos em `app/globals.css`/Google Fonts):
`reel-template/fonts/Fraunces-Variable.ttf` e
`reel-template/fonts/HankenGrotesk-Variable.ttf` (licença SIL OFL, via
google/fonts no GitHub). Instale localmente antes de renderizar qualquer
peça fora do browser (ex.: `rsvg-convert`, After Effects, Figma sem acesso à
internet) — sem isso, o renderizador cai num fallback do sistema (Georgia,
Avenir Next etc.) e a fonte diverge silenciosamente do resto da marca. Já
aconteceu uma vez nos frames dos Reels do alerta I-539/I-765 (set/2026) —
corrigido, mas é o tipo de erro que só aparece olhando o resultado final.

## As 4 cenas

### Cena 1 — Gancho (fundo `--pine`, ~0–3,5s)
- Headline Fraunces branca com a dor/pergunta (linha 1) → resposta curta em
  **âmbar** (linha 2) → linha de apoio em Hanken branco pequeno (linha 3).
- Entrada: **fade-up linha por linha**, ~150ms de defasagem entre linhas.
- Ex.: "Tem advogado?" / "Ótimo." / "Continua com ele."

### Cena 2 — Reenquadre (fundo `--cream`, ~4–8s)
- Label caixa-alta âmbar (`OS DOIS, JUNTOS`).
- Dois chips arredondados lado a lado com **scale-in (pop)**: um `--pine`, um
  `--amber`.
- Headline Fraunces abaixo, fade-up: reposiciona a expectativa
  ("Não é ou/ou. É os dois, juntos.").
- Transição de entrada: **wipe pine→cream** (painel da cena 1 sai).

### Cena 3 — Prova (card `--pine` sobre `--cream`, ~9–15s)
- Um **card arredondado pine cresce do centro** (scale-up) — é a transição.
- Título do card = `immigrei` (bolinha âmbar).
- **Checklist, item por item**, ícone de check âmbar, entrada staggered
  fade/slide-up (~200ms entre itens). Máx. 3 itens, ≤10 palavras cada.

### Cena 4 — Fecho + CTA (fundo `--cream`, ~16–19s)
- Card da cena 3 **encolhe/morph** para sair.
- Headline Fraunces com a síntese ("Ele cuida do jurídico. A immigrei organiza
  o resto.").
- Botão CTA `--amber` com **pop-in**. Texto do botão = verbo + "Jornada"
  quando fizer sentido ("Assinar Jornada").
- Disclaimer sobe. **Fade-to-black.**

## Vocabulário de transições (usar só estes)

- **wipe pine↔cream** — troca de bloco narrativo (cena 1→2).
- **scale-pop** — chips, botões, badges entrando.
- **card morph** — retângulo arredondado que cresce/encolhe entre cenas (2→3, 3→4).
- **staggered fade-up** — toda entrada de texto e de itens de lista.
- **fade-to-black** — só no fim.

Sem slides horizontais, sem zoom de câmera, sem glitch, sem partículas.

## Como produzir um Reel novo

1. `distribution-assist` gera `repurposed/<slug>/reel.md` (roteiro + on-screen text por beat).
2. Mapear os 3–4 beats do roteiro nas 4 cenas acima (gancho / reenquadre / prova / fecho+CTA).
3. Pedir ao Claude um canvas `/design` com 4 artboards `.dc.html` 1440×2560 seguindo esta spec — 1 artboard por cena.
4. Exportar os frames e montar no editor aplicando o vocabulário de transições acima.
5. Disclaimer UPL na cena 4 é obrigatório — checar antes de exportar.

## Referência

Primeiro Reel neste padrão: `immigrei x advogado Reels.mov` (não versionado —
está no material dos fundadores). Contact sheet de análise em
`reel-template/reference-contact-sheet.png` se adicionado.
