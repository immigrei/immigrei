# Immigrei: An Agent-Run Marketing Machine for a Bootstrapped PT-BR Immigration SaaS

## TL;DR
- **Build the content + SEO/GEO agents and the transactional-alert email flow first, treat paid ads as a tiny experiment, and keep all community distribution founder-led.** With an 80%-complete product and zero distribution, your fastest path to first signups is a PT-BR programmatic-SEO + case-status-message content engine (agent-drafted, human-reviewed) plus founder-led seeding in Brazilian Facebook/WhatsApp groups — **not** paid ads.
- **$200/month is too small for Google immigration keywords** (Legal is consistently one of the highest-CPC verticals in the WordStream/LocalIQ Google Ads benchmarks — averaging roughly $6–$9/click across legal, with high-intent immigration-attorney terms running well above that). Spend the budget instead on Meta retargeting + one tightly-scoped Meta prospecting test to Brazilian-Portuguese audiences (low CPMs), treated as signal generation, not growth.
- **A 5–6 agent roster** — Content, Compliance/Fact-Check, SEO/GEO, Distribution-Assist, Lifecycle-Email, and an optional Paid-Experiment agent — implemented as reusable `SKILL.md` skills + isolated subagents fits your Loop Kit pattern. Every agent that touches immigration facts **must** pass through a human review gate, because immigration content is YMYL and carries unauthorized-practice-of-law (UPL) risk.

> **Important sourcing note:** Live web search/fetch tools failed in this environment, so no figure below could be verified against a live 2026 primary source. I have named the correct authoritative source for each key claim and flagged everything that must be re-confirmed. Pricing, CPCs/CPMs, and study percentages change frequently — verify before acting.

## Key Findings

### 1. Legal/compliance is the binding constraint, not marketing tactics
- Immigration content is **YMYL ("Your Money or Your Life")** in Google's *Search Quality Rater Guidelines*. Google explicitly names topics that "could significantly impact the health, financial stability, or safety of people" — legal and immigration guidance sit squarely in this category — and applies the highest **E-E-A-T** (Experience, Expertise, Authoritativeness, Trustworthiness) bar to them. *(Verify against the current SQRG PDF, the section defining YMYL.)*
- Google does not ban AI content, but its helpful-content and spam policies penalize **scaled content produced primarily to game rankings without added value**. Automated YMYL content without human review and demonstrable expertise is high-risk for suppression.
- **UPL (Unauthorized Practice of Law):** A non-attorney publishing *specific* immigration guidance can cross into unauthorized practice if it functions as advising individuals on their own legal situations. General, sourced, educational information ("here is what this status generally means") is far safer than personalized directives ("you should file X").
- **USCIS data terms:** A third-party case-status tracker that polls USCIS systems is legally sensitive. USCIS does not offer a broad public status API for arbitrary third parties; you must respect the Case Status Online site's terms, robots rules, and rate limits, and must never imply USCIS endorsement or affiliation. **Get an attorney opinion on your data source before scaling.**

### 2. GEO (getting cited by ChatGPT/Perplexity/AI Overviews) rewards exactly the content immigration needs
- The foundational study — **Aggarwal et al., "GEO: Generative Engine Optimization" (Princeton / Georgia Tech / Allen Institute for AI, KDD 2024, arXiv:2311.09735)** — found that adding **citations, quotations, and statistics** boosted a source's visibility in generative-engine answers by **up to ~40%**, while keyword-stuffing did **not** help (and could hurt). This is a direct inversion of some classic SEO instincts.
- Industry AI-citation analyses (e.g., Profound, Semrush/BrightEdge-style studies) consistently report that answer engines disproportionately cite **Reddit, Wikipedia, and YouTube**, and that being cited correlates strongly with already ranking in classic organic results. GEO and SEO overlap heavily but are not identical. *(Pull the exact per-domain citation-share percentages from the named study before quoting them.)*
- **Implication for Immigrei:** structured, sourced, statistic-rich PT-BR explainers (citing uscis.gov, quoting official processing-time data) are simultaneously good SEO and good GEO. This is your single highest-leverage content format.

### 3. There is a real PT-BR programmatic-SEO gap around case-status meanings
- English incumbents — **CaseStatus.com, Lawfully, VisaVerge, Boundless**, and large law-firm sites — occupy English case-status and processing-time queries well.
- PT-BR coverage of the exact USCIS status-message meanings ("Case Was Received," "Request for Evidence Was Sent," "Card Was Mailed To Me," "Case Was Approved") is comparatively thin — a defensible programmatic play in Portuguese.
- A crucial nuance: **USCIS shows status text in English even to Brazilian users**, so many Brazilians search the *English* status string. The winning format is a **bilingual page that ranks on the English status string but explains in PT-BR.**
- The Brazilian diaspora congregates overwhelmingly in **Facebook groups and WhatsApp/Telegram**, with **Instagram Reels** the dominant creator format; Reddit is secondary for Brazilians.

