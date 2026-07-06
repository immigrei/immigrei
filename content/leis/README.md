# Banco de Leis — Immigrei

Base de referência legal fechada e curada. Quando o Claude (ou qualquer pessoa do time)
precisar de informação sobre lei de imigração para pesquisa ou conteúdo de produto,
**a busca começa e termina aqui** — nada de web aberta, fóruns ou Reddit.

## Regras

1. **Só fontes oficiais.** Todo fato precisa de fonte listada em [fontes.md](fontes.md).
2. **Todo arquivo tem frontmatter** com `fonte`, `secao_lei` e `verificado_em`.
   - `verificado_em: pendente` = rascunho, ainda não conferido contra a fonte oficial.
   - Ao revisar, atualize para a data da verificação (`2026-07-03`).
3. **Conteúdo em PT-BR**, termos legais em inglês entre parênteses na primeira menção.
   Terminologia aprovada (ex.: NTA = "Notificação de Comparecimento") vale aqui também.
4. **Isto não é aconselhamento jurídico** — é referência interna. O que vai para a UI
   passa pelo filtro de voz da marca e pelos disclaimers do produto.
5. **Dados que mudam mensalmente NÃO ficam aqui.** Priority dates do Visa Bulletin
   vivem na tabela `visa_bulletin` do Supabase, atualizada pelo cron
   `/api/cron/visa-bulletin` (dia 10 de cada mês). Aqui só ficam os conceitos.

## Estrutura

```
fontes.md        → fontes oficiais permitidas
vistos/          → um arquivo por visto (f1.md, h1b.md, o1.md...)
formularios/     → um arquivo por formulário (i-130.md, i-539.md...)
negativas/       → matriz de saídas por negativa, por visto
conceitos/       → conceitos transversais (priority date, unlawful presence...)
```

## Template de arquivo

```markdown
---
fonte: https://www.uscis.gov/...
secao_lei: INA §XXX / 8 CFR §XXX
verificado_em: pendente
---

# Título

Conteúdo...
```
