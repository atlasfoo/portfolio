---
type: architecture
title: "Architecture"
description: "Static site built with Astro 7, React 19 islands, and Tailwind CSS v4; no backend or datastore."
tags: [identity, architecture, stack]
updated: "2026-08-13"
---

# Architecture

- **Architecture style:** Static site generation (Astro), with React used
  for interactive islands where needed. No server-side application logic.
- **Primary language:** TypeScript (`astro/tsconfigs/strict`)
- **Primary framework:** Astro 7 (`@astrojs/react` integration for React 19
  components)
- **Persistence:** None — static site, no database or backend.
- **Key packages:**
  - `astro` — site framework / build
  - `@astrojs/react`, `react`, `react-dom` — interactive components
  - `tailwindcss`, `@tailwindcss/vite` — styling
  - `@biomejs/biome` — lint + format (single toolchain, replaces
    ESLint/Prettier)
  - `@astrojs/check` — powers `astro check` (type checking)
  - `vitest` — test runner, configured via `getViteConfig` to reuse
    Astro's Vite config; `.astro` components tested via the
    `astro/container` experimental Container API
  - `lefthook` — git hooks runner
  - `@commitlint/*`, `commitizen` — Conventional Commits enforcement and
    authoring
  - `commit-and-tag-version` — changelog/version/tag automation
- **Package manager:** bun (`bun.lock` present; use `bun`, not `npm`/`node`,
  for all scripts in this repo)

> The complete dependency list lives in `package.json`.
