# Fontes oficiais permitidas

Toda informação no banco de leis deve rastrear para uma destas fontes.
Se não está aqui, não entra sem discussão do time.

## Primárias (lei e regulamento)

| Fonte | URL | O que é |
|-------|-----|---------|
| INA (Immigration and Nationality Act) | https://uscode.house.gov/browse/prelim@title8 | A lei de imigração em si (8 U.S.C.) |
| 8 CFR | https://www.ecfr.gov/current/title-8 | Regulamentos que implementam a INA |
| 22 CFR | https://www.ecfr.gov/current/title-22 | Regulamentos do Dept. of State (vistos consulares) |

## Agências (aplicação prática)

| Fonte | URL | O que é |
|-------|-----|---------|
| USCIS | https://www.uscis.gov | Formulários, taxas, políticas, processing times |
| USCIS Policy Manual | https://www.uscis.gov/policy-manual | Interpretação oficial do USCIS |
| Dept. of State — Visa Bulletin | https://travel.state.gov/content/travel/en/legal/visa-law0/visa-bulletin.html | Priority dates mensais |
| Dept. of State — FAM | https://fam.state.gov | Manual dos consulados (9 FAM = vistos) |
| EOIR / DOJ | https://www.justice.gov/eoir | Cortes de imigração (relevante pós-NTA) |
| ICE | https://www.ice.gov | SEVIS/SEVP (F-1, M-1) |
| CBP | https://www.cbp.gov | I-94, entrada, admissão |
| SEVP / Study in the States | https://studyinthestates.dhs.gov | Regras práticas de F-1/M-1 |

## Uso pelo Claude

- Pesquisa de lei: **grep neste diretório primeiro**. Só buscar na web se o tópico
  não existir aqui — e então usar apenas as URLs desta lista e propor adicionar o
  resultado como novo arquivo.
- Priority dates atuais: consultar a tabela `visa_bulletin` no Supabase, nunca
  hardcodar datas em conteúdo.
