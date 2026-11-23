---
type: reference
title: "Open Design (Portfolio (PROJECT))"
description: Active local-first design workspace (`Portfolio (PROJECT)`) serving as the visual source of truth for the atlasfoo homepage refresh, superseding legacy `design-import/`.
tier: workflow
kind: business-doc
role: —
resource: MCP `open-design` / project `Portfolio (PROJECT)` (`09700e08-ef40-440d-b309-cc24a2e61f69`)
tags: [design, open-design, business-doc]
updated: "2026-11-22"
---

# Open Design (Portfolio (PROJECT))

## What it is

The active Open Design workspace project (`Portfolio (PROJECT)`, linked to this repository) holding the refreshed HTML/CSS/SVG mockups and interactive assets that superseded the older `design-import/` exports ([references/design-specs.md](./design-specs.md), no longer present in the repo).

## How the project uses it

Visual and interaction reference when building or updating homepage Astro/React components (`src/components/home/`, `src/styles/global.css`, `public/favicon.svg`, `public/certs/`):

- `index.html` — layout, header/nav brand (`atlasfoo`), head metadata, methodology chips/terminal, certifications slider, and contact section.
- `assets/architecture-diagram/` — responsive desktop column board, below-stage detail strip, and mobile square radial hub with bowed curves.
- `assets/atlasfoo-logo.svg` — nav inline isologo and favicon source.

Mockup styles and HTML are ported into Tailwind utilities, semantic theme tokens ([ADR-002](../decisions/002-semantic-theme-tokens.md)), and bilingual `src/content/homepage.ts` entries rather than pasted verbatim.

## How to consult it

When the `open-design` MCP server is active in a session, query project `09700e08-ef40-440d-b309-cc24a2e61f69` (`get_artifact`, `get_file`, `search_files`).

## Gotchas

- `open-design` MCP availability depends on the local Open Design daemon running; when unavailable, rely on the implemented Astro/React sources and this reference.
- Mockup `#2F6BFF` and dark surface hexes must always be mapped to semantic theme tokens in `src/styles/global.css` for dark/light parity.
