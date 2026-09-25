---
type: log-entry
date: 2026-08-13
slug: coverage-threshold-added
kind: brain-change
adr: none
---

# Coverage threshold enforced

## What happened

`@vitest/coverage-v8` was added and `vitest.config.ts` gained an 80%
coverage threshold (lines/functions/branches/statements) via the `v8`
provider; `bun run test:coverage` (`vitest run --coverage`) runs it.
`identity/quality-gate.md`'s Coverage line changed from a manually-added
but unenforced `min 80% coverage` note to the real command and threshold.
`coverage/` (the report output) was added to `.gitignore`, which also
fixed a Biome lint failure against the generated report files (Biome
respects `.gitignore` via `useIgnoreFile`).

## Decisions and deviations

Triggered by a coherence check: the maintainer had manually written a
"min 80% coverage" line into `quality-gate.md` before any coverage
tooling existed, which would have made the brain claim an unenforced
gate as live. Flagged to the maintainer, who chose to wire it up for
real rather than leave it as a documented-but-aspirational target.

## Pointers

Related: `2026-08-13-vitest-adopted.md` (same session, prior gate
addition). None otherwise.