### 4. $200/month paid is a signal budget, not a growth budget
- Google Ads immigration/legal keywords are among the most expensive verticals (Legal is a top-CPC category in the WordStream/LocalIQ benchmarks), so $200/mo buys only a handful of clicks — not enough for growth or even clean testing on Google search.
- Meta ads to Brazilian-Portuguese audiences are far cheaper (Brazil is a low-CPM market per Meta/industry advertising benchmarks; US-based PT-BR audiences cost more but still far below legal-keyword Google CPCs). *(Confirm the specific Brazil-vs-US CPM figures from a named benchmark before budgeting.)*
- Immigration **services** ads are generally **not** a Meta Special Ad Category — BUT immigration framed as a **social/political issue** CAN trigger the Social Issues category (restricted targeting + authorization + disclaimers). Keep creative strictly product/utility-focused.

### 5. Email/lifecycle is where an agent delivers value fastest and safest
- The core value prop — **case-status-change alerts** — is transactional email, kept strictly separate from marketing streams for both deliverability and legal reasons.
- A near-zero-budget, Vercel/Supabase-friendly stack points to **Resend** for transactional plus a lightweight marketing tool; alternatives are Loops, Postmark, Brevo, SendGrid, Customer.io.
- Because the audience includes Brazilians in Brazil, **LGPD** applies alongside US **CAN-SPAM** — you need documented consent, clear sender identity, and easy unsubscribe on marketing mail.

## Details

### AREA 1 — Content Agent

**Pipeline (agent-run, human-gated):**
1. **Ingestion** — Agent pulls a keyword/topic list you maintain (PT-BR seed terms + USCIS form/status enumerations). *Fully automatable.*
2. **Brief generation** — Agent produces an outline: target query, search intent, required uscis.gov citations, and a "facts to verify" list. *Automatable.*
3. **Drafting** — Agent writes the PT-BR draft in house style: educational tone, cites official sources, includes at least one statistic and one direct quote (GEO best practice). *Automatable.*
4. **Fact-check / compliance pass** — A **separate subagent** re-checks every factual claim against a source whitelist (uscis.gov, travel.state.gov, Federal Register), confirms there's no personalized legal advice, and inserts the standard disclaimer. *Automatable draft, **human sign-off required.***
5. **Publish** — Agent formats to MDX, injects schema, opens a PR/CMS draft. Human approves and merges.

**YMYL / E-E-A-T guardrails the agent MUST enforce:**
- A real author byline with credentials; if no attorney, byline a named founder and clearly mark content as informational.
- A visible disclaimer on every immigration page (PT-BR): *"Este conteúdo é informativo e não constitui aconselhamento jurídico; consulte um advogado de imigração licenciado para o seu caso."*
- Every factual claim linked to an official primary source.
- No "you should file X" personalized directives — only "here is what this generally means."
- A human review gate before publish — non-negotiable in this niche.

**PT-BR content opportunity map:**
- **Incumbents:** Brazilian-focused US immigration law firms (e.g., Santos Lloyd), diaspora media (**AcheiUSA, Brazilian Times, Gazeta Brazilian News**), and many Instagram/YouTube attorney-creators focused on EB-2 NIW, student visas, and green cards. *(Verify current names/reach.)*
- **Gaps:** precise, non-salesy PT-BR explainers of status messages, receipt-number prefixes, service-center/field-office processing times, and step-by-step "what happens after you file I-130 / I-485 / I-539 / I-765 / N-400." Incumbents underserve this utility content because they sell services, not tools — that is your wedge.

### AREA 2 — SEO + GEO

**Programmatic SEO play (defensible):**
- Templated PT-BR (bilingual) pages for: each USCIS **status message** meaning; each **form-type lifecycle** (I-130, I-485, I-539, I-765, N-400); **service-center/field-office processing times**; a **receipt-number prefix decoder** (EAC / WAC / LIN / SRC / IOE / MSC).
- Each page: answer-first summary, official-source citation, a current statistic, a short FAQ block, and a soft CTA to the tracker — a format that serves classic SEO *and* GEO citation.
- **Validate demand before mass-generating.** If PT-BR volume for a status query is thin, publish bilingual (rank on the English status string USCIS actually displays, explain in PT-BR).

