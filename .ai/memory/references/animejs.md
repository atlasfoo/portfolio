---
type: reference
title: "animejs (^4.5.0)"
description: Runtime animation library powering the `ArchitectureDiagram` island's entrance, drawable links, packet loop, and detail transition.
tier: code-scope
kind: package
role: upstream
resource: `package.json` (`"animejs": "^4.5.0"`) / MCP `context7`
tags: [animation, frontend, package, architecture-diagram]
updated: "2026-11-22"
---

# animejs (^4.5.0)

## What it is

The v4 ES-module animation library installed via `bun` (`package.json`, `bun.lock`) and used for vector/DOM choreography in interactive React islands.

## How the project uses it

Imported directly in `src/components/home/ArchitectureDiagram.tsx` (`import { animate, createDrawable, stagger } from 'animejs'`) inside the `client:visible` island:

- Entrance stagger on node faces and drawable link strokes (`createDrawable`).
- Traveling packet animation along active SVG connection paths.
- Subtle detail-body reveal on active node change.

All `animate(...)` calls are gated by `shouldAnimateStage(window.matchMedia)` (`src/lib/home/architecture-diagram.ts`) so `prefers-reduced-motion: reduce` settles the stage and skips motion.

## How to consult it

Check installed version and exports in `package.json` and `node_modules/animejs`, or query `context7` docs for `animejs` v4 (`animate`, `createDrawable`, `stagger`).

## Gotchas

- Do not vendor `anime.esm.min.js` or mount the standalone `<atlasfoo-architecture>` custom element from the design mockup; import from `'animejs'` inside the React island so Vite bundles it cleanly.
- `createDrawable` leaves stroke-dasharray state if cut mid-animation; always reset link dash styles when settling under reduced motion.
