# Comunidade Immigrei — Especificação para revisão

> Rascunho de 11/07/2026 para decisão Felipe + César.
> Nada aqui foi implementado ainda. Depois da decisão: migration 014 + página no app.

---

## 1. O que é

Aba fechada de relatos da comunidade — histórias reais de imigração escritas pelos próprios usuários (Fase 2 do roadmap). Fechada de verdade: visitante deslogado não vê nada; leitura exige login; publicação exige assinatura.

**Por que não um fórum aberto estilo Lawfully:**
- Moderação de feed vivo não escala para um time de 2 pessoas
- Comunidade vazia é pior que não ter comunidade (cold start)
- Conteúdo errado sobre imigração pode prejudicar o caso de alguém — risco de marca e responsabilidade

---

## 2. A decisão pendente: formato do relato

| | v1 — Estruturado | v2 — Relato livre |
|---|---|---|
| Mockup | [artifact v1](https://claude.ai/code/artifact/f332c62f-1dce-4e96-b689-e5906e8c9bcd) | [artifact v2](https://claude.ai/code/artifact/433a07c9-a566-4abd-b563-3377787afb4c) |
| Conteúdo | Linha do tempo com marcos (datas por etapa) + tipo fixo (entrevista, RFE, aprovação...) | Texto livre escrito pela pessoa, do jeito dela |
| Vistos | 1 visto por relato (`visto_id`) | Vários vistos por relato (tabela de junção) |
| Dado gerado | Estruturado — alimenta estatísticas ("tempo médio F-1 relatado") | Narrativo — mais engajamento, menos estrutura |
| Atrito p/ publicar | Maior (formulário) | Menor (só escrever) |

**Preferência inicial do Felipe:** v2 (visual e formato).

**Caminho híbrido possível:** lançar com o formato da v2 e adicionar depois a linha do tempo da v1 como campo *opcional* dentro do relato — menor atrito no início, dado estruturado no futuro. As versões não são excludentes.

**Única decisão que trava o schema:** multi-visto por relato (v2). Se confirmada, a migration nasce com tabela de junção. Custo técnico/performance é idêntico nas duas — a escolha é 100% de produto.

---

## 3. Decisões já acordadas (valem para qualquer versão)

- **Fechado por RLS** — leitura só com JWT do Clerk; garantido no banco, não só na UI
- **Publicar/reagir = assinante** — checado na API route via `lib/plan.ts` (mesmo padrão do resto do app). Gating ajustável depois sem mexer no schema (ex.: leitura Base, publicação Core)
- **Moderação prévia** — todo relato entra como `pending`; só aparece após aprovação manual (Felipe/César, admin simples). É o freio certo para o volume atual
- **Anonimato opcional, default ligado** — nome vira "Membro Immigrei"; medo de exposição é a maior barreira para publicar
- **Estado do autor sempre visível** — mesmo anônimo (ex.: "Membro Immigrei · Flórida"). Dado valioso para o banco e para conexão local entre usuários
- **Sem comentários no lançamento** — reação "Me ajudou" dá o sinal social sem abrir a porta da moderação contínua
- **Escrita só via API route (service role)** — sem policy de insert; validação de plano, tamanho e rate limit no servidor (padrão do `user_documents`)

---

## 4. Anti-spam e anti-contato (3 peneiras)

O paywall reduz spam mas **não isenta**: para consultor/despachante, $29/mês é anúncio barato para um público-alvo perfeito. As camadas:

1. **Filtro automático de contato** — bloqueia telefone, e-mail, links, wa.me, "me chama no zap/insta" antes do envio:
   - No app: aviso em tempo real enquanto digita
   - Na API: validação de novo no servidor (a barreira que conta)
   - Regex de referência: e-mail, telefone BR/US, `https?://|www\.|wa\.me|bit\.ly|t\.me|@handle`, `whatsapp|zap|telegram|insta|direct|dm`
   - Aplicar em relatos E comentários (quando existirem)
2. **Moderação prévia manual** — pega os criativos que burlam o filtro ("quatro zero sete...", "gmail ponto com") — texto burlado salta aos olhos
3. **Botão "denunciar"** — a comunidade como segunda camada, de graça

**Extras desde o início:**
- Termos da comunidade com regra explícita de "sem autopromoção" → base para rejeitar e banir (inclusive cancelar assinatura de reincidente)
- Bloquear troca de contato também **protege o modelo de negócio**: conexão com profissional é pela rede verificada do Immigrei (Fase 4), não por WhatsApp no comentário

**Risco que filtro nenhum resolve:** conselho errado de boa fé ("pode viajar com I-539 pendente"). Só a moderação prévia segura isso. Disclaimer visível: relatos não são orientação jurídica.

---

## 5. Schema rascunhado (migration 014, não criada)

```sql
-- Núcleo (igual nas duas versões)
create table if not exists community_reports (
  id             uuid primary key default gen_random_uuid(),
  user_id        text not null references profiles(clerk_user_id) on delete cascade,
  title          text not null,
  body           text not null,                 -- limite de tamanho na API
  is_anonymous   boolean not null default true,
  author_state   text not null,                 -- estado sempre visível
  status         text not null default 'pending'
                   check (status in ('pending', 'approved', 'rejected')),
  created_at     timestamptz default now(),
  updated_at     timestamptz default now()
);

-- SE v1: coluna única + tipo fixo
--   visto_id     text not null,
--   report_type  text not null check (report_type in
--                  ('timeline','interview','rfe','denial','approval')),
--   milestones   jsonb not null default '[]',

-- SE v2: multi-visto via junção (many-to-many, padrão Postgres, custo irrisório)
create table if not exists report_visas (
  report_id  uuid not null references community_reports(id) on delete cascade,
  visto_id   text not null,   -- ids do lib/vistosCatalog
  primary key (report_id, visto_id)
);

alter table community_reports enable row level security;

-- Logado lê aprovados; autor sempre vê os próprios
create policy "Authenticated users read approved reports"
  on community_reports for select
  using (
    status = 'approved'
    or user_id = current_setting('request.jwt.claims', true)::json->>'sub'
  );

-- Reação "Me ajudou" (uma por usuário por relato)
create table if not exists report_reactions (
  report_id   uuid not null references community_reports(id) on delete cascade,
  user_id     text not null references profiles(clerk_user_id) on delete cascade,
  created_at  timestamptz default now(),
  primary key (report_id, user_id)
);
```

**Comentários (fase futura, não trava nada agora):**

```sql
create table if not exists report_comments (
  id          uuid primary key default gen_random_uuid(),
  report_id   uuid not null references community_reports(id) on delete cascade,
  user_id     text not null references profiles(clerk_user_id) on delete cascade,
  body        text not null,
  status      text not null default 'pending',   -- mesma moderação
  created_at  timestamptz default now()
);
```

Adicionável a qualquer momento sem mexer no que existe. O cuidado é operacional, não técnico: comentário multiplica moderação. Sugestão: lançar sem; abrir depois, talvez só para Core.

**Sobre peso/limites:** free tier do Supabase = 500 MB. A junção custa ~60 bytes/linha; 1 milhão de relatos × 3 vistos ≈ 180 MB. Consulta "relatos de F-1" é índice simples, milissegundos. Não é preocupação.

---

## 6. Faseamento proposto

1. **Lançamento:** relatos (formato a decidir) + "Me ajudou" + filtro anti-contato + moderação prévia + denunciar
2. **Com volume:** comentários (moderados, talvez só Core)
3. **Depois:** estatísticas agregadas dos relatos ("tempo médio relatado por visto") — de graça se houver dado estruturado (v1 ou híbrido)

## 7. Próximos passos

- [x] Felipe + César: **v2 escolhida** (relato livre, multi-visto) — 11/07/2026
- [x] Migration criada: `015_community_reports.sql` (a 014 já existia) — **César precisa rodar no Supabase** (013 também pendente)
- [x] API routes `/api/community` + `/api/community/reactions` — plano, filtro anti-contato, rate limit 3/dia
- [x] Página `/comunidade` + aba na navegação
- [ ] Confirmar gating: hoje leitura = qualquer logado; publicar/reagir = assinante (mudar é 1 linha na API)
- [ ] Admin simples de moderação (por enquanto: aprovar mudando `status` no painel do Supabase)
- [ ] Termos da comunidade (sem autopromoção, não é orientação jurídica) — regra já aparece no formulário
