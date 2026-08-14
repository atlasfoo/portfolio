---
type: quality-gate
title: "Quality Gate"
description: "Biome lint/format, astro check type checking, Vitest (80% coverage threshold), and Astro build gate this project."
tags: [identity, quality-gate, verification]
updated: "2026-08-13"
---

# Quality Gate

> Commands below are read from `package.json` scripts and `lefthook.yml`.

## Phase Gate (runs after each phase — must be fast)

- **Tests (affected):** `bun run test` (`vitest run`). Vitest is
  configured via `vitest.config.ts` (`getViteConfig` from `astro/config`,
  reusing Astro's Vite config); `.astro` components are rendered with the
  `astro/container` experimental Container API. Not currently wired into
  the `lefthook` pre-commit hook (kept out of the fast per-commit path
  deliberately — see `identity/conventions.md`); run manually / in CI.
- **Linting:** `bun run check` (`biome check .`) — zero errors, zero
  warnings. Also runs automatically on staged files via the `lefthook`
  pre-commit hook (`biome-check`).
- **Type checking:** `bun run typecheck` (`astro check`, backed by
  `@astrojs/check` + `astro/tsconfigs/strict`) — zero errors, zero
  warnings. Also runs automatically on staged `*.{ts,tsx,astro}` files
  via the `lefthook` pre-commit hook (`typecheck`).
- **Formatting:** `bun run check` (Biome formatter, part of the same
  command); auto-fix with `bun run fix` (`biome check --write .`).

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
