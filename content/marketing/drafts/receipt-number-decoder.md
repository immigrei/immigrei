---
title: "Número de recibo do USCIS: o que significam EAC, WAC, LIN, SRC, IOE e MSC"
slug: receipt-number-decoder
type: decoder
query_target: "receipt number EAC WAC LIN SRC IOE significado"
status: draft
compliance_check: PASS_WITH_FLAGS
reviewed_by: pending
byline: Equipe Immigrei
sources:
  - https://egov.uscis.gov/casestatus/landing.do
  - https://www.uscis.gov/tools/glossary
  - https://www.uscis.gov/about-us/find-a-uscis-office/service-centers
verificado_em: pendente
---

O **número de recibo** (*receipt number*) do USCIS tem 13 caracteres — **3
letras + 10 números** (ex.: `IOE0912345678`) — e é a chave de todo o
acompanhamento do seu caso. As três letras iniciais identificam **onde** o caso
foi registrado, e é por isso que dois casos iguais podem andar em ritmos
diferentes: cada centro tem a sua fila.

## O que significa cada prefixo?

| Prefixo | Origem | O que indica |
|---|---|---|
| **IOE** | Sistema eletrônico do USCIS (ELIS) | Caso protocolado ou processado digitalmente — o prefixo mais comum hoje |
| **EAC** | *Eastern Adjudication Center* | Vermont Service Center |
| **WAC** | *Western Adjudication Center* | California Service Center |
| **LIN** | Lincoln, Nebraska | Nebraska Service Center |
| **SRC** | *Southern Regional Center* | Texas Service Center |
| **MSC** | *Missouri Service Center* | National Benefits Center (NBC) |
| **NBC** | *National Benefits Center* | Casos do NBC (frequente em ajuste de status) |
| **YSC** | Potomac | Potomac Service Center |

<!-- VERIFY: confirmar lista completa e nomes atuais dos centros na página oficial de service centers -->

Os nomes vêm da época em que os centros eram "adjudication centers" regionais —
as siglas ficaram, mesmo depois de os centros mudarem de nome. O USCIS define o
número de recibo no seu glossário oficial como o identificador único de cada
caso ([uscis.gov/tools/glossary](https://www.uscis.gov/tools/glossary)).
<!-- VERIFY: citar definição verbatim do glossário -->

## Como ler os números depois do prefixo?

O formato geral é `XXX` + `AA` + `BBB` + `CCCCC`:

- **2 primeiros dígitos** — ano fiscal em que o USCIS recebeu o caso (o ano
  fiscal americano começa em outubro).
- **3 dígitos seguintes** — dia útil de processamento dentro daquele ano.
- **5 dígitos finais** — sequência única do seu caso naquele dia.

<!-- VERIFY: estrutura amplamente documentada, mas confirmar em fonte oficial antes de publicar; se não houver fonte oficial, reformular como "formato observado" -->

## Por que o prefixo importa?

- **Tempos de processamento são por centro.** Na página oficial de
  [*processing times*](https://egov.uscis.gov/processing-times/), o resultado
  muda conforme o centro — consulte usando o centro do SEU recibo.
- **Transferências acontecem.** O status *"Case Was Transferred And A New
  Office Has Jurisdiction"* significa balanceamento interno de filas; o número
  de recibo **não muda** com a transferência.
- **IOE não tem "centro" fixo** — casos eletrônicos são distribuídos, e o
  acompanhamento se concentra na sua conta myUSCIS.

## Perguntas frequentes

**Meu recibo começa com IOE. Isso é bom ou ruim?**
Nenhum dos dois — indica só que o caso corre pelo sistema eletrônico. A conta
myUSCIS costuma trazer mais detalhes para casos IOE.

**Posso escolher o centro que processa meu caso?**
Não. O USCIS define o local conforme o formulário, o tipo de caso e o
balanceamento interno de filas.

**Meu caso foi transferido para outro centro. Recomeça do zero?**
Não. A fila muda, o número de recibo continua o mesmo e o histórico é
preservado.

**Onde acompanho o status com esse número?**
No site oficial: [egov.uscis.gov/casestatus](https://egov.uscis.gov/casestatus/landing.do) —
ou no Immigrei, que acompanha por você e explica cada mudança em português.

---

Cole seu número de recibo no Immigrei e receba cada mudança de status
explicada em português, na hora.
[Acompanhe sua jornada →](https://immigrei.com)

*Este conteúdo é informativo e não constitui aconselhamento jurídico; consulte
um advogado de imigração licenciado para o seu caso.*

<!-- COMPLIANCE (inline pass, 2026-07-28 — full subagent run pending):
FLAGS:
- [FACT] prefix table + digit structure — widely documented but needs confirmation against official USCIS pages; if no official source, reframe digit structure as observed format
- [FACT] glossary quote — pull verbatim definition
VERIFIED CLAIMS: transfer behavior consistent with lib/uscis-status-pt.ts ("case was transferred...")
UPL: none — purely informational decoder
-->
