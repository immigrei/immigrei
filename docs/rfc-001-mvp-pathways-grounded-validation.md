# RFC-001 — Priorização de Pathways do MVP + Arquitetura de Validação "Grounded"

- **Status:** Proposto
- **Data:** 2026-07-04
- **Autor:** Arquitetura Immigrei
- **Migration associada:** `supabase/migrations/010_pathway_b2_f1_grounded.sql`

## Restrição suprema (contexto normativo)

O Immigrei opera sob a doutrina da **automação ministerial**: o software compila
formulários federais e valida regras técnicas objetivas contra fontes oficiais
(USCIS, CBP, ICE/SEVP, DOS). O software **nunca**: (a) sugere qual caminho
imigratório escolher, (b) avalia mérito/probabilidade de aprovação, (c)
interpreta a lei para o caso concreto. Toda validação que falha resulta em
**bloqueio técnico com citação da fonte oficial** + encaminhamento para
advogado parceiro — nunca em conselho.

> **Correção de grounding:** o briefing original citava "9 FAM 402.1" para a
> Regra dos 90 Dias. A citação correta é **9 FAM 302.9-4(B)(3)(g)** (presunção
> de willful misrepresentation por conduta inconsistente com o status nos
> primeiros 90 dias após a admissão). 9 FAM 402.1 trata da classificação geral
> de não-imigrantes. Este RFC usa a citação correta em todo o schema.

---

## ENTREGÁVEL 1 — Matriz de Priorização de Vistos (Filtro do MVP)

### Critérios de corte (aplicados a todos os candidatos)

1. **Self-service puro** — sem patrocinador (empregador/peticionário) no loop.
2. **Regras determinísticas** — elegibilidade verificável por datas, números de
   documento e booleanos; zero julgamento de mérito.
3. **Jurisdição única USCIS doméstica** — dentro dos EUA, sem consulado/DS-160.
4. **Demanda da Persona Âncora** — brasileiro em B1/B2 ou F-1 nos EUA.

### Fase 1 (MVP)

| # | Pathway | Formulários | Por que entra |
|---|---------|-------------|---------------|
| P1 | **Prorrogação de B1/B2 (Extension of Stay)** | I-539 (+ I-539A para dependentes) | Regra é quase 100% datas: I-94 vigente na data do protocolo (8 CFR 214.1(c)(4), 8 CFR 248.1(b) por analogia de timely filing), prova de meios financeiros é anexo do usuário, sem patrocinador. Maior volume de dor da persona (turista que precisa de mais tempo). Filing online existe (uscis.gov/i-539), o que valida nosso modelo "compilador". |
| P2 | **Mudança de Status B1/B2 ➔ F-1 (pathway âncora)** | I-539 + Form I-20 (emitido pela escola/SEVP) + comprovante I-901 SEVIS fee | Todas as pré-condições são objetivas e documentais: I-94 vigente (8 CFR 248.1(b)), I-20 de escola SEVP-certificada (8 CFR 214.2(f)(1)(i)(A)), taxa SEVIS I-901 paga (8 CFR 214.13), não ter iniciado estudos antes da aprovação (8 CFR 214.2(b)(7)), não ter trabalhado sem autorização (8 CFR 214.1(e); INA 248(a)(1)). Desde a atualização de política do USCIS de 23/abr/2021, não é mais exigido "bridge filing" até 30 dias do início do programa — removeu a maior fonte de complexidade procedural. |
| P3 (Fase 1.5) | **EAD via I-765 para F-1 (Post-Completion OPT)** | I-765 (categoria (c)(3)(B)) | Janelas 100% determinísticas em 8 CFR 214.2(f)(11): protocolo até 90 dias antes / 60 dias depois do fim do programa, e dentro de 30 dias da recomendação do DSO no SEVIS. Sem patrocinador. Entra assim que P2 estabilizar, reaproveitando o motor de regras de datas. |

**Escopo do P2 (pathway âncora):** o Immigrei compila o I-539 e valida as
pré-condições técnicas. A obtenção do I-20 é do usuário junto à escola — nós
apenas validamos que o I-20/SEVIS ID existe e está no formato válido. Não
opinamos sobre escolha de escola.

### Explicitamente FORA (Fase 2 ou nunca)

