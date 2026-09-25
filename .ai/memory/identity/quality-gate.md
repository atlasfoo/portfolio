---
type: quality-gate
title: "Quality Gate"
description: "Biome lint/format, astro check type checking, Vitest (80% coverage threshold), actionlint for GitHub workflows, and Astro build gate this project."
tags: [identity, quality-gate, verification]
updated: "2026-09-25"
---

# Quality Gate

> Commands below are read from `package.json` scripts and `lefthook.yml`.

## Phase Gate (runs after each phase — must be fast)

- **Tests (affected):** `bun run test` (`vitest run`). Vitest is
  configured via `vitest.config.ts` (`getViteConfig` from `astro/config`,
  reusing Astro's Vite config); `.astro` components are rendered with the
  `astro/container` experimental Container API. Not wired into the
  `lefthook` pre-commit hook (kept out of the fast per-commit path
  deliberately — see `identity/conventions.md`); runs automatically in
  CI via `.github/workflows/pr-check.yml` on every PR
  ([reference](../references/github-actions.md)).
- **Linting:** `bun run check` (`biome check .`) — zero errors, zero
  warnings. Also runs automatically on staged files via the `lefthook`
  pre-commit hook (`biome-check`), and in `pr-check.yml`.
- **Type checking:** `bun run typecheck` (`astro check`, backed by
  `@astrojs/check` + `astro/tsconfigs/strict`) — zero errors, zero
  warnings. Also runs automatically on staged `*.{ts,tsx,astro}` files
  via the `lefthook` pre-commit hook (`typecheck`), and in `pr-check.yml`.
- **Formatting:** `bun run check` (Biome formatter, part of the same
  command); auto-fix with `bun run fix` (`biome check --write .`).
- **GitHub Actions linting:** `bun run lint:actions` (vendored
  `actionlint`, pinned `1.7.12`, via `scripts/ensure-actionlint.sh`) —
  validates `.github/workflows/*.yml`. Runs on staged workflow files via
  the `lefthook` pre-commit hook (`actionlint`), and again in
  `pr-check.yml` as the unbypassable barrier.

## Plan Gate (runs once at `conduct:validate` — may be slow)

- **Full test suite:** `bun run test` (`vitest run`) — all tests pass.
- **Coverage:** `bun run test:coverage` (`vitest run --coverage`) — v8
  provider, 80% threshold on lines/functions/branches/statements
  (`vitest.config.ts`).
- **Build:** `bun run build` (`astro build`) — must succeed.
- **Security scan:** none configured — line omitted.

## Commit gate (not a phase/plan gate, but enforced on every commit)

- `commit-msg` hook runs `bunx commitlint --edit` — commit messages must
  follow Conventional Commits (`@commitlint/config-conventional`).
