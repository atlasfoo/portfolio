---
type: scope
title: "Scope"
description: "Homepage, project showcase and blog content; excludes any backend, auth, or server-side persistence."
tags: [identity, scope, boundaries]
updated: "2026-08-13"
---

# Scope

- **In scope:**
  - Homepage / landing page
  - Project / portfolio showcase
  - Blog (planned — content collections not yet implemented; see
    `identity/architecture.md` and the Astro content-collections guide)
  - Design system implementation sourced from `design-import/`
- **Out of scope:**
  - Any backend, CMS, or server-side application logic
  - Authentication
  - Payment processing
  - Server-side data persistence (static site only)
- **Cross-cutting packages:**
  - None — single package, not a monorepo.

## Sub-units

Single unit.

## Relations

None — no reference concepts currently draw an external boundary for this
project.
