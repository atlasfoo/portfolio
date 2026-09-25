---
type: log-entry
date: 2026-08-16
slug: portfolio-homepage
kind: work-closure
depth: spec
adr: ADR-003 (proposed)
---

# Portfolio homepage — first publish

## What happened

Replaced the Astro starter `Welcome` placeholder at `/` with the real,
bilingual (EN/ES), design-faithful homepage: sticky nav, hero with a typing
terminal, a keyboard-operable live architecture diagram, capabilities/stack/
sectors grids, filterable projects, a methodology callout, cert+contact, and
a footer — plus a responsive mobile layout (collapsible nav, stacked
architecture diagram) closing the one criterion that started open.

## Criteria delivered

- `HOME-001` — Hero renders default (English) content on first visit — delivered *(corrective: Phase 5/6 fidelity fixes)*
- `HOME-002` — Sticky nav links to each in-page section, no Blog link — delivered *(corrective: Phase 6 nav-blur fix, Phase 7 mobile collapse)*
- `HOME-003` — Language toggle switches all page copy and persists — delivered *(corrective: Phase 6 footer/copy fixes)*
- `HOME-004` — Architecture diagram is interactive and keyboard-operable — delivered *(corrective: Phase 6 node-metrics fix, Phase 7 mobile list)*
- `HOME-005` — Hero terminal types out profile content per active language — delivered
- `HOME-006` — Project filters narrow the grid by category — delivered *(corrective: Phase 6 header/filter layout)*
- `HOME-007` — Contact links work and external links are safe — delivered *(corrective: Phase 6 cert+contact rebuild)*
- `HOME-008` — Existing dark/light theme continues to work on the new content — delivered *(corrective: Phase 6 token additions)*
- `HOME-009` — Homepage is responsive from mobile to desktop — delivered *(corrective: Phase 7 — the one criterion still open going into this closure)*

## Phases executed

| # | Theme | Notable result |
|---|---|---|
| 1 | Language mechanism & content data | `lang.ts`/`LangToggle` mirror the existing theme mechanism; all bilingual content ported to `src/content/homepage.ts` |
| 2 | Static sections | Nav, Capabilities, Stack, Sectors, Methodology, CertContact, Footer built on existing design-system primitives |
| 3 | Interactive islands | Three React islands (`HeroTerminal`, `ArchitectureDiagram`, `ProjectsGrid`), each with pure-logic + `@testing-library/react` test coverage |
| 4 | Assembly & cleanup | Page assembled, starter content removed, scroll-reveal wired with an `IntersectionObserver` + fallback-timer |
| 5 | Visual/layout corrections | First real-browser comparison vs. the mock (Playwright) — page container, missing section headers, Sectors/Stack layout, hover-transition Tailwind v4 bug fixed; mobile overflow found and *deliberately parked* |
| 6 | Design-QA fidelity pass | 15 developer-reported defects + 4 adjacent gaps fixed (nav blur, hero rhythm, serif titles, node metrics, card typography, methodology/cert/footer rebuilds) |
| 7 | Mobile navigation & diagram | Closed Phase 5's parked gap: native `<details>` nav disclosure, stacked architecture-diagram list below `md:` — zero horizontal overflow at 360–430px |

## Decisions and deviations

- **English default instead of the mock's Spanish default** — a deliberate,
  developer-confirmed deviation from the mock, per the PRD (not new to this
  closure).
- **Dev-only `@testing-library/react`/`jsdom` addition** — the three React
  islands had no DOM-interaction test coverage until Phase 1 execution
  surfaced the gap; added as a devDependency only, no runtime/library change.
- **Mobile-overflow work deliberately parked at Phase 5, resolved at Phase 7**
  — the mock itself has no mobile treatment to port, so the nav-collapse and
  diagram-stacking patterns are new implementation, not a fidelity port; the
  developer chose to close this gap before ending the plan rather than waive
  `HOME-009`'s sad path.
