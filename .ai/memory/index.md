---
type: index
title: "Portfolio — memory index"
description: "Entry point to this repository's constitutive memory."
tags: [index]
updated: "2026-08-15"
---

# Portfolio — Memory Index

Each line below is a concept's `description:` frontmatter, verbatim.
Groups are named by the concept `type:` they hold.

## `project`

- [project.md](identity/project.md) — Jerry Mejia's personal portfolio and blog site.

## `architecture`

- [architecture.md](identity/architecture.md) — Static site built with Astro 7, React 19 islands, and Tailwind CSS v4; no backend or datastore.

## `purpose`

- [purpose.md](identity/purpose.md) — Personal-brand site for Jerry Mejia, supporting job search and freelance/client acquisition.

## `scope`

- [scope.md](identity/scope.md) — Homepage, project showcase and blog content; excludes any backend, auth, or server-side persistence.

## `quality-gate`

- [quality-gate.md](identity/quality-gate.md) — Biome lint/format, astro check type checking, Vitest (80% coverage threshold), and Astro build gate this project.

## `convention`

- [conventions.md](identity/conventions.md) — TDD mode enabled with Vitest; Conventional Commits enforced via commitlint/lefthook; code style delegated to Biome.

## `decision`

One file per ADR, named `<NNN>-<slug>.md` so the directory sorts in
decision order. Superseded decisions stay listed — the link tells the
story.

- [ADR-001 — Adoption of the JAIBA brain structure](decisions/001-jaiba-brain-adoption.md) — The project keeps agent-facing memory in .ai/ under the JAIBA framework.
- [ADR-002 — Semantic CSS custom properties for dark/light theming](decisions/002-semantic-theme-tokens.md) — Dark/light theme values are semantic CSS custom properties on :root and [data-theme="light"], re-exported through Tailwind v4's @theme inline so ordinary utilities are theme-aware.

## `reference`

One file per external surface.

- [Imported design specs (design-import/)](references/design-specs.md) — Exported design-tool HTML mockups for the design system, homepage/portfolio, and blog, used as the visual source of truth during implementation.

## `log-entry`

Indexed as a group, never per entry: [`log/`](log/) holds one append-only
file per dated record, named `<YYYY-MM-DD>-<slug>.md`. Currently empty —
`initialize` writes nothing here; entries accumulate as work closes and
the brain evolves.
