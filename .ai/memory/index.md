---
type: index
title: "Portfolio — memory index"
description: "Entry point to this repository's constitutive memory."
tags: [index]
updated: "2026-09-25"
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

- [quality-gate.md](identity/quality-gate.md) — Biome lint/format, astro check type checking, Vitest (80% coverage threshold), actionlint for GitHub workflows, and Astro build gate this project.

## `convention`

- [conventions.md](identity/conventions.md) — TDD mode enabled with Vitest; Conventional Commits enforced via commitlint/lefthook; code style delegated to Biome.

## `decision`

One file per ADR, named `<NNN>-<slug>.md` so the directory sorts in
decision order. Superseded decisions stay listed — the link tells the
story.

- [ADR-001 — Adoption of the JAIBA brain structure](decisions/001-jaiba-brain-adoption.md) — The project keeps agent-facing memory in .ai/ under the JAIBA framework.
- [ADR-002 — Semantic CSS custom properties for dark/light theming](decisions/002-semantic-theme-tokens.md) — Dark/light theme values are semantic CSS custom properties on :root and [data-theme="light"], re-exported through Tailwind v4's @theme inline so ordinary utilities are theme-aware.
- [ADR-003 — Cloudflare Workers Static Assets, not Pages, as the deploy target](decisions/003-workers-static-assets-over-pages.md) — The site deploys to a Cloudflare Worker with Workers Static Assets (no server-side script), not to Cloudflare Pages.
- [ADR-004 — Pulumi owns durable infrastructure; wrangler owns Worker content](decisions/004-pulumi-wrangler-boundary.md) — Pulumi provisions the Worker container and custom domain; wrangler alone publishes Worker versions and static assets. Neither tool manages the other's concern.
- [ADR-005 — Pulumi state lives in an AWS S3 backend, not Cloudflare R2](decisions/005-pulumi-state-on-aws-s3.md) — The Pulumi DIY backend for this project's state is an S3 bucket in AWS, authenticated via GitHub OIDC in CI, chosen to use the maintainer's existing AWS credit rather than for any technical dependency on AWS.

## `reference`

One file per external surface.

- [Imported design specs (design-import/)](references/design-specs.md) — Exported design-tool HTML mockups for the design system, homepage/portfolio, and blog, used as the visual source of truth during implementation.
- [Cloudflare (Workers, Workers Static Assets, DNS)](references/cloudflare.md) — Hosts the deployed site — a Cloudflare Worker with Workers Static Assets, bound to the site's hostname via a custom domain.
- [Pulumi (infra/, @pulumi/cloudflare provider)](references/pulumi.md) — Infrastructure-as-code tool provisioning the durable Cloudflare resources (Worker container, custom domain) from infra/index.ts, with state in an AWS S3 DIY backend.
- [AWS (S3 backend + IAM/OIDC for Pulumi state)](references/aws.md) — An S3 bucket holds Pulumi's DIY state backend; GitHub Actions authenticates to it via IAM OIDC, no static AWS keys. Used only for Pulumi's own state, not the site's runtime.
- [GitHub Actions workflows + bump GitHub App](references/github-actions.md) — CI/CD runs entirely in GitHub Actions (pr-check, release, deploy, infra workflows); the release workflow pushes version bumps using a GitHub App token instead of GITHUB_TOKEN so the resulting push triggers downstream workflows and can bypass branch protection.

## `log-entry`

Indexed as a group, never per entry: [`log/`](log/) holds one append-only
file per dated record, named `<YYYY-MM-DD>-<slug>.md`. Entries
accumulate as work closes and the brain evolves.
