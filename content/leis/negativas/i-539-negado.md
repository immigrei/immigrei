---
fonte: https://www.uscis.gov/i-539 / https://www.uscis.gov/forms/all-forms/questions-and-answers-appeals-and-motions
secao_lei: 8 CFR §214.1, 8 CFR §103.5, 8 CFR §103.8(b), 8 CFR §248.1(b), 8 CFR §248.3(g), INA §212(a)(9)(B), INA §245(c)(2), INA §208(a)(2)(B)
verificado_em: 2026-07-07
---

# Saídas após I-539 negado

Primeiro arquivo da matriz de saídas por negativa (workstream Jul/2026).
Baseado no caso real: I-539 negado → I-130 F2A.

## Situação na data da negativa
- Status anterior quase sempre já expirou → pessoa fica **sem status**.
- **Negativa de I-539 não tem apelação** (8 CFR §248.3(g)) — as vias de
  revisão são as motions do I-290B.
- Relógio de unlawful presence tende a começar na negativa em admissões com
  **data fixa** no I-94; em admissões **D/S** (F-1/J-1) vale a regra da
  decisão formal — ver
  [conceitos/unlawful-presence.md](../conceitos/unlawful-presence.md) e o
  arquivo do visto específico. Marcos: **mais de 180 dias** até a barra de
  3 anos, **1 ano ou mais** até a de 10 (INA §212(a)(9)(B)).
- NTA pode ser emitida (ver [formularios/i-862-nta.md](../formularios/i-862-nta.md)).

## Rotas (ordenar na UI por situação do usuário)

| Rota | Quando faz sentido | Riscos/observações |
|------|--------------------|--------------------|
| **Motion to Reopen/Reconsider (I-290B)** | Erro claro do USCIS ou fato novo | Prazo de 30 dias + 3 quando a decisão chega por correio (33 na prática — 8 CFR §103.5 e §103.8(b)); não restaura status nem suspende a decisão enquanto pendente |
| **Sair dos EUA e reaplicar do Brasil** | Menos de 180 dias sem status | Sair antes dos 180 dias evita a barra de 3 anos |
| **Petição familiar (I-130)** | Cônjuge/pai cidadão ou residente | Cidadão (IR): ajuste possível mesmo com overstay e trabalho não autorizado (INA §245(c)(2) isenta parente imediato). Residente (F2A): exige status legal no protocolo do I-485 e depende do Visa Bulletin — ligar à tabela `visa_bulletin` |
| **Nova mudança de status** | Elegibilidade clara para outro visto | Vedada sem status válido no protocolo, salvo circunstâncias extraordinárias (8 CFR §248.1(b)); geralmente exige processamento consular |
| **Asilo (I-589)** | Medo fundado de perseguição | Prazo de 1 ano da entrada, com exceções por mudança de circunstâncias (INA §208(a)(2)(B) e (D)); é uma das saídas, não a primeira a oferecer |

## Princípio de produto
Todo estado — negado ou válido — mostra rotas paralelas ligadas a kits
(upsell do paths engine). Nunca apresentar a negativa como fim da jornada.
