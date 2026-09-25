---
type: decision
id: ADR-003
title: "Cloudflare Workers Static Assets, not Pages, as the deploy target"
description: The site deploys to a Cloudflare Worker with Workers Static Assets (no server-side script), not to Cloudflare Pages.
status: accepted
date: "2026-09-23"
tags: [infra, cloudflare, deploy]
updated: "2026-09-23"
---

# ADR-003: Cloudflare Workers Static Assets, not Pages, as the deploy target

## Context

The original requirement named Cloudflare Pages. The devops-foundation
plan needed a deploy model with a hard separation between *building* an
artifact and *promoting* it to traffic — build once, deploy many times,
rollback without rebuilding.

## Decision

Deploy to a Cloudflare Worker configured with Workers Static Assets
(`wrangler.jsonc` → `assets.directory`, no `main` script — an assets
host, not a backend), not to Cloudflare Pages.

Two reasons: (1) Cloudflare's own current guidance points new projects
at Workers over Pages; (2) Workers natively expose the
artifact-then-promote model the pipeline needs — `wrangler versions
upload` creates an immutable version with no traffic, `wrangler
versions deploy` promotes it. Pages Direct Upload would need to
simulate that split with branch aliases.

## Alternatives Considered

- *Cloudflare Pages* (the original ask) — rejected; no first-class
  upload/promote split, and marked legacy for new projects by
  Cloudflare's own docs.
- *A Worker with a server-side script* — rejected; the site has no
  server logic ([identity/scope.md](../identity/scope.md): static site
  only), so a script would be pure surface area with nothing to
  justify it.

## Consequences

- *Positive:* `wrangler versions upload`/`deploy` map directly onto the
  release pipeline's build/deploy separation; rollback is "deploy an
  older version," no rebuild.
- *Negative / Risks:* Workers Static Assets and the beta
  `cloudflare.Worker` Pulumi resource (see [ADR-004](004-pulumi-wrangler-boundary.md))
  are both younger surfaces than Pages; less prior art to lean on if
  something breaks.
- *Follow-ups:* revisit if the site ever needs server-side logic (edge
  middleware, API routes) — that would justify a real Worker script,
  at which point the "assets host, not backend" framing in this ADR no
  longer holds.
