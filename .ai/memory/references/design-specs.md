---
type: reference
title: "Imported design specs (design-import/)"
description: Exported design-tool HTML mockups for the design system, homepage/portfolio, and blog, used as the visual source of truth during implementation.
tier: workflow
kind: business-doc
role: —
resource: "design-import/Design System.dc.html, design-import/Portafolio Jerry Mejia.dc.html, design-import/Blog.dc.html"
tags: [design, business-doc]
updated: "2026-08-13"
---

# Imported design specs (design-import/)

## What it is

Three standalone HTML exports from a design tool (`.dc.html` files, driven
by the vendored `design-import/support.js` runtime), imported in commit
`488384e` ("chore: added CLAUDE DESIGN proposals v1 for homepage and
blog"): a design system spec, the homepage/portfolio layout, and the blog
layout.

## How the project uses it

Serves as the visual/design source of truth while building the real Astro
pages/components (`src/pages`, `src/layouts`, `src/components`). Excluded
from Biome linting/formatting (`biome.json` → `files.includes`), i.e.
treated as reference material, not source to be maintained.

## How to consult it

Open the `.dc.html` files directly (they're self-contained, loading
`./support.js` for rendering). Repo-relative paths:
- `design-import/Design System.dc.html`
- `design-import/Portafolio Jerry Mejia.dc.html`
- `design-import/Blog.dc.html`

## Gotchas

These are v1 proposals (per the commit message) — confirm with the
maintainer before treating them as final if the implemented UI needs to
diverge.
