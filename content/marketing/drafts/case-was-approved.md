---
title: "\"Case Was Approved\" — o que significa (e o que ainda falta) em português"
slug: case-was-approved
type: status
query_target: "Case Was Approved"
status: draft
compliance_check: PASS (re-verified 2026-08-05, product-feature line confirmed against lib/forms/registry.ts)
reviewed_by: pending
byline: Equipe Immigrei
sources:
  - https://egov.uscis.gov/casestatus/landing.do
  - https://www.uscis.gov/forms/filing-guidance/form-i-797-types-and-functions
  - https://www.uscis.gov/i-130
verificado_em: 2026-07-29
---

**"Case Was Approved"** significa que o USCIS aprovou a petição daquele número
de recibo. 🎉 A notificação oficial de aprovação (Formulário I-797, *Notice of
Action*) chega pelo correio nos próximos dias. Mas atenção: aprovação da
**petição** nem sempre é o fim da jornada — dependendo do formulário, ainda
existem etapas até o benefício estar de fato na sua mão.

## O que exatamente foi aprovado?

O status se refere ao **formulário daquele recibo específico** — não
necessariamente ao processo inteiro. O USCIS descreve o Formulário I-797 como
*"issued to communicate receipt or approval of an application or petition"*
([uscis.gov, Form I-797: Types and Functions](https://www.uscis.gov/forms/filing-guidance/form-i-797-types-and-functions),
verificado em 29/07/2026).

Exemplos de como a aprovação se encaixa na jornada:

- **Petição familiar (I-130) aprovada** ≠ green card: o beneficiário ainda passa
  pelo NVC + consulado (DS-260) ou pelo ajuste de status (I-485), conforme o
  caso ([uscis.gov/i-130](https://www.uscis.gov/i-130)).
- **I-485 aprovado**: aí sim o green card entra em produção — os próximos
  status costumam ser *"New Card Is Being Produced"* e *"Card Was Mailed To Me"*.
- **Extensão/mudança de status (I-539) aprovada**: o novo status e a nova data
  de validade constam no I-797 aprovado — ele é o seu comprovante.

Em cada um desses casos, o formulário da etapa seguinte (I-485, I-130A,
I-765, entre outros) já pode ser preenchido dentro do Immigrei, ligado ao kit
do seu caminho — sem começar do zero.

## O que acontece depois?

1. **Aguarde o I-797 pelo correio** — é o documento oficial da aprovação.
   Confira todos os dados assim que chegar.
2. **Se um cartão faz parte do benefício** (green card, EAD), o status seguinte
   mostra a produção e o envio, com rastreio pelo USPS.
3. **Guarde o I-797 com cuidado** — ele costuma ser exigido em etapas futuras
   da jornada.

## A aprovação pode ser revertida?

Existem situações raras de reabertura ou revogação, geralmente comunicadas por
carta com direito a resposta. O documento que chega pelo correio é sempre a
palavra oficial — o status online é um resumo.

## Perguntas frequentes

**"Case Was Approved" significa que já posso trabalhar / viajar / morar nos EUA?**
Depende do formulário aprovado. A aprovação vale para aquela petição
específica; o que ela habilita na prática varia caso a caso — na dúvida, é
tema para um profissional licenciado.

**Quanto tempo até o I-797 chegar?**
Normalmente alguns dias a poucas semanas após a mudança do status. Endereço
desatualizado é a principal causa de atraso — mantenha seu cadastro em dia no
USCIS.

**O status diz aprovado, mas não recebi nada pelo correio. E agora?**
Se passar de algumas semanas, o USCIS tem canal próprio para segunda via de
notificação (o status *"Duplicate Notice Was Sent"* existe justamente para isso).

**Aprovou um formulário, mas meu outro caso continua pendente. É normal?**
Sim. Cada número de recibo anda no seu próprio ritmo, mesmo quando os
formulários foram protocolados juntos.

---

O Immigrei mostra cada aprovação no contexto da sua jornada inteira — o que já
foi, o que falta e qual é o próximo passo.
[Acompanhe sua jornada →](https://immigrei.com)

*Este conteúdo é informativo e não constitui aconselhamento jurídico; consulte
um advogado de imigração licenciado para o seu caso.*

<!-- COMPLIANCE (updated 2026-07-29):
FLAGS: none open.
FIXED: I-797 quote was a paraphrase presented as verbatim — corrected against
live fetch of uscis.gov/forms/filing-guidance/form-i-797-types-and-functions
(29/07/2026) to the actual page text: "Issued to communicate receipt or
approval of an application or petition." Also cross-checked I-797C usage in
case-was-received.md against the same page — both form numbers are correctly
distinguished (I-797 = receipt/approval, I-797C = receipt/rejection/transfer/
appointments), no contradiction between the two drafts.
VERIFIED CLAIMS: "aprovação do I-130 ≠ green card" traced to content/leis/formularios/i-130.md; status names consistent with lib/uscis-status-pt.ts; I-797 quote verified live.
UPL: none — "o que ela habilita varia caso a caso" defers to professional

UPDATE 2026-08-05: added one line noting the next-step form (I-485, I-130A,
I-765) is fillable in-app, reflecting lib/forms/registry.ts (I-130, I-130A,
I-485, I-131, I-765, I-765-AOS, I-864, I-90, N-400, I-539, I-129F, G-1145,
EOIR-29 all live).

RE-VERIFIED 2026-08-05 (full subagent run): VERDICT PASS, 8/8 claims verified
including the new line — traced to lib/forms/registry.ts, cross-checked
attachTo.vistoId in i-130.ts/i-130a.ts/i-485.ts (all "familia-ir", matching
the I-130/I-485 bullets) and i-539.ts ("f1-cos", matching the I-539 bullet);
route app/documentos/[vistoId]/formulario/[formId]/page.tsx confirmed;
kit-linkage claim is enforced by an existing test (lib/forms/upl-guard.test.ts),
not just asserted in copy. No UPL risk — product-feature statement, not
case-specific direction.
-->
