---
type: decision
id: ADR-002
title: "Semantic CSS custom properties for dark/light theming"
description: Dark/light theme values are semantic CSS custom properties on :root and [data-theme="light"], re-exported through Tailwind v4's @theme inline so ordinary utilities are theme-aware.
status: accepted
date: "2026-08-15"
tags: [design-system, css, tailwind, theming]
updated: "2026-08-15"
---

# ADR-002: Semantic CSS custom properties for dark/light theming

## Context

The imported design spec (`design-import/Design System.dc.html`)
defines a full dark and light palette, and every future page (homepage,
blog) needs to render correctly in both without repeating the theme
decision at each call site. See
[architecture.md](../identity/architecture.md) for the Tailwind v4
wiring this builds on, and
[design-specs.md](../references/design-specs.md) for the source
palette.

## Decision

Declare semantic tokens (`--bg`, `--text`, `--panel`, `--border`, `--muted`,
…) on `:root` (dark values, the default) and re-declare them under
`[data-theme="light"]`, then re-export them through Tailwind v4's
`@theme inline` block (`--color-bg: var(--bg)`, …). Ordinary utility
classes (`bg-panel`, `text-muted`, `border-border2`) become theme-aware
automatically — no component ever branches on the current theme itself.
A single `data-theme` attribute on `<html>`, set by a FOUC-free inline
script before paint and flipped by `ThemeToggle.astro` after load, is
the only thing that changes between themes.

## Alternatives Considered

- *Per-component `dark:`/`light:` variant classes* — rejected; duplicates
  every color decision at every call site and drifts as new components
  are added.
- *A JS-driven CSS-in-JS theme object* — rejected; adds a runtime cost
  and contradicts the static-site constraint in
  [scope.md](../identity/scope.md).

## Consequences

- *Positive:* new components get theme-awareness for free by using
  semantic utility names instead of hardcoded colors; the token
  *values* live in exactly one place (`src/styles/global.css`) for
  future palette edits.
- *Negative / Risks:* a component that reaches for a raw palette color
  (e.g. `bg-primary-600`) instead of the semantic layer silently
  bypasses theming — no lint currently catches this.
- *Follow-ups:* none planned; revisit if a third theme (e.g. high
  contrast) is ever requested.
