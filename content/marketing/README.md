# Marketing Machine — Immigrei

Agent-run, human-gated marketing system. Source strategy:
`Marketing Agent/compass_artifact_wf-19b5f48f...md` (external drive).

## The roster

| Agent | Where | In → Out |
|---|---|---|
| Content | `.claude/skills/content-agent` | topic → unpublished draft in `drafts/` |
| Compliance/Fact-Check | `.claude/agents/compliance-fact-check.md` | draft → verdict + flags (read-only) |
| SEO/GEO | `.claude/skills/seo-geo-agent` | approved draft → route/schema/sitemap/IndexNow |
| Distribution-Assist | `.claude/skills/distribution-assist` | published post → Reel/carousel/comment drafts |
| Lifecycle-Email | `.claude/skills/lifecycle-email` | flow name → copy + segment SQL + Resend spec |
| Paid-Experiment | `.claude/skills/paid-experiment` | budget + hypothesis → ad specs + weekly readout |

## Pipeline and gates

```
topic-queue.md
   │  /content-agent
   ▼
drafts/<slug>.md  (status: draft)
   │  compliance-fact-check subagent → compliance_check: PASS/…
   ▼
HUMAN GATE — César reviews, sets status: approved   ← nothing skips this
   │  /seo-geo-agent (promote into app/, sitemap, IndexNow)
   ▼
published → /distribution-assist → founders post personally
```

**Non-negotiables** (YMYL/UPL — see the strategy doc):
- No draft ships without the compliance verdict AND César's `status: approved`.
- No agent ever posts to communities, sends email to real users, or spends money.
- No personalized legal directives, ever. Disclaimer on every page.
- Facts trace to `content/leis/` or the whitelist in `content/leis/fontes.md`.

## Draft template

```markdown
---
title: ""                # page H1 (contains English status string verbatim if status page)
slug: ""
type: status | form-lifecycle | decoder | concept
query_target: ""         # the exact search string we want to rank for
status: draft            # draft → approved → published (César flips approved)
compliance_check: pending  # PASS | PASS_WITH_FLAGS | FAIL — set by subagent
reviewed_by: pending     # César's name + date when approved
byline: Equipe Immigrei
sources:
  - https://www.uscis.gov/...
verificado_em: pendente  # date when facts checked against live sources
---

<answer-first block, 2–3 sentences>

## <question-formatted H2s>...

## Perguntas frequentes
...

<CTA>

---
*Este conteúdo é informativo e não constitui aconselhamento jurídico; consulte
um advogado de imigração licenciado para o seu caso.*
```

## Weekly cadence (two part-time founders)

| Day | What | Owner |
|---|---|---|
| Mon | Content agent drafts 2–3 pieces → compliance → César reviews | César (editorial) |
| Tue | SEO/GEO processes last week's approvals; IndexNow pings | agent + César merge |
| Wed–Thu | Distribution-Assist assets; founders post personally | Felipe (community) |
| Fri | Lifecycle-email review; paid readout + adjust | César |

## Directory map

```
drafts/          unpublished content drafts (the only place agents write copy)
repurposed/      per-post distribution assets (reel/carousel/comments)
email-flows/     lifecycle flow specs
paid/            experiment specs + weekly readouts
topic-queue.md   prioritized backlog the content agent pulls from
engagement-log.md  who posted what where, and what happened
```
