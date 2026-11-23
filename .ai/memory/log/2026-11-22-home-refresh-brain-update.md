---
type: log-entry
date: 2026-11-22
slug: home-refresh-brain-update
kind: brain-change
adr: none
---

# Brain Update — Open Design, animejs, and Content-Decoupled Test Convention

## What happened

Enacted the constitutive memory updates proposed by [`2026-11-17-home-od-refresh.md`](./2026-11-17-home-od-refresh.md):

- Added [`references/open-design.md`](../references/open-design.md) documenting the Open Design `Portfolio (PROJECT)` workspace as the active visual source of truth that superseded legacy `design-import/`.
- Added [`references/animejs.md`](../references/animejs.md) documenting `animejs` (`^4.5.0`) usage in `ArchitectureDiagram.tsx` and its `prefers-reduced-motion` guard.
- Updated [`identity/conventions.md`](../identity/conventions.md) (`updated: 2026-11-22`) with the content-decoupled test convention (asserting against `src/content/homepage.ts` exports instead of hardcoded editable copy literals).
- Regenerated [`index.md`](../index.md) (`updated: 2026-11-22`) with the two new `reference` entries.

## Decisions and deviations

- Triggered by the user-confirmed handoff from `conduct:summarize` (`home-od-refresh`).
- No new ADR enacted; existing `[NEEDS CLARIFICATION]` in `identity/conventions.md` (git commit granularity) left untouched as outside this update's scope.

## Pointers

- Closure record: [`2026-11-17-home-od-refresh.md`](./2026-11-17-home-od-refresh.md)
- Updated concepts: [`references/open-design.md`](../references/open-design.md), [`references/animejs.md`](../references/animejs.md), [`identity/conventions.md`](../identity/conventions.md), [`index.md`](../index.md)
