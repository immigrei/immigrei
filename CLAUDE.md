# Immigrei — Claude Context File

> This file is read automatically by Claude Code every session.
> Keep it updated as the product evolves.
> Last updated: July 2026

---

## 1. What Is Immigrei

**One line:** Immigrei is the full immigration journey companion for Brazilians in the US — built by immigrants, for immigrants.

**Tagline (PT-BR):** Sua jornada migratória nos EUA, com clareza.

**The problem it solves:**
Brazilian immigrants in the US navigate a confusing, expensive system with no clear map. Google gives contradictory answers. Lawyers charge $300 for 15-minute calls. Existing apps (Lawfully, Boundless) only show a status badge — nothing more.

**What Immigrei does:**
Shows not just WHERE you are in your immigration journey — but WHERE YOU'RE GOING, what's required at each step, and connects users to verified professionals when needed. All in Portuguese first.

**What Immigrei is NOT:**
- Not a law firm or legal advice platform
- Not a status tracker only
- Not English-first
- Not corporate or clinical

---

## 2. Who We're Building For

**MVP Target User:**
Brazilian immigrants in the US, 25–40 years old, with active immigration cases (pending status, extensions, uncertain path). Mobile-first. Paying $0–300/month for lawyers who barely understand them.

**Jobs to be done:**
- "Tell me where my case really stands."
- "Tell me what comes next — and what my options are."
- "Help me understand this without paying a lawyer for a 15-min call."
- "Connect me to a professional I can trust, on my terms."

**Market expansion roadmap:**
1. MVP: PT-BR → Brazilians in the US
2. Phase 2: + Spanish → Latinos in the US
3. Phase 3: + English → All immigrants in the US
4. Future: Other destination countries

---

## 3. Brand Voice & Tone

**The Immigrei voice:** A trusted Brazilian friend who knows the US immigration system inside out. Not a robot. Not a lawyer. Not a support ticket.

**Brand archetype:** The Sage (Guide variant) — Immigrei is not the hero. The immigrant is the hero. Immigrei is the guide.

**Think:** Duolingo (warmth + consistency) meets a trusted mentor (authority from lived experience). Not clinical. Not corporate. Not cute. This is someone's life.

**Voice qualities:**
- Welcoming — human, approachable
- Direct — clear and honest, no legal jargon
- Experienced — authority from empathy, not from studying
- Human — real, never robotic

**Language rules:**
| USE | AVOID |
|-----|-------|
| "jornada" / "journey" | "processo burocrático" |
| "próximo passo" / "next step" | "workflow" |
| "clareza" / "clarity" | "streamline" / "revolutionize" |
| "você" (direct, welcoming) | "o usuário" / "the user" |
| "entendemos" | "nossa plataforma capacita" |
| Show, don't announce | "game-changer" / "disruptivo" |

**Language priority:** Portuguese (PT-BR) first. Always. English copy must carry the same warmth — not translate corporate.

### Regra do valor (toda interação, revisar sempre — 7 ago 2026)

Nunca soar "salesy" ou vendedor barato — em nenhum e-mail, notificação ou
tela que pede uma ação do usuário. Toda vez que a Immigrei pede algo
(adicionar um caso, terminar onboarding, atualizar pagamento, não cancelar),
a mensagem também **precisa entregar valor real**, não só o pedido. Valor
tem três formas válidas — pelo menos uma precisa estar presente:

1. **Ser direto** — às vezes o valor é cortar o enrolation e dizer o fato sem
   rodeio (o que mudou, o que acontece, até quando).
2. **Aprofundar um tema** — dar contexto real sobre a jornada da pessoa
   (status do caso, o que falta, o que um prazo específico significa para
   ela), não genérico.
3. **Esclarecer um termo técnico ou sigla** — nunca assumir que "I-94",
   "I-797", "RFE" etc. já são conhecidos. Nome em inglês + explicação em
   português na primeira menção.

**Antes de mandar qualquer e-mail/tela com um pedido, pergunte:** "isso soa
vendedor, ou entrega algo de valor mesmo que a pessoa não clique?" Se a
resposta for "só pede", reescreve.

**Onde buscar o grounding para #2/#3** (nunca inventar fato):
`content/leis/conceitos/` e `content/leis/formularios/` (a base curada,
citada), `lib/formGlossary.ts` (definições de uma linha por código de
formulário) e `lib/faqBank.ts` (perguntas já respondidas, com `fonte:`).
**Se o termo não estiver em nenhum desses lugares:** siga a mesma regra da
seção 6 abaixo — pesquisar só nas fontes oficiais de
`content/leis/fontes.md` e propor o resultado como arquivo novo. É assim
que se expande esse conhecimento — peça para o Claude fazer essa pesquisa
quando notar a lacuna, em vez de aproximar o termo de memória.

Ver `content/marketing/email-flows/README.md` §1 para a aplicação disso
especificamente nos fluxos de e-mail (inclui a distinção entre e-mail de
sinal, recibo e funil).

