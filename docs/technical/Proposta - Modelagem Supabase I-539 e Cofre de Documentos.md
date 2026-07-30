# Proposta técnica — Tabelas Supabase para o fluxo I-539/I-20 + Cofre de Documentos

> Rascunho do Claude · 2026-07-02 (madrugada) · **Para revisão de Cesar & Felipe — nada disso foi criado no banco ainda.**
> Segue os 3 mandamentos UPL (ver memória "UPL Compliance Architecture"): o schema registra FATOS que o usuário declara e valida DATAS/FORMATOS — nunca mérito.

---

## 1. Por que essas tabelas

O wedge do MVP (relatório de viabilidade) é **B1/B2 → F-1 (mudança de status)**. Para o app acompanhar essa jornada como "máquina de escrever inteligente", ele precisa registrar:

1. O **status atual** do usuário e sua base documental (I-94, passaporte)
2. O **processo em andamento** (I-539) e suas dependências (I-20 ativo antes do protocolo)
3. Os **documentos** que sustentam tudo (cofre)

## 2. Schema proposto

```sql
-- ─── status migratório declarado (fatos, não análise) ─────────────
create table if not exists user_status (
  id                uuid primary key default gen_random_uuid(),
  user_id           text not null unique references profiles(clerk_user_id) on delete cascade,
  current_class     text check (current_class in ('B1','B2','F1','M1','J1','H1B','L1','E2','O1','sem_status','outro')),
  i94_number        text,
  i94_admit_until   date,           -- A data que manda (sobrepõe carimbo do passaporte)
  passport_country  text default 'BR',
  passport_expiry   date,
  sevis_id          text,           -- quando houver I-20
  updated_at        timestamptz default now()
);

-- ─── processos (I-539 e futuros) ───────────────────────────────────
create table if not exists user_processes (
  id                uuid primary key default gen_random_uuid(),
  user_id           text not null references profiles(clerk_user_id) on delete cascade,
  process_type      text not null check (process_type in ('i539_extensao','i539_cos_f1','i539_cos_m1')),
  -- etapas MINISTERIAIS: cada uma é um fato verificável, não uma opinião
  stage             text not null default 'preparando' check (stage in (
                      'preparando',          -- juntando documentos
                      'i20_emitido',         -- escola emitiu I-20 (pré-requisito p/ COS)
                      'protocolado',         -- I-539 enviado, aguardando recibo
                      'recibo_recebido',     -- I-797C em mãos → vira user_case (tracking)
                      'biometria', 'rfe_recebido', 'decidido', 'encerrado'
                    )),
  receipt_number    text,           -- liga com user_cases quando existir
  filed_at          date,
  created_at        timestamptz default now(),
  updated_at        timestamptz default now()
);

-- ─── cofre de documentos (prometido no e-mail de boas-vindas) ──────
create table if not exists user_documents (
  id           uuid primary key default gen_random_uuid(),
  user_id      text not null references profiles(clerk_user_id) on delete cascade,
  process_id   uuid references user_processes(id) on delete set null,
  doc_type     text not null,       -- 'passaporte','i94','i20','extrato','foto','i797c','outro'
  label        text,                -- nome que o usuário deu
  storage_path text not null,       -- Supabase Storage (bucket privado 'documents')
  expires_at   date,                -- passaporte/I-20 → alertas de vencimento!
  uploaded_at  timestamptz default now()
);
-- RLS: select/insert/delete apenas do próprio user; bucket privado com
-- signed URLs. Storage do Supabase free = 1GB (suficiente p/ MVP).
```

## 3. Validações UPL-safe (exemplos de implementação)

| Situação | ❌ Proibido (mérito) | ✅ Permitido (fato/sistema) |
|---|---|---|
| I-94 vencido | "Você está ilegal, risco de deportação" | "O sistema requer um I-94 com validade futura para prosseguir. Para casos com datas vencidas, consulte um advogado licenciado." |
| Sem I-20 no fluxo COS F-1 | "Você não vai conseguir" | Botão de avanço travado: "Esta etapa requer um I-20 emitido por escola SEVP. [O que é o I-20?]" |
| Escolher extensão vs. COS | "Recomendamos F-1 para você" | Duas caixas estáticas: [Quero estender meu turismo] [Quero mudar para estudante] |

## 4. Dividendos imediatos
- `i94_admit_until` + `passport_expiry` + `expires_at` → **alertas de vencimento** (novo uso do Resend que já funciona; feature de retenção fortíssima)
- `stage` alimenta o mapa da jornada com dados reais
- Cofre honra a promessa do e-mail de boas-vindas

## 5. O que decidir antes de eu construir
1. Aprovam o schema? (nomes/etapas ajustáveis)
2. Cofre no MVP = upload + organização + alertas de vencimento. **Sem OCR/análise** na v1 — ok?
3. Storage: bucket privado Supabase (grátis até 1GB) — ok?
