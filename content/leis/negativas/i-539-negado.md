---
fonte: https://www.uscis.gov/i-539 / https://www.uscis.gov/forms/all-forms/questions-and-answers-appeals-and-motions
secao_lei: 8 CFR §214.1, 8 CFR §103.5, INA §212(a)(9)(B)
verificado_em: pendente
---

# Saídas após I-539 negado

Primeiro arquivo da matriz de saídas por negativa (workstream Jul/2026).
Baseado no caso real: I-539 negado → I-130 F2A.

## Situação na data da negativa
- Status anterior quase sempre já expirou → pessoa fica **sem status**.
- Relógio de unlawful presence tende a começar na negativa (ver
  [conceitos/unlawful-presence.md](../conceitos/unlawful-presence.md)):
  **180 dias** até a barra de 3 anos, **365 dias** até a de 10.
- NTA pode ser emitida (ver [formularios/i-862-nta.md](../formularios/i-862-nta.md)).

## Rotas (ordenar na UI por situação do usuário)

| Rota | Quando faz sentido | Riscos/observações |
|------|--------------------|--------------------|
| **Motion to Reopen/Reconsider (I-290B)** | Erro claro do USCIS ou fato novo | Prazo de 30 dias; não restaura status enquanto pendente |
| **Sair dos EUA e reaplicar do Brasil** | Menos de 180 dias sem status | Sair antes dos 180 dias evita a barra de 3 anos |
| **Petição familiar (I-130)** | Cônjuge/pai cidadão ou residente | Cidadão (IR): ajuste possível mesmo com overstay. Residente (F2A): depende do Visa Bulletin — ligar à tabela `visa_bulletin` |
| **Nova mudança de status** | Elegibilidade clara para outro visto | Difícil sem status válido; geralmente exige processamento consular |
| **Asilo (I-589)** | Medo fundado de perseguição | Prazo de 1 ano da entrada (com exceções); é uma das saídas, não a primeira a oferecer |

## Princípio de produto
Todo estado — negado ou válido — mostra rotas paralelas ligadas a kits
(upsell do paths engine). Nunca apresentar a negativa como fim da jornada.