---

## 4. Design System

### Colors
```css
/* Primary Brand */
--pine:        #1E5E4E  /* Primary brand, CTAs, nav */
--pine-deep:   #164A3D  /* Hover, dark surfaces */
--amber:       #E8A33D  /* Primary CTA, highlights */
--amber-deep:  #CC8A22  /* Hover on amber elements */

/* Backgrounds & Surfaces */
--cream:       #F4EEE2  /* App background, main canvas */
--cream-2:     #FBF7EF  /* Card backgrounds, elevated surfaces */
--pine-tint:   #E4EFE9  /* Subtle highlights, tints */
--amber-tint:  #FBEDD4  /* Alert backgrounds, warm tags */

/* Text & Accents */
--ink:         #1B2520  /* Primary text */
--ink-soft:    #55615A  /* Secondary text, captions */
--ink-faint:   #8B958F  /* Placeholders, disabled, labels */
--sage:        #5E9E81  /* Success states */
--clay:        #C2542F  /* Errors, warnings, alerts */
```

> These colors are a competitive differentiator. Competitors use blues and grays.
> Forest greens, amber and cream are a brand asset — protect them.

### Typography
- **Display / H1–H2:** Fraunces (600–700) — emotional weight, hero moments
- **H3–H4 / UI / Body:** Hanken Grotesk (400–700) — functional text, forms, navigation

**Rule:** Fraunces carries emotional weight (headlines, hero moments). Hanken does the work (body, UI, forms). NEVER use Fraunces on form labels, navigation, or functional UI text.

### Type Scale
| Style | Spec |
|-------|------|
| Display | Fraunces 600 — 48–64px |
| H1 | Fraunces 600 — 36–40px |
| H2 | Fraunces 500 — 28–32px |
| H3 | Hanken Grotesk 700 — 22–24px |
| Body Large | Hanken Grotesk 500 — 18px, line-height 1.6 |
| Body | Hanken Grotesk 400 — 16px, line-height 1.6 |
| Label / Caption | Hanken Grotesk 700 — 11–13px, UPPERCASE, letter-spacing 1.2px |

---

## 5. Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 16 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS |
| Database | Supabase (PostgreSQL) — East US, North Virginia |
| Auth | Clerk — Email, Google (see note below) |
| Payments | Stripe (live) |
| Deploy | Vercel — immigrei.vercel.app, primary domain immigrei.app (Aug 7, 2026) |
| Repo | github.com/immigrei/immigrei |

### Auth login methods (end users):
- Email ✅
- Google ✅
- Apple ❌ — toggled on in Clerk but no Services ID/Private Key/Team ID/Key ID ever entered ("Setup required"); needs an Apple Developer Program account (paid, $99/yr) to generate real credentials — not done as of Aug 7, 2026
- Facebook ❌ — disabled deliberately (no App ID/Secret configured, and not a priority)
- Passkey ❌ — requires Clerk Pro plan; staying on Free, so not enabled
- Phone number: disabled for now (add as optional 2FA later)

### Stripe products (live, created Jul 28, 2026):
- **Immigrei** — single subscription tier; free "Retrato" tier has no Stripe product
  - Monthly: $29.90/month — `price_1Ty5wp4BxAIRzYfOnpJku6Xb`
  - Annual: $269.00/year — `price_1Ty5wp4BxAIRzYfOtgyBbThC`
- Price IDs hardcoded in `lib/stripe.ts` with env override (`STRIPE_PRICE_MONTHLY` / `STRIPE_PRICE_ANNUAL`)
- Earlier **Immigrei Base** ($9/mo) and **Immigrei Core** ($29/mo) products are archived, superseded by this tier

---

## 6. Project Structure

```
/app              → Next.js App Router pages
/lib              → Shared logic (visa journeys, strategies, cron helpers)
/content/leis     → Curated legal knowledge base (see rule below)
/content/marketing → Marketing pipeline: topic queue, unpublished drafts, agent outputs
/.claude/skills   → Marketing agent roster (content, seo-geo, distribution, email, paid)
/.claude/agents   → compliance-fact-check subagent (YMYL/UPL gate)
/public           → Static assets
CLAUDE.md         → This file
.env.local        → API keys (local only, never commit)
```

### Legal research rule
For any immigration-law question (visas, forms, denials, concepts), search
`/content/leis` FIRST — it is the closed, curated knowledge base. Only go to
the web if the topic is missing there, and then only use the official sources
listed in `content/leis/fontes.md`, proposing the result as a new file.
Current Visa Bulletin priority dates live in the Supabase `visa_bulletin`
table (updated monthly by `/api/cron/visa-bulletin` on the 10th) — never
hardcode dates.

---

## 7. Environment Variables

The `.env.local` file must contain:
```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=
CLERK_SECRET_KEY=
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
NEXT_PUBLIC_APP_URL=http://localhost:3000
VOYAGE_API_KEY=
```