**GEO tactics baked into every page:** inline citations to named official sources; at least one quoted statistic; question-formatted H2/H3s; `FAQPage`/`Article` schema; a concise answer-first block. Build brand presence over time on Reddit/YouTube (heavily cited by answer engines).

**Technical SEO (Next.js/Vercel):**
- `hreflang` pairs for `pt-BR` and `en`; self-referencing canonicals; clean localized URLs (e.g., `/pt/status/...`).
- Schema: `Article`, `FAQPage`, `BreadcrumbList`, `Organization` (entity clarity aids LLM extraction).
- Dynamic `sitemap.xml`; Google Search Console + Bing submission; **IndexNow** to instantly push new/updated URLs to Bing/Yandex (which feed some AI answer engines) — trivial to automate from Vercel.

**Automatable vs. human:** templating, schema injection, sitemap/IndexNow pings, internal linking, and draft copy are automatable; choosing which clusters to build, verifying legal safety, and final publish approval stay human.

### AREA 3 — Traffic / Distribution (non-paid)

**Where the audience actually is:**
- **Facebook Groups** — the dominant diaspora channel: city/region groups ("Brasileiros em Orlando/Boston/Miami/Massachusetts/New York") and process-specific groups (EB-2 NIW, green card).
- **WhatsApp / Telegram** — invite-linked niche process groups.
- **Instagram** — Reels are the PT-BR immigration lingua franca.
- **Reddit** — r/immigration, r/USCIS, r/EB2_NIW, r/immigrationlaw (English-dominant; secondary for Brazilians).
- **YouTube / TikTok** — PT-BR "morar nos EUA" creators.

