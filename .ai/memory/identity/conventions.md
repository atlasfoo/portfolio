---
type: convention
title: "Conventions"
description: "TDD mode enabled with Vitest; Conventional Commits enforced via commitlint/lefthook; code style delegated to Biome."
tags: [identity, convention, planning, style]
updated: "2026-08-13"
---

# Conventions

## Planning conventions

- **TDD mode:** `enabled`

  Vitest is configured (`identity/quality-gate.md`, `identity/architecture.md`).
  Future `conduct` plans structure implementation tasks red → green →
  refactor: a failing-test task precedes its implementation task within
  the same phase.

- **Atomicity granularity:** use chore(wip) commits to store work in progress, then, squash into a full feat, fix, refactor commit.

- **Phase structure:** Phases group tasks by architectural cohesion, not
  chronology (framework default — see `jaiba-contract.md`).

- **Git strategy:** Conventional Commits is enforced repo-wide: the
  `commit-msg` lefthook hook runs `commitlint`, and `bun run commit`
  launches `commitizen` (`@commitlint/cz-commitlint`) for interactive,
  spec-compliant commit authoring. Release versioning/changelog is
  automated via `commit-and-tag-version` (`bun run release`). [NEEDS
  CLARIFICATION]: whether `conduct` should suggest phase-wise
  `chore(wip)` commits or a single commit at plan close — not yet stated
  by the maintainer; default to offering both at close.

- **Definition of ready** (before a plan enters `execute` mode):
  - Plan is written to `.ai/work/plan.md`
  - Tasks are decomposed in `.ai/work/tasks.md`
  - All clarifying questions have been resolved (no
    `[NEEDS CLARIFICATION]` blocks in the artifacts)
  - Human has explicitly approved the plan

## Style and syntax

Code style is delegated entirely to the project's own configuration —
read and obey these, don't restate their rules here:

- `biome.json` — formatter (2-space indent, single quotes, semicolons,
  trailing commas, 80-col width) and linter (`recommended` preset, plus
  `react` and `tailwind` domains). Excludes `design-import/`,
  `src/assets/`, `public/favicon.svg`.
- `.editorconfig`
- `tsconfig.json` — `astro/tsconfigs/strict`, JSX via `react-jsx`
  (`jsxImportSource: react`)

For non-trivial design decisions, document the *why* in code comments,
and propose a `decision` concept when the decision is structural.
