---
type: log-entry
date: 2026-08-13
slug: typecheck-gate-added
kind: brain-change
adr: none
---

# Type checking added to the Quality Gate

## What happened

`identity/quality-gate.md`'s "Type checking" Phase Gate line changed from
`[MISSING]` to `bun run typecheck` (`astro check`, via the new
`@astrojs/check` dev dependency), also wired into the `lefthook`
pre-commit hook. `index.md`'s `quality-gate` description line was
regenerated to match.

## Decisions and deviations

Triggered by `jaiba-doctor`'s first checkup, which flagged "Type
checking: [MISSING]" as a suggested fix. The `fast` lane implemented the
script + hook (contained, `inline`-triage change); this entry records the
resulting brain update. None.

## Pointers

None.