- **Two Tailwind v4 gotchas hit during fidelity work**, both fixed and worth
  the team's awareness going forward: `-translate-y-*` sets the standalone
  `translate` CSS property (not `transform` — `transition-[...]` must name it
  explicitly), and an arbitrary `bg-[<gradient>,<color>]` value compiles to
  `background-image` only, so a trailing color makes the whole declaration
  invalid CSS, silently dropped by the browser (fix: split into two utility
  classes, `bg-<color>` + `bg-[<gradient>]`).
- **Closed the long-deferred manual-verification chain** (`T-011→T-028→
  T-044→T-049`) for real before archiving: reduced-motion instant-render
  (hero terminal, scroll-reveal) and a full click-through with console
  monitoring had never actually been run in a live browser across this
  plan's history, only inferred from unit tests and structural (`curl`)
  checks. Ran them via Playwright — confirmed clean, with the one known
  pre-existing hydration-mismatch console error (documented at Phase 6's
  close) and no new ones.
- **Post-Phase-7 QA catch**: the architecture diagram's detail panel used a
  hardcoded dark gradient stop (`surface-800`, not a semantic token), muddy
  in light theme though dark theme was fine. Fixed to the same
  `bg-panel2` + separate `bg-[linear-gradient(...)]` pattern Methodology's
  card already used — the theme-token lesson from T-087/T-089 applied once
  more, in the last defect found before this closure.
- No gate checks were waived — `bun run test` (204/204), `bun run
  test:coverage` (99%+ across all four metrics), `bun run check`, `bun run
  typecheck`, and `bun run build` all pass clean at close.

## ADR proposals & brain updates

**Proposed ADR-003 — Bilingual toggle mirrors the theme-toggle attribute
pattern.** *(status: Proposed)*
- **Context**: the homepage needed a persisted, FOUC-free, client-only
  language preference. [ADR-002](../decisions/002-semantic-theme-tokens.md)
  already established the shape for a similar problem (theme).
- **Decision**: `data-lang` on `<html>`, set by an inline init script before
  first paint, persisted to `localStorage`, flipped by a toggle component
  that also dispatches a `langchange` `CustomEvent` so React islands can
  resync without a reload — structurally identical to the theme mechanism,
  the `CustomEvent` being the one addition theme didn't need.
- **Alternatives considered**: a URL-based locale (`/es/...`) — rejected,
  this is a static site with no server-side routing; a framework i18n library
  — rejected, no new runtime dependency for a single global toggle.
  Both already ruled out by the plan's Non-goals, not new deliberation here.
- **Consequences**: any future client-persisted page preference (a third
  toggle) has a proven, one-attribute-plus-event shape to copy.

**Suggested `identity/conventions.md` addendum** (not an ADR — a
project-specific Tailwind v4 gotcha worth carrying forward): the two
gotchas under "Decisions and deviations" above, so the next person touching
`hover:-translate-y-*` transitions or a multi-layer `bg-[...]` utility
doesn't lose the same afternoon rediscovering them.

No new `reference` concept — [Imported design specs](../references/design-specs.md)
already covers the mock as source of truth; nothing else was consulted that
the brain doesn't already index.

## Pointers

- Full phase-by-phase narrative: this plan's `walkthrough.md` (archived
  alongside, not carried into this summary — see the file trail before
  archiving if a phase's exact reasoning is needed later).
- **PRD Content flags — still open, not blocking, not code**: years of
  experience ("06"), the AWS certification claim, named clients/employers
  (LAFISE, Poket, OpenBanking, Labsys), and contact handles all still need
  Jerry's sign-off before this content is treated as final. Nothing in this
  closure resolves them — they're a content/business decision, not an
  engineering one.

## Suggested final commit

```
feat(home): ship the real bilingual homepage, closing HOME-001–HOME-009

Replaces the Astro starter Welcome page with the full design-faithful
homepage: bilingual nav/hero/sections, a keyboard-operable live
architecture diagram, project filtering, and a responsive mobile
layout. Squash target for this plan's phase-wise chore(wip) commits.
```

## Gate at close

Pass | `bun run test` 204/204 · `bun run test:coverage` 99%+ (stmts/branch/funcs/lines) · `bun run check` clean · `bun run typecheck` 0 errors · `bun run build` green. No waivers.