**Norms — what works vs. what gets banned:**
- r/immigration and r/USCIS strongly prohibit self-promotion/solicitation; blatant link-drops are removed/banned. Genuine, helpful answers with an occasional disclosed, relevant link are tolerable — tread carefully. *(Read each subreddit's current rules verbatim.)*
- Brazilian Facebook groups frequently ban "divulgação" or restrict it to specific days/threads with admin approval; the community is scam-wary. Value-first participation and following pinned rules is essential.

**Honest limit on automation:** community distribution **must be founder-led.** Automated posting will get accounts banned and destroy trust. An agent CAN: draft value-first replies for you to personally post; monitor keyword mentions to surface threads worth answering; run a content-repurposing pipeline (each blog post → Instagram Reel script + carousel + a Reddit-appropriate helpful comment); and log where you've engaged. **The human presses "post."**

**Partnerships / affiliate angles:**
- Brazilian immigration attorneys/consultancies — co-marketing: they recommend a useful free tool to clients; you gain distribution and E-E-A-T from a credentialed reviewer.
- Despachantes/consultants — useful but vet for reputation risk.
- PT-BR immigration YouTubers/Instagram creators — offer a free branded tool, referral codes, or revenue share.
- A **credentialed attorney "content reviewer" partnership** simultaneously solves E-E-A-T, reduces UPL exposure, and opens a referral channel — do this early.

### AREA 4 — Paid Ads at $200/month

**Verdict: paid is optional and small. Do NOT run Google search ads on immigration keywords at this budget** — a few clicks/month yields no signal. If you run anything:
- **Meta prospecting test (~$100–120/mo):** one campaign, PT-BR creative, split between (a) Brazilians in the US and (b) interest-based Brazil audiences. Objective: cheap traffic + email capture, not conversions. Learn which segment and message resonate.
- **Meta/Instagram retargeting (~$40–60/mo):** retarget site visitors and video viewers — far more efficient per dollar than cold prospecting.
- **Cheaper micro-tests:** Reddit ads (cheap CPCs, can target r/immigration / r/USCIS); TikTok/Instagram organic-first with paid boosting only on proven winners. YouTube pre-roll is possible but hard to optimize at this budget.
- **Policy:** keep creative purely utility-focused ("acompanhe seu caso no USCIS") to avoid the Meta Social Issues category. Never use advocacy/policy language.

**What the Paid agent does:** generate PT-BR ad-copy/creative variants, propose audience hypotheses, set budget pacing, and produce a weekly readout with a kill/scale recommendation. Human approves spend and creative.

### AREA 5 — Email / Lifecycle Flows

**Two separate streams:**
- **Transactional** (core product value): case-status-change alerts, receipt confirmations, password resets. High-deliverability, no marketing content.
- **Marketing/lifecycle:** welcome, activation, trial-to-paid, dunning, reactivation, education drips. Requires consent + unsubscribe.

**Core flows to build:**
1. Welcome + activation (get them to add their first case number).
2. Activation nudge (account created, no case tracked).
3. Free-to-paid / trial-to-paid conversion.
4. Product-triggered status-change alerts (the hook).
5. Dunning (card failures).
6. Reactivation (dormant users).

**Deliverability essentials:** set SPF, DKIM, DMARC; use separate subdomains (`notify.immigrei.com` for transactional, `mail.immigrei.com` for marketing) so a marketing complaint can't poison alert deliverability; warm the domain gradually.

**Legal:** CAN-SPAM requires accurate headers, a physical address, and honored opt-outs. **LGPD** (and GDPR-style expectations) apply to Brazilians in Brazil — collect and document explicit marketing consent and offer access/deletion. Status alerts about a user's own case are generally permissible service messages, but confirm consent language at signup.

**Infrastructure (near-zero budget, Supabase/Vercel):**
- **Resend** — developer-first, clean API, React Email templates; its published free tier has historically been **3,000 emails/month (≈100/day), 1 domain**, with a Pro tier around **$20/mo for ~50,000 emails**. Best default for agent-driven transactional + light marketing. *(Confirm current numbers at resend.com/pricing.)*
- **Loops** — pleasant visual lifecycle flows for founder-run marketing; pairs well with Resend for transactional. *(Verify current contact-based pricing.)*
- **Postmark** — best-in-class transactional deliverability if alerts must never miss; smaller free allowance.
- **Brevo** — generous daily free tier (historically ~300 emails/day); good if you want marketing + email in one cheap tool.
- **SendGrid (Twilio)** — a long-standing free tier (historically 100 emails/day); reliable workhorse but more setup. *(Confirm current free-tier limits at Twilio SendGrid pricing — plans have changed.)*
- **Customer.io** — most powerful behavioral automation but no meaningful free tier; overkill now.
- **Recommendation:** **Resend for transactional alerts**, plus **Resend Broadcasts or Loops** for lifecycle marketing. Revisit Customer.io only after real volume and revenue.

**Automatable vs. human:** copy variants, segment definitions (SQL against Supabase), flow specs, and send-time logic are agent-automatable; consent/legal language, offer strategy, and pricing messaging stay human.

### AREA 6 — Agent Architecture & Orchestration

**Skills vs. subagents (Claude Code, 2026):**
- A **Skill** is a folder with a `SKILL.md` (YAML frontmatter: `name`, `description`; body = instructions; optional bundled scripts/resources). It loads via **progressive disclosure** — Claude sees only name+description until a task matches, then loads the body, then any resources. Use skills for reusable procedures/knowledge in the *current* context.
- A **Subagent** lives in `.claude/agents/*.md` (frontmatter `name`, `description`, optional `tools`/`model`; body = system prompt) and runs in an **isolated context window** with its own toolset. Use subagents to offload self-contained work (e.g., the compliance/fact-check pass) so it doesn't pollute main context and returns only a condensed result.
- **Pattern for Immigrei:** the orchestrator (you, in Claude Code) triggers a skill; the skill delegates the risky verification step to a subagent; the result returns for your human review gate. This mirrors your **Loop Kit**: reusable, composable, markdown-defined, founder-triggered. *(Confirm exact frontmatter field names against current Anthropic Agent Skills / Claude Code subagent docs.)*

**Reusable building blocks to adapt rather than build:** Anthropic's official skills repo plus community "awesome-claude-code" and subagent collections contain SEO, copywriting, and code-review agents you can fork. Fork and adapt rather than writing from scratch. *(Verify current repo names/contents live before relying on them.)*

**Recommended roster (5–6 agents):**
1. **Content Agent (skill)** — in: keyword/topic → out: PR-ready MDX draft + citations. Delegates to →
2. **Compliance/Fact-Check Agent (subagent)** — in: draft → out: verified draft + flag list + disclaimer. **Hard human gate.**
3. **SEO/GEO Agent (skill)** — in: published URL/cluster → out: schema, hreflang, internal links, sitemap + IndexNow ping, GEO checklist.
4. **Distribution-Assist Agent (skill)** — in: a published post → out: Reel script, carousel copy, PT-BR helpful-comment drafts, list of relevant threads to answer — for the human to post.
5. **Lifecycle-Email Agent (skill)** — in: flow name + segment → out: PT-BR copy variants, segment SQL, flow spec for Resend/Loops.
6. *(Optional)* **Paid-Experiment Agent (skill)** — in: budget + hypothesis → out: ad variants, audience spec, weekly readout + kill/scale call.

**Weekly cadence (two part-time founders):**
- **Mon:** Content Agent drafts 2–3 pieces → Compliance subagent → founder review (Cesar owns editorial).
- **Tue:** SEO/GEO Agent processes last week's publishes; IndexNow pings.
- **Wed/Thu:** Distribution-Assist generates repurposed assets; founders personally post/engage (Felipe owns community).
- **Fri:** Lifecycle-Email review; Paid-Experiment readout + adjust.

**Build sequence (fastest time-to-first-signup):**
1. **Transactional email / status alerts** — this IS the product's core loop; ship it first so early users get value and refer.
2. **Content + Compliance agents** — start the SEO/GEO flywheel immediately (long lead time).
3. **SEO/GEO agent** — technical foundation + programmatic templates.
4. **Distribution-Assist agent** — repurpose content into founder-led community seeding.
5. **Paid-Experiment agent** — last, once landing pages and email capture are worth sending traffic to.

## Recommendations

### 30 / 60 / 90-day sequence

**Days 0–30 — Foundation + first value loop**
- Stand up transactional email (Resend), SPF/DKIM/DMARC, and the status-change alert flow. This is the #1 build.
- Recruit ONE credentialed PT-BR immigration attorney as a paid/affiliate **content reviewer** — solves E-E-A-T + UPL + a referral channel in one move.
- Build the Content Agent + Compliance subagent; publish **8–12 PT-BR/bilingual status-message and form explainers** with disclaimers and uscis.gov citations.
- Founders manually join and *observe* (no promotion yet) the top ~10 Brazilian Facebook/WhatsApp groups and read the rules.
- **Benchmark:** first 10–25 signups from personal network; first pages indexed.

**Days 31–60 — Flywheel + distribution**
- Ship the SEO/GEO agent: schema, hreflang, sitemap, IndexNow; scale programmatic templates to 50–100 pages if demand validates.
- Launch Distribution-Assist: repurpose each post into Reels/carousels; founders post value-first in 2–3 communities weekly (Felipe owns this).
- Add welcome / activation / free-to-paid lifecycle flows.
- Start the $200/mo Meta test: mostly retargeting + one small PT-BR prospecting set. Treat as signal.
- **Benchmark:** organic impressions climbing in Search Console; email activation rate >40%; first attributable organic signups.

**Days 61–90 — Optimize + partner**
- Double down on whichever channel produced signups; cut the rest.
- Formalize 2–3 creator/attorney partnerships with referral codes.
- Add dunning + reactivation flows; measure free-to-paid conversion.
- Decide on paid: kill Meta prospecting if CPA is unviable; keep only retargeting if it beats organic CPA.
- **Benchmark:** a repeatable weekly signup number; a documented, agent-run content cadence; at least one partnership driving referrals.

### Thresholds that change the plan
- **Thin PT-BR search volume** → pivot programmatic pages fully bilingual (rank on the English status string USCIS displays, explain in PT-BR) and lean harder on community + creators.
- **Meta prospecting CPA > ~2× organic CPA after 30 days** → cut prospecting, keep retargeting only.
- **Any content triggers helpful-content suppression** → pause programmatic generation; add original data and attorney co-authorship on cornerstone pages.
- **A community bans you** → stop all automated-feeling behavior; shift to pure value contribution and creator partnerships.

## Caveats
- **No live web verification was possible in this environment.** Every figure — Resend/Loops/Postmark/Brevo/SendGrid/Customer.io pricing, Google Ads CPCs (WordStream/LocalIQ), Meta CPMs, the GEO "up to ~40%" figure (Aggarwal et al., arXiv:2311.09735, KDD 2024), the YMYL definition in Google's Search Quality Rater Guidelines, answer-engine citation shares, Claude Code Skills/subagent frontmatter fields, and named PT-BR creators/groups/repos — is from prior knowledge and **must be re-verified against primary sources before you act.**
- **UPL and USCIS ToS are genuine legal risks.** Get a one-time consult with a US immigration attorney on (a) whether your content/product crosses into legal advice and (b) the legality and terms of your case-status data source, before scaling. Treat this as a gating item.
- **Meta Social Issues classification is enforcement-sensitive.** A utility framing usually avoids it, but test with a real ad account and be ready to adjust.
- **AI-content risk in YMYL is real.** Google can suppress scaled, low-value content. Your moat is human expertise (attorney reviewer), original data (your own processing-time/status aggregates), and genuine utility — not volume.
- **Automation limits are firm:** community posting, legal review, consent language, and spend approval must stay human. No agent should ever auto-post to communities or auto-send unreviewed immigration claims.