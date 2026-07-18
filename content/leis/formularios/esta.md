---
fonte: https://esta.cbp.dhs.gov / https://www.cbp.gov/travel/international-visitors/esta
secao_lei: INA §217 (8 U.S.C. §1187), 8 CFR §217
verificado_em: 2026-07-18
---

# ESTA — Electronic System for Travel Authorization

## Para que serve
Autorização eletrônica prévia (CBP, não DOS) exigida para embarcar aos EUA
usando o Visa Waiver Program (VWP) — ver
[vistos/esta-vwp.md](../vistos/esta-vwp.md) para as regras de elegibilidade
do programa em si. Este arquivo cobre a aplicação, não o programa.

## O básico
- **100% online**, direto em esta.cbp.dhs.gov — cuidado com sites
  intermediários que cobram taxa extra sem serem oficiais.
- Preenchido pelo próprio viajante (ou por terceiro em nome dele, com os
  dados corretos — não há assinatura física).
- Aprovação costuma sair em minutos, mas o CBP recomenda aplicar assim que a
  viagem começar a ser planejada (até 72h de margem).
- Validade: 2 anos ou até o passaporte vencer, o que vier primeiro.
  Passaporte novo = ESTA novo.
- **O Brasil não participa do VWP** — este formulário só vale para quem tem
  cidadania de um país participante (ou dupla cidadania).

## Estrutura das telas
Personal Information → Passport Information → Contact Information → Travel
Information (endereço nos EUA, propósito, contato) → Eligibility Questions
(saúde, histórico criminal, segurança, vistos negados, países restritos) →
revisão e pagamento.

## As perguntas de elegibilidade
O texto das perguntas Yes/No é público e estável (citado em travel.state.gov
e replicado pelo CBP há anos: doença transmissível, crime com dano grave ou
envolvendo drogas, dois ou mais crimes com pena somada de 5+ anos, tráfico de
drogas, prostituição, espionagem/terrorismo, perseguição nazista 1933-45,
genocídio/tortura, fraude para obter visto, trabalho não autorizado, visto
negado/cancelado, processo de remoção, overstay anterior no VWP, viagem a
países restritos desde 1º/mar/2011 ou Cuba desde 12/jan/2021) — mas **não
existe PDF oficial do CBP para conferir a redação exata**, diferente dos
formulários do USCIS. Qualquer "Sim" invalida o ESTA e exige visto B no
consulado.

## Rotas relacionadas no produto
- Kit `esta` no cofre de documentos já carrega o alerta de que o Brasil não
  participa do VWP.
- A colinha do produto (`lib/forms/esta.ts`) cobre as quatro primeiras telas
  na íntegra e inclui as perguntas de elegibilidade com a ressalva de
  conferir a redação no site oficial antes de responder.
