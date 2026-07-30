# SaaS Viability Research Prompt
**For: Immigration Compliance SaaS — U.S. visa holders out of status or at risk**
**Run in:** Claude Cowork → then Claude Code
**Expected outputs:** Market Analysis · SWOT · GO/PIVOT/KILL Verdict · Recommended Business Model

---

## How to use
Paste everything inside the `=== PROMPT START ===` / `=== PROMPT END ===` block into a fresh Cowork (or Claude Code) chat. Allow web search. Let it run end to end before reacting.

---

=== PROMPT START ===

You are a **senior strategy + product analyst** with combined expertise in:
- U.S. immigration law and USCIS policy (B/F/M/O/EB visa families, I-539, change of status, unlawful presence, public charge)
- LegalTech / vertical SaaS market analysis
- Go-to-market design for regulated industries
- Business model design (SaaS, marketplace, hybrid services)

Your job is to decide whether I should build a **SaaS product that helps individuals in the U.S. whose visa status is not up-to-date or no longer compliant with CBP/USCIS rules navigate their immigration process** — without replacing an attorney, but dramatically reducing cost, confusion, and risk.

You must produce a real strategic deliverable: **Market Analysis, SWOT, GO/PIVOT/KILL verdict, and a Recommended Business Model.** Do not produce fluff, do not hedge with "consult a lawyer" disclaimers in every paragraph — assume the reader is the founder.

---

## 1. Anchor Persona ("Felipe")

Use this real case as the anchor ICP. Do not change the facts; use them to stress-test the product.

- Brazilian citizen, 34, lives in Broward County, Florida.
- Entered the U.S. on a **B1/B2** tourist visa ~3 years ago.
- Already received **one approved B1/B2 extension**.
- A **second I-539 extension is currently pending** with USCIS (I-797C receipt notice in hand).
- While the I-539 is pending he is in **"period of authorized stay"** (USCIS Policy Manual Vol. 2, Part A, Ch. 4) — but if denied, he falls out of status immediately and any change of status falls with it.
- **Likely unauthorized employment** through an LLC he operates in the U.S. while on B1/B2 — biggest legal vulnerability.
- Background: 10+ years in Brazil as tour/event manager for music artists; no awards, publications, or formal recognitions.
- Goal: stay in the U.S., transition to a stronger long-term pathway (F1 → CPT/OPT → H1B or O1 → green card → citizenship), **without going back to Brazil for consular processing**.
- Strategy currently on the table: B1/B2 → F1 change of status at SEVP-certified school in South Florida → CPT/OPT → employer sponsorship or self-petition.

Treat Felipe as **one of millions** of similar cases — overstayers, expired status, complex change-of-status candidates, undocumented-but-eligible individuals, and people sitting on pending USCIS decisions with high anxiety and low information.

---

## 2. Required Context You Must Pull Fresh from the Web

Before analyzing, search and cite current sources (2025–2026). Do NOT rely on training data alone for any of the following:

1. **U.S. immigration enforcement & policy under the current administration (2025–2026):** ICE enforcement levels, USCIS processing times, RFE/denial rate trends, public charge interpretation, status-violation prosecutions, parole program rollbacks, TPS changes, expedited removal expansion, fee changes.
2. **Geopolitical pressure on migration:** Latin American (Brazil, Venezuela, Cuba, Haiti, Mexico, Central America) outflows, Florida/Texas/California enforcement posture, state-level laws (e.g., Florida SB 1718), CBP One / CBP Home, asylum bans.
3. **Population sizing:** estimated visa overstayers in the U.S. (DHS Entry/Exit Overstay Report — most recent year), undocumented population, B1/B2 → F1 change-of-status volumes, I-539 pending backlog, F1 applicant volume, O1 issuance trends.
4. **Existing competition:** Boundless, SimpleCitizen, Borderwise, LegalPad/Plymouth Street, Lawfully, Visadb, ImmigrationHelp.org, Atticus, Plead, niche TikTok immigration attorneys, Brazilian-market specific tools, Spanish-language tools. For top 5–8, pull pricing, scope (which visas), funding stage, recent traction signals.
5. **Regulatory guardrails for the product itself:** UPL (Unauthorized Practice of Law) rules per state, Form G-28 requirements, what a non-lawyer SaaS can legally do vs. cannot, BIA-accredited representatives, attorney-of-record requirements.
6. **Adjacent signal:** legal tech AI rulings (e.g., DoNotPay FTC action), state AG positions on AI legal advice, recent ABA guidance.