| Excluído | Motivo do corte |
|----------|-----------------|
| **H-1B, L-1, O-1, TN e todos os vistos de trabalho patrocinados** | Exigem peticionário-empregador (I-129), LCA no DOL, e no caso de O-1 análise de mérito ("extraordinary ability") — julgamento subjetivo é UPL por definição. H-1B ainda tem loteria (registro em janela anual), que quebra o modelo self-service contínuo. |
| **Asilo, U/T, VAWA e vias humanitárias** | O núcleo do caso é uma narrativa de mérito (medo crível, abuso, vitimização). Qualquer ajuda na estruturação da história é aconselhamento jurídico. Risco humano de um erro é máximo. Nunca no produto sem advogado no loop. |
| **Processamento consular / DS-160 / entrevista no exterior** | Jurisdição do DOS, sistemas distintos (CEAC), variação por posto consular, e a decisão é discricionária do oficial (INA 214(b)) — não há regra determinística a validar. |
| **Ajuste de status por casamento (I-130/I-485)** | Apesar da demanda altíssima (caso Felipe é o exemplo interno), a evidência central é "bona fide marriage" — avaliação de mérito documental que o software não pode fazer. Candidato forte à Fase 2 **com advogado parceiro no loop** (modelo attorney-review), não self-service. |
| **EB-5 e vias de investimento** | Complexidade de securities law + mérito de fonte de fundos. Fora de escopo permanente para self-service. |
| **Reinstatement de F-1 fora de status** | 8 CFR 214.2(f)(16) exige demonstrar que a violação decorreu de circunstâncias fora do controle do estudante — puro mérito. Detectamos a situação e encaminhamos ao advogado. |

---

## ENTREGÁVEL 2 — Arquitetura de Dados "Grounded" (resumo de design)

SQL completo em `supabase/migrations/010_pathway_b2_f1_grounded.sql`. Decisões:

1. **Fatos ≠ veredito.** A tabela `cos_b2_f1_cases` armazena somente **fatos
   declarados/documentais** (datas do I-94, SEVIS ID, booleanos). O veredito de
   cada regra vive em `case_rule_results`, gerado pela função
   `validate_cos_b2_f1()`. Motivo: CHECK constraints com `current_date` só
   validam no momento do write — um I-94 pode expirar *depois* do insert. A
   função é reexecutável (no submit, num cron diário) e cada linha de resultado
   carrega a citação oficial congelada no momento da avaliação (auditoria).
2. **CHECKs estáticos apenas para formato** (SEVIS ID `N##########`, I-94 de 11
   caracteres) — coisas que nunca mudam com o tempo.
3. **`COMMENT ON` em toda coluna e constraint de validação** citando a fonte
   oficial (8 CFR, 9 FAM, INA, USCIS). O banco é o documento vivo de
   compliance.
4. **RLS no padrão Clerk existente** (`request.jwt.claims->>'sub'`): usuário lê
   e edita apenas o próprio caso; `case_rule_results` é read-only para o
   usuário (escrito apenas pelo service role / função) — o usuário nunca
   altera um veredito.
5. **Catálogo de regras** (`compliance_rules`) com o texto oficial e a URL da
   fonte, para que a UI exiba a regra *verbatim* — exibir a norma oficial é
   ministerial; parafraseá-la "para o caso do usuário" é UPL.

---

## ENTREGÁVEL 3 — Motor de Regras e Blindagem UPL

### 3.1 Contrato de saída do motor (TypeScript)

O motor de validação (Edge Function / route handler Next.js) nunca retorna
texto livre. Retorna um tipo fechado; a UI só renderiza strings pré-aprovadas
pelo advogado parceiro, indexadas por `rule_code`:

```ts
type RuleOutcome =
  | { status: 'pass'; ruleCode: string }
  | {
      // Impossibilidade técnica objetiva: o compilador não consegue
      // produzir um protocolo válido segundo a regra citada. Trava o fluxo.
      status: 'hard_block';
      ruleCode: string;          // ex.: 'I94_EXPIRED'
      citation: string;          // ex.: '8 CFR § 248.1(b)'
      officialText: string;      // trecho verbatim da norma (do catálogo)
      sourceUrl: string;         // ecfr.gov / uscis.gov / fam.state.gov
      uiMessageKey: string;      // string pré-aprovada, ver 3.3
      referral: 'partner_attorney';
    }
  | {
      // Fato oficial relevante que NÃO impede o protocolo. Exibimos a norma
      // verbatim e exigimos ciência. Não recomendamos nada.
      status: 'disclosure_ack_required';
      ruleCode: string;
      citation: string;
      officialText: string;
      sourceUrl: string;
      uiMessageKey: string;
      referral: 'partner_attorney_optional';
    };
```

