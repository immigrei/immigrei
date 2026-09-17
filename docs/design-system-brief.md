# Design System Brief — for a Claude Design session

> Paste the prompt below into a fresh Claude session that has **Claude Design**
> and the **immigrei/immigrei GitHub repo** connected. It produces an audit, a
> token spec, a visual canvas, and handoff docs — it does not refactor existing
> components in that pass.

---

You are helping build the design system for Immigrei, a mobile-first web app
(Next.js 16 App Router, Tailwind CSS v4, TypeScript) that guides Brazilian
immigrants through the US immigration journey. You have access to the GitHub
repo (immigrei/immigrei) and to Claude Design for producing a visual canvas.

## Step 1 — Audit what exists (read before you design)

- `CLAUDE.md` sections 3 (Brand Voice), 4 (Design System), 9 (Coding Rules).
- `app/globals.css` — the current source of truth for design tokens. Tailwind
  v4 CSS-first: raw values on `:root`, exposed to utilities via `@theme inline`.
  Note the custom `@utility` helpers (`safe-area-pb`, `animate-jornada-pulso`)
  and the `jornada-pulso` keyframe.
- `app/components/` — existing components: AppShell, BottomNav, Card, CtaButton,
  Eyebrow, Faq, Footer, Logo, OptionsList, PaywallGate, SectionHeading,
  SearchFab, I94Card, ParallelProcessesCard, CaseTrackerComingSoonBanner, etc.
- Real screens to open and understand: `app/onboarding`, `app/painel`,
  `app/caminhos`, `app/vistos/[id]`, `app/profissionais`, `app/planos`,
  `app/sign-in`, `app/dashboard`, `app/documentos`.
- The standalone HTML prototypes at repo root (`immigrei-prototype.html`,
  `proximos-passos.html`) for earlier visual intent.

Produce a short written audit first: what's consistent, what's ad hoc
(one-off spacing, hardcoded hex, font misuse), what's missing (no defined
spacing scale, elevation, radii, focus states, dark mode, motion rules,
form/input states, empty/error/loading states).

## Step 2 — Define the system

Brand constraints (non-negotiable):
- Palette: pine/amber/cream forest tones. This is a competitive differentiator
  — competitors use blue/gray. Keep the existing hex values in `globals.css`
  unless you have a contrast reason to adjust, and document any change.
- Type: Fraunces (600–700) for emotional weight only — Display/H1/H2, hero
  moments. Hanken Grotesk (400–700) for everything functional: H3–H4, body,
  UI, forms, nav. NEVER Fraunces on form labels, nav, or functional UI.
- Mobile-first always. Bottom-nav app shell, notch/safe-area aware.
- UI copy is PT-BR first, warm and direct — no jargon. When mocking screens,
  write realistic Portuguese copy, not lorem ipsum.
- Voice: the Sage/Guide — the immigrant is the hero, Immigrei is the guide.

Deliver these as tokens (extend `globals.css` in the same CSS-first pattern):
- Full type scale (already sketched in CLAUDE.md §4 — formalize it with
  line-heights, weights, letter-spacing, and the label/caption uppercase rule).
- Spacing scale, radii, border widths, elevation/shadow steps.
- Semantic color roles on top of the raw palette (surface, surface-raised,
  border, text-primary/secondary/faint, success=sage, error/warn=clay,
  focus ring, CTA). Keep raw brand hex separate from semantic aliases.
- Interaction states: hover/active/focus-visible/disabled for buttons, links,
  inputs, cards, list rows.
- Motion: durations, easing, and when the `jornada-pulso` "you are here"
  treatment applies.
- A decision + tokens for dark mode (recommend: define it now even if shipped
  later, using `prefers-color-scheme` + a `[data-theme]` override).
- Accessibility: verify text/afford contrast against cream (`--cream`
  #F4EEE2) and cream-2 backgrounds; flag any pair below WCAG AA and propose
  the fix.

## Step 3 — Visual canvas (Claude Design)

Build one canvas with these artboards, all mobile width (~390px) unless noted:
1. Foundations: color tokens (raw + semantic, light + dark), type scale
   specimen, spacing/radii/elevation, iconography notes.
2. Core components in every state: primary/secondary/ghost buttons, text
   input + select + checkbox/radio, Card, list row (OptionsList), Eyebrow +
   SectionHeading, BottomNav, SearchFab, PaywallGate, banner/alert, badge/tag,
   progress/journey step (with the "agora" pulse state), empty state,
   loading skeleton, error state.
3. Screen: Onboarding question + single best-match result card.
4. Screen: `/painel` dashboard — journey progress, next step, case status.
5. Screen: `/caminhos` path manual, including a blocked-route state.
6. Screen: `/vistos/[id]` visa detail.
7. Screen: `/profissionais` referral surface + `/planos` paywall.
8. One desktop-width (~1280px) artboard showing how the app shell adapts.

## Step 4 — Handoff docs

- Write `docs/design-system.md`: tokens, usage rules, component anatomy,
  do/don't examples, the Fraunces-vs-Hanken rule, accessibility notes.
- Provide the exact diff for `app/globals.css` (new/renamed tokens), keeping
  the `@theme inline` pattern and not breaking existing utility names.
- List which existing components in `app/components/` need refactors to match
  the system, ranked by how visible/broken they are — but do NOT refactor
  them in this pass. Just the plan.

Output order: audit → token spec → canvas → docs + diffs. Ask me before
changing any existing brand hex value or removing an existing token/utility.