> Keys are stored in the team's password manager. Never commit .env.local to GitHub.

**Security:** `.env.local` is protected by `.gitignore` (pattern `.env*`) — will never be committed to GitHub. However, local agents (Buzz, Claude Code, etc.) running on your machine have filesystem access and **can read `.env.local`**. This is intentional — agents need API credentials to function. Keep your machine secure; only run agents you trust.

---

## 8. Team

| Person | Role | GitHub |
|--------|------|--------|
| César | Co-founder (Australia) | cesarAIworld |
| Felipe | Co-founder (Florida, US) | FelipeIwamotoGonzalez |

- **Company GitHub:** github.com/immigrei
- **Business email:** visaemdia2026@gmail.com
- **Vercel team:** Immigrei

---

## 9. Coding Rules

- **Language:** Code, variables, comments, commit messages → English
- **UI copy:** Portuguese (PT-BR) first for all user-facing text
- **Commits:** Conventional Commits — `type: short imperative summary` in English. Types: `feat`, `fix`, `chore`, `docs`, `refactor`. Ex: `feat: add path manuals with blocked-route states`, `fix: correct M-1 to F-1 status change block`
- **Components:** Mobile-first always
- **Brand colors:** Use CSS variables — never hardcode hex values
- **Fonts:** Load Fraunces and Hanken Grotesk from Google Fonts
- **Tone in UI:** Follow brand voice — warm, direct, human. No jargon.

---

## 10. Build Status

**MVP foundation — all delivered:**

- [x] Next.js project scaffolded, deployed to Vercel (immigrei.vercel.app)
- [x] Supabase (East US) + Clerk (Email/Google live; Apple/Facebook/Passkey not configured — see Auth login methods above) + Stripe (live) — configured, packages installed, .env.local set
- [x] Primary domain migrated immigrei.com → immigrei.app — Vercel domain, Cloudflare DNS/DNSSEC, and Clerk's primary domain (custom Frontend API `clerk.immigrei.app` / Account Portal `accounts.immigrei.app`) all cut over (Aug 7, 2026)
- [x] Auth flow (sign up / sign in) — /vistos and /caminhos gated behind login
- [x] User onboarding flow — branching questionnaire, single best-match result card
- [x] Dashboard / immigration status view — /painel with data-driven journey progress
- [x] Immigration path visualization — /caminhos manuals + /casos/cos-b2-f1 (GPS pathway)
- [x] Professional network connection — /profissionais referral surface
- [x] Stripe payment flow — checkout + webhook (app/api/stripe, app/api/webhooks/stripe)
- [x] Legal knowledge base — content/leis; all 11 catalog visas have dedicated /vistos/[id] pages (Jul 16, 2026)
- [x] Document vault, community tab, SEVP school directory (/escolas), I-94 cron
- [x] Marketing agent roster — 5 skills + compliance subagent, pipeline docs + 4 unpublished sample drafts in content/marketing (Jul 28, 2026)
- [x] Stripe products live — single subscription tier, monthly + annual (Jul 28, 2026)
- [x] Stripe switched to live mode — checkout verified working end-to-end in production (Jul 29, 2026)
- [x] E-1/E-2 change-of-status kits — full checklist content in data.ts, not just catalog stubs
- [x] Denial-exit matrix — all 13 catalog categories covered in lib/strategies.ts (Jul 28, 2026)
- [x] "Explorar outros vistos" now shows all 22 visa categories in the documentos catalog, not just 9 (Aug 1, 2026)

**Known gaps / next up (blockers before public launch):**

- [ ] **Stripe checkout regression, unconfirmed** — 13 failed subscription attempts Jul 29–30 hit the wrong Stripe account + a malformed Authorization header; stopped on its own at 02:09 Jul 30, never confirmed as intentionally fixed. Verify against live Stripe/Vercel logs before relying on checkout again.
- [ ] **USCIS Case-Status still on sandbox** — the cron/API hit `api-int.uscis.gov`, not production. Blocks the core "where does my case stand" promise. Waiting on USCIS to grant prod access (requires 5 consecutive days of sandbox traffic, per `uscis-sandbox-traffic` cron).
- [ ] **No real-time error alerting** — Sentry has no Slack alert rule; none of the 5 Vercel cron jobs alert on failure. Needs native Sentry→Slack and Vercel monitoring setup (account-level, not code).
- [ ] Confirm the `user_processes` 42P10 fix (commit a4424c5, Jul 30) actually stopped the errors seen into the morning of Jul 31.
- [ ] **`immigrei.com` → `immigrei.app` 301 redirect not yet configured** — `.app` is now the canonical/primary domain everywhere (Vercel, Cloudflare, Clerk), but `.com` still serves independently instead of redirecting. Do this last, after confirming login end-to-end on `.app`.
- [ ] Email deliverability (SPF/DKIM/MX/Resend) is still only configured for `immigrei.com` — intentional, mail domain is independent of the web app domain and wasn't part of this migration.
