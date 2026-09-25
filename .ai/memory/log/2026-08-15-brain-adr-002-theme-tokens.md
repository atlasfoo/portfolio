---
type: log-entry
date: 2026-08-15
slug: brain-adr-002-theme-tokens
kind: brain-change
adr: ADR-002
---

# Enacted ADR-002: semantic theme-token pattern

## What happened

Created `decisions/002-semantic-theme-tokens.md` (`status: accepted`)
recording the site-wide dark/light theming mechanism — semantic CSS
custom properties on `:root`/`[data-theme="light"]`, re-exported via
Tailwind v4's `@theme inline` — as a standing decision. Regenerated
`index.md` to list it under `decision` and bumped its `updated:` date.
No identity or reference concepts changed; this was decision-only.

## Decisions and deviations

None. Provenance: proposed by `conduct:summarize` in the
`design-system-setup` work-closure entry
([2026-08-13-design-system-setup.md](2026-08-13-design-system-setup.md)),
enacted here as-is with no changes to the proposed text.

## Pointers

- ADR: [002-semantic-theme-tokens.md](../decisions/002-semantic-theme-tokens.md)
- Source proposal: [2026-08-13-design-system-setup.md](2026-08-13-design-system-setup.md)