**Invariantes de blindagem (enforced em code review + testes):**

- Nenhuma string de UI contém verbos de conselho: *"recomendamos", "você
  deveria", "é melhor", "espere", "suas chances"*. Teste automatizado de
  lint sobre o arquivo de mensagens bloqueia o merge.
- O motor nunca compara caminhos ("F-1 é melhor que M-1") nem estima risco
  ("provável negação").
- `hard_block` = "o compilador não produz este protocolo"; nunca "seu caso é
  ruim".
- Toda mensagem de bloqueio: (1) cita a norma, (2) linka a fonte oficial,
  (3) oferece advogado parceiro, (4) tom acolhedor sem promessa.

### 3.2 Resposta proibida vs. permitida (exemplo canônico)

| | Texto |
|---|---|
| ❌ **UPL (proibida)** | "Seu I-94 venceu ontem, mas não se preocupe: você ainda pode alegar circunstâncias extraordinárias (nunc pro tunc). Recomendamos protocolar mesmo assim e explicar o atraso." |
| ✅ **Ministerial (permitida)** | "O Immigrei não pode preparar este protocolo. A regra federal 8 CFR § 248.1(b) exige que o pedido de mudança de status seja protocolado enquanto o período autorizado de permanência (I-94) está vigente. Seu I-94 registra 03/07/2026 como data-limite. Casos fora dos parâmetros do compilador precisam de análise individual — podemos te conectar com um advogado parceiro. [Ver a norma oficial →]" |

A proibida analisa mérito, sugere estratégia e prevê resultado. A permitida
declara a incompatibilidade técnica, cita e linka a norma, e encaminha.

### 3.3 Três edge cases com lógica e strings de UI

```ts
// lib/rules/cosB2F1.ts — regras puras, sem I/O, 100% testáveis
const DAY = 86_400_000;

// EDGE CASE 1 — I-94 vencido (ex.: venceu ontem)
// Fonte: 8 CFR § 248.1(b) (timely filing / manutenção de status);
//        CBP, "Arrival/Departure Record" (o I-94 define o Authorized Period of Stay).
export function ruleI94Valid(i94ExpiresOn: Date, today: Date): RuleOutcome {
  if (i94ExpiresOn.getTime() >= today.getTime()) {
    return { status: 'pass', ruleCode: 'I94_VALID' };
  }
  return {
    status: 'hard_block',
    ruleCode: 'I94_EXPIRED',
    citation: '8 CFR § 248.1(b)',
    officialText: OFFICIAL_TEXT.CFR_248_1_B, // verbatim, do catálogo compliance_rules
    sourceUrl: 'https://www.ecfr.gov/current/title-8/section-248.1',
    uiMessageKey: 'block.i94_expired',
    referral: 'partner_attorney',
  };
}

// EDGE CASE 2 — Menos de 90 dias desde a entrada
// Fonte: 9 FAM 302.9-4(B)(3)(g) (presunção de willful misrepresentation por
// conduta inconsistente nos primeiros 90 dias). NÃO é proibição de protocolo:
// não existe regra que impeça o filing. Por isso NÃO é hard_block — é
// disclosure com ciência obrigatória. Dizer "espere passar 90 dias" seria
// conselho estratégico (UPL); exibir a norma verbatim e registrar ciência é
// ministerial.
export function rule90Days(entryDate: Date, today: Date): RuleOutcome {
  const days = Math.floor((today.getTime() - entryDate.getTime()) / DAY);
  if (days >= 90) return { status: 'pass', ruleCode: 'DOS_90_DAY' };
  return {
    status: 'disclosure_ack_required',
    ruleCode: 'DOS_90_DAY_WINDOW',
    citation: '9 FAM 302.9-4(B)(3)(g)',
    officialText: OFFICIAL_TEXT.FAM_302_9_4_B_3_G,
    sourceUrl:
      'https://fam.state.gov/FAM/09FAM/09FAM030209.html',
    uiMessageKey: 'disclosure.dos_90_day',
    referral: 'partner_attorney_optional',
  };
}

// EDGE CASE 3 — Sem I-20 / SEVIS ID emitido
// Fonte: 8 CFR § 214.2(f)(1)(i)(A) (F-1 exige Form I-20 emitido por escola
// certificada pelo SEVP); Instruções oficiais do Form I-539 (evidência inicial).
export function ruleI20Present(sevisId: string | null): RuleOutcome {
  if (sevisId && /^N\d{10}$/.test(sevisId)) {
    return { status: 'pass', ruleCode: 'I20_PRESENT' };
  }
  return {
    status: 'hard_block',
    ruleCode: 'I20_MISSING',
    citation: '8 CFR § 214.2(f)(1)(i)(A)',
    officialText: OFFICIAL_TEXT.CFR_214_2_F_1_I_A,
    sourceUrl: 'https://www.ecfr.gov/current/title-8/section-214.2',
    uiMessageKey: 'block.i20_missing',
    referral: 'partner_attorney', // opcional aqui: também oferecemos link do SEVP School Search (studyinthestates.dhs.gov)
  };
}
```

