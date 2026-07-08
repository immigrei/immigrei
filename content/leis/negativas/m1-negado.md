---
fonte: https://www.uscis.gov/i-539 / https://studyinthestates.dhs.gov/students / https://www.uscis.gov/forms/all-forms/questions-and-answers-appeals-and-motions
secao_lei: 8 CFR §214.2(m), 8 CFR §248.1, 8 CFR §103.5, INA §212(a)(9)(B)
verificado_em: 2026-07-07
---

# Saídas após negativa no M-1

Segundo arquivo da matriz de saídas por negativa (workstream Jul/2026).
Caso típico: **I-539 de extensão M-1 negado** (extensões do M-1 são via
I-539). A base é [i-539-negado.md](i-539-negado.md), com três
particularidades do M-1.

## O que muda no M-1

1. **O relógio corre mais rápido.** Admissão com data fixa no I-94: se o
   I-539 NÃO foi protocolado a tempo, a unlawful presence conta
   automaticamente desde o vencimento do I-94 — não desde a negativa.
   Protocolado a tempo → relógio começa na data da negativa. A UI deve
   calcular qual dos dois casos se aplica antes de mostrar prazos.
2. **M-1 → F-1 é vedado por regulamento** (8 CFR §248.1) — rota indisponível
   dentro dos EUA em qualquer cenário.
3. **M-1 → H bloqueado** se o treinamento vocacional foi o que qualificou a
   pessoa para o H.

## Rotas (ordenar na UI por situação do usuário)

| Rota | Quando faz sentido | Riscos/observações |
|------|--------------------|--------------------|
| **Motion to Reopen/Reconsider (I-290B)** | Erro claro do USCIS ou fato novo | Prazo de 33 dias (30 + 3 por correio); não restaura status enquanto pendente |
| **Sair dos EUA e reaplicar do Brasil** | Menos de 180 dias de unlawful presence | Checar quando o relógio começou (I-94 vencido vs. negativa) — muda quanto resta antes da barra de 3 anos |
| **F-1 via consulado** | Quer migrar para curso acadêmico | Única via possível — mudança de status M-1 → F-1 é proibida dentro dos EUA |
| **Petição familiar (I-130)** | Cônjuge/pai cidadão ou residente | Cidadão (IR): ajuste possível mesmo com overstay. Residente (F2A): depende do Visa Bulletin — ligar à tabela `visa_bulletin` |
| **Outro status via consulado** | Elegibilidade clara para outro visto | H vedado se a qualificação veio do treinamento M-1 |
| **Asilo (I-589)** | Medo fundado de perseguição | Prazo de 1 ano da entrada (com exceções); é uma das saídas, não a primeira a oferecer |

## Princípio de produto
- Rotas bloqueadas por regulamento (M-1 → F-1; M-1 → H condicional) aparecem
  como **indisponíveis com explicação** — não ocultas — seguindo o padrão do
  E-2 para brasileiros no onboarding. "Quero virar F-1" é o desejo mais comum
  de quem está de M-1; explicar por que só dá via consulado é clareza que
  ninguém mais oferece.
- Todo estado mostra rotas paralelas ligadas a kits (paths engine). Nunca
  apresentar a negativa como fim da jornada.