Cite every non-trivial claim with a URL. If a source is paywalled or behind login, note it.

---

## 3. Product Hypothesis to Evaluate

> A **subscription + concierge** SaaS that, given a user's current immigration situation, generates a personalized **status compliance dashboard** (where you are, what you can/can't do, what's expiring when), a **pathway plan** (best visa transitions ranked by feasibility), **document & form prep** (I-539, I-765, I-20 readiness, evidence checklists), and **attorney handoff** (matchmaking with vetted lawyers + pre-packaged case file) — with optional AI-assisted intake in Portuguese, Spanish, and English.

Stress test this hypothesis. Do not assume it is right. Propose alternative product shapes if a different cut serves the same audience better (e.g., attorney-network marketplace, B2B2C through schools/employers, compliance monitoring only, etc.).

---

## 4. Deliverables — produce all four, in this order

### A. Market Analysis
- TAM / SAM / SOM with the math shown (population × % addressable × ARPU range).
- Top 3 customer segments ranked by attractiveness (size × pain × willingness to pay × reachability), with one named persona per segment.
- Demand signals: search volume on key queries, Reddit/Facebook/WhatsApp group chatter, attorney pricing pain points, school enrollment data for international students from Latin America.
- Pricing benchmarks: what immigration attorneys charge for each major case type, what existing SaaS charges, what people actually pay today out-of-pocket.

### B. SWOT
Real SWOT, not generic — every item must be specific to *this* product in *this* regulatory + political moment. For each item add a one-line "**so what**" implication.

### C. Verdict — GO / PIVOT / KILL
- Score the opportunity 0–10 on: Market Size, Pain Intensity, Willingness to Pay, Regulatory Risk, Competitive Moat Potential, Founder Fit (assume founder = Brazilian-American with personal exposure to the problem, fluent PT/EN/ES, network in Florida Brazilian community).
- Weighted overall score and a one-paragraph verdict.
- If PIVOT: name the specific pivot (audience, wedge, geography, or model) and why.
- If KILL: name the deal-breaker explicitly.

### D. Recommended Business Model
- Pricing structure (subscription tiers? one-time? % of attorney fee? freemium?), with concrete dollar amounts.
- Unit economics sketch: CAC channel-by-channel, expected LTV, payback period.
- Wedge: the single visa situation / segment to launch with (e.g., "B1/B2 → F1 change-of-status candidates in FL/TX/CA with pending I-539").
- 12-month GTM plan: month 0–3 (MVP + first 50 paying users), 3–6, 6–12.
- Legal structure: how to operate without UPL exposure (attorney-of-record model? BIA accreditation? Network model? Disclaimers + scope limits?).
- Risks that would force a strategy reset and the early indicators to watch.

---

## 5. Format Rules

- Use the **STAR method (Situation, Task, Action, Result)** for the executive summary at the top.
- Then the four deliverables as numbered sections.
- Tables where they earn their place; prose otherwise.
- Every numeric claim and every regulatory claim must carry a citation.
- End with a **"What I'd want to validate in the next 14 days"** list — 5 concrete experiments (landing page test, 10 customer interviews, attorney partnership conversations, etc.) with success criteria.

---

## 6. Tone

Direct. Founder-to-founder. No "it depends." No legal-disclaimer padding. If something is risky, say so once, sharply, and move on.

=== PROMPT END ===