**Strings de UI (pt-BR, pré-aprovadas — arquivo `lib/rules/messages.pt.ts`):**

```ts
export const MESSAGES_PT = {
  'block.i94_expired':
    'Não conseguimos preparar este pedido. A regra federal 8 CFR § 248.1(b) ' +
    'exige que a mudança de status seja protocolada enquanto o seu período ' +
    'autorizado de permanência (I-94) está vigente — e o seu I-94 registra ' +
    '{i94_date} como data-limite. Sabemos que essa notícia é difícil. Casos ' +
    'fora dos parâmetros do nosso compilador precisam de análise individual: ' +
    'podemos te conectar agora com um advogado parceiro. Ver a norma oficial →',

  'disclosure.dos_90_day':
    'Antes de continuar, precisamos que você leia uma regra oficial do ' +
    'Departamento de Estado. Você entrou nos EUA há {days} dias. O manual ' +
    '9 FAM 302.9-4(B)(3)(g) diz, em tradução livre: "{official_text_pt}" ' +
    '[texto original em inglês →]. O Immigrei não avalia como essa regra se ' +
    'aplica ao seu caso — isso é uma análise jurídica individual. Você pode ' +
    'prosseguir com o preenchimento por sua própria decisão, ou conversar ' +
    'antes com um advogado parceiro. ☐ Li a regra oficial acima e decido ' +
    'prosseguir por conta própria.',

  'block.i20_missing':
    'Para compilar este pedido, o formulário federal exige um Form I-20 ' +
    'emitido por uma escola certificada pelo SEVP, com número SEVIS no ' +
    'formato N + 10 dígitos (regra 8 CFR § 214.2(f)(1)(i)(A)). Ainda não ' +
    'encontramos esse dado no seu caso. O I-20 é emitido pela escola após a ' +
    'sua admissão — você pode consultar escolas certificadas na ferramenta ' +
    'oficial do governo (studyinthestates.dhs.gov) e voltar aqui quando o ' +
    'documento chegar. Seu progresso fica salvo. Se preferir, um advogado ' +
    'parceiro pode orientar seus próximos passos.',
} as const;
```

### 3.4 Fluxo no backend (Next.js)

1. Usuário preenche o Canvas → `POST /api/cases/:id/validate` (route handler,
   service role).
2. Handler carrega fatos de `cos_b2_f1_cases`, roda as regras puras de
   `lib/rules/cosB2F1.ts`, persiste cada `RuleOutcome` em `case_rule_results`
   (append-only, com citação e timestamp — trilha de auditoria de compliance).
3. UI renderiza exclusivamente por `uiMessageKey`. `hard_block` desabilita o
   botão de gerar formulário; `disclosure_ack_required` exige o checkbox de
   ciência, que também é persistido (`acknowledged_at`, imutável).
4. Cron semanal reexecuta `validate_cos_b2_f1()` em casos abertos (I-94 expira
   com o tempo) e dispara e-mail via Resend usando as mesmas strings.
5. Qualquer `hard_block` ou pedido de ajuda → CTA único: advogado parceiro.
   O app nunca responde "o que eu faço agora?" com estratégia.
