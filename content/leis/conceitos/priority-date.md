---
fonte: https://travel.state.gov/content/travel/en/legal/visa-law0/visa-bulletin.html
secao_lei: INA §201–203
verificado_em: pendente
---

# Priority Date e o Visa Bulletin

- **Priority date:** a "posição na fila" para um green card com cota limitada.
  Em petições familiares (I-130), é a data em que o USCIS **recebeu** a petição.
  Em EB com PERM, é a data do protocolo do labor certification.
- **Visa Bulletin:** publicado 1x/mês pelo Dept. of State (~dia 10–15, valendo
  para o mês seguinte). Diz quais priority dates estão "current" (podem avançar).
- **Duas tabelas:** *Final Action Dates* (quando o green card pode ser aprovado)
  e *Dates for Filing* (quando pode protocolar o I-485 — só vale se o USCIS
  aceitar essa tabela no mês, ver página do USCIS).
- **Brasil** não tem coluna própria: cai em *All Chargeability Areas* (as colunas
  separadas são China, Índia, México e Filipinas). Categorias family-based:
  F1, F2A, F2B, F3, F4. Cônjuge/filho menor de cidadão americano (IR) **não tem
  fila** — sempre current.
- **F2A** (cônjuge/filho menor de residente permanente) oscila entre current e
  pequenas filas — relevante para o caso real que originou o glossário
  (I-539 negado → I-130 F2A).

## No produto

Datas atuais vivem na tabela `visa_bulletin` do Supabase (cron mensal).
Nunca hardcodar datas em conteúdo ou código. A jornada do usuário deve reagir
quando a categoria dele avança/retrocede — princípio "Immigrei é vivo".
