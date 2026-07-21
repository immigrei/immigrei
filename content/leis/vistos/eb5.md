---
fonte: https://www.uscis.gov/working-in-the-united-states/permanent-workers/eb-5-immigrant-investor-program
secao_lei: INA §203(b)(5), 8 CFR §204.6, EB-5 Reform and Integrity Act of 2022 (RIA)
verificado_em: 2026-07-20
---

# EB-5 — Green Card por Investimento

## O básico
- Quinta preferência de emprego (INA §203(b)(5)): Green Card direto (não é
  visto temporário) para quem investe capital próprio em negócio americano que
  crie empregos.
- **Sem patrocinador, sem oferta de emprego, sem PERM** — o próprio investidor
  peticiona.
- Cônjuge e filhos solteiros <21 são incluídos na mesma petição.
- Disponível para brasileiros — não depende de tratado (diferente do E-1/E-2).

## Investimento e formulário — depende do tipo de projeto
- **Via Regional Center** (projeto de terceiros, mais comum): formulário
  **I-526E**, criado pela EB-5 Reform and Integrity Act of 2022.
- **Via negócio próprio direto** (standalone, sem regional center): formulário
  **I-526** (o E anterior).
- Valor mínimo do investimento e se a área conta como TEA (Targeted Employment
  Area — rural ou alto desemprego, valor reduzido) mudam com atualização do
  USCIS — confirmar o valor atual em uscis.gov antes de qualquer decisão.
- Exige criar ou preservar **pelo menos 10 empregos em tempo integral** para
  trabalhadores americanos, diretos ou (conforme o tipo de projeto) indiretos.

## O processo em fases
1. **I-526 / I-526E** — prova a origem lícita do capital e o plano de negócio
   que vai gerar os empregos.
2. **Green Card condicional (2 anos)** — via ajuste de status (**I-485**, se já
   nos EUA em status válido) ou processo consular pelo NVC (DS-260).
3. **I-829** — protocolado nos 90 dias antes do vencimento do green card
   condicional, prova que o investimento e os empregos realmente se
   concretizaram. Aprovado, vira green card permanente (sem condição).

## Prazos e fila
- A RIA de 2022 criou categorias de visto **reservadas** (rural, alto
  desemprego, projetos de infraestrutura) com processamento priorizado e,
  historicamente, menos retrogressão do que a categoria não reservada.
- Priority date = data de protocolo do I-526/I-526E. Consultar a categoria
  EB-5 do país de nascimento na tabela `visa_bulletin` do Supabase — nunca
  hardcodar a data de corte aqui.

## Rotas de saída comuns
- Capital insuficiente ou fora do perfil de investidor → considerar EB-2 NIW
  (auto-petição por mérito, ver [vistos/eb2niw.md](eb2niw.md)) ou EB-1C
  (executivo multinacional, ver [vistos/eb1c.md](eb1c.md)) se aplicável.
- I-526/I-526E negado → reavaliar a origem do capital ou o plano de negócio
  antes de reprotocolar; caso para advogado de imigração especializado em
  EB-5.
- Quer presença nos EUA enquanto o I-526E tramita → B-1 para visitas de
  negócio (não autoriza trabalho) ou L-1 se já tiver empresa no Brasil com
  filial americana.
