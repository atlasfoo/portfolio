---
type: log-entry
date: 2026-08-13
slug: design-system-setup
kind: work-closure
depth: design
adr: ADR-002 (proposed)
---

# Tailwind v4 design system: tokens, fonts, base layout, primitives

## What happened

Translated the imported design spec into a working Tailwind v4 design
system: static + semantic color/type/radius/shadow tokens with a
dark/light theme mechanism, self-hosted fonts via Astro's Fonts API, a
corrected FOUC-free `Layout.astro`, and five tested UI primitives
(`Button`, `Card`, `Chip`, `StatusDot`, `ThemeToggle`) in
`src/components/ui/`. Homepage/blog composition is intentionally out
of scope — this is the foundation they'll build on.

## Criteria delivered

None — design depth; done = plan scope + gate.

All 9 scoped deliverables confirmed present and behaving at `validate`
(token layer, semantic theme vars, fonts, `Layout.astro`, and the 5
primitives) — see `plan.md § Scope (In)` (archived alongside).

## Phases executed

| # | Theme | Notable result |
|---|---|---|
| 1 | Token foundation | Full `@theme` token layer (palette/type/radii/shadows) + semantic dark/light vars re-exported via `@theme inline`; self-hosted fonts via Astro Fonts API |
| 2 | Layout & theme mechanism | FOUC-free theme-init extracted into a tested module (`src/lib/theme.ts`); `Layout.astro` rewritten (was broken: bare import outside frontmatter fences pointing at a nonexistent file) |
| 3 | Component primitives | 5 primitives (`Button`, `Card`, `Chip`, `StatusDot`, `ThemeToggle`) built TDD via `astro/container`, styled entirely from the Phase 1/2 token layer; `ThemeToggle` closes the loop by mutating `data-theme` post-load |

## Decisions and deviations

- **Semantic-token theming pattern** (`:root` + `[data-theme]` +
  `@theme inline`) adopted as the site-wide mechanism — structural,
  proposed as ADR-002 below.
- **`toString()`-inlining** for `buildThemeInitScript` keeps the FOUC
  init logic unit-testable without adding jsdom/happy-dom — tactical,
  not proposed as an ADR (revisit only if more FOUC-sensitive init
  logic appears, e.g. locale detection).
- **Card radius resolved via spec's own copy** ("radio xl") — `rounded-xl`
  for cards, `rounded-lg` for Button/Chip/StatusDot (exact 8px token
  match); the button's 10px spec value was ambiguous between tokens,
  resolved by consistency with the smaller controls.
- **StatusDot is the whole composite pill** (dot + label), not a bare
  dot — the spec never shows the dot alone.
- **ThemeToggle has no visual spec** (section 06 doesn't include one)
  — built icon-less with `aria-label="Toggle theme"`, reusing the
  panel/border2 visual language of the other small controls.
- Two gate-driven micro-deviations, neither structural: `Button`
  needed `type="button"` (Biome `useButtonType`); `Card`'s accent
  variant needed a bare `border` width utility alongside the arbitrary
  `border-[rgba(...)]` color class (color-only utility renders no
  border by itself).
- Coverage tooling (v8 provider) only instruments `theme.ts`, not
  `.astro` SFCs — pre-existing characteristic from Phase 1, not a
  regression; the 80% threshold passed against what it does track.
- No gate checks waived.

## ADR proposals & brain updates

**Proposed — ADR-002: Semantic CSS custom properties for dark/light
theming.**
- *Context:* the design spec defines a full dark/light palette; every
  future page needs one utility class to render correctly in both
  themes without per-component theme branching.
- *Decision:* semantic tokens (`--bg`, `--text`, `--panel`, `--border`,
  …) declared on `:root` (dark, default) and re-declared under
  `[data-theme="light"]`, then re-exported through Tailwind v4's
  `@theme inline` so ordinary utilities (`bg-panel`, `text-muted`)
  become theme-aware automatically. See
  [identity/architecture.md](../identity/architecture.md) for the
  Tailwind v4 wiring this builds on.
- *Alternatives considered:* per-component `dark:`/`light:` variant
  classes (rejected — duplicates every color decision at every call
  site); a JS-driven CSS-in-JS theme object (rejected — runtime cost,
  contradicts the static-site constraint in
  [identity/scope.md](../identity/scope.md)).
- *Consequences:* new components get theme-awareness for free by using
  semantic utility names; the token *values* live in exactly one place
  (`src/styles/global.css`) for future palette edits.

No other reference/scope/quality-gate changes proposed — all other
decisions above were tactical (component-level), not structural.

## Pointers

- Consulted:
  [identity/architecture.md](../identity/architecture.md),
  [identity/scope.md](../identity/scope.md),
  [identity/quality-gate.md](../identity/quality-gate.md),
  [identity/conventions.md](../identity/conventions.md),
  [references/design-specs.md](../references/design-specs.md).
- Related prior entries:
  [2026-08-13-vitest-adopted.md](2026-08-13-vitest-adopted.md),
  [2026-08-13-coverage-threshold-added.md](2026-08-13-coverage-threshold-added.md).
- Next piece of work (out of scope here): homepage/blog composition
  using these primitives.

## Suggested final commit

```
feat(design-system): tailwind v4 tokens, fonts, base layout, ui primitives

Dark/light semantic theme tokens, self-hosted fonts (Astro Fonts API),
a corrected FOUC-free Layout.astro, and tested UI primitives
(Button/Card/Chip/StatusDot/ThemeToggle) — the shared foundation for
the homepage and blog work that follows.
```

## Gate at close

Pass | `test` 28/28, `test:coverage` 100% (of instrumented files, ≥80% threshold), `build` clean. Security scan: none configured, omitted per quality-gate concept. No waivers.
