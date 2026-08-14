---
type: log-entry
date: 2026-08-13
slug: vitest-adopted
kind: brain-change
adr: none
---

# Vitest adopted; TDD mode enabled

## What happened

Vitest was added as the project's test runner (`vitest.config.ts` via
`getViteConfig`, `bun run test` = `vitest run`, `.astro` components tested
via the `astro/container` experimental Container API — verified with a
smoke test on `src/components/Welcome.astro`). `identity/quality-gate.md`'s
"Tests (affected)" and "Full test suite" lines changed from `[MISSING]`
to `bun run test`. `identity/architecture.md` gained `vitest` and
`@astrojs/check` under Key packages. `identity/conventions.md`'s TDD mode
flipped from `disabled` (with a `[NEEDS CLARIFICATION]` gap) to `enabled`,
per explicit maintainer confirmation. `index.md` description lines
regenerated for `quality-gate` and `convention` to match.

## Decisions and deviations

Maintainer chose not to wire `test` into the `lefthook` pre-commit hook —
kept on the Plan Gate / manual-CI side to keep commits fast, matching the
Phase Gate vs Plan Gate split already documented. Maintainer explicitly
opted to enable TDD mode now that a framework exists, rather than leaving
it deferred.

## Pointers

Related: `2026-08-13-typecheck-gate-added.md` (same session, prior gate
fix). None otherwise.
