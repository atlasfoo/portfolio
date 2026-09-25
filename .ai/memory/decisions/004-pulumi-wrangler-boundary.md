---
type: decision
id: ADR-004
title: "Pulumi owns durable infrastructure; wrangler owns Worker content"
description: Pulumi provisions the Worker container and custom domain; wrangler alone publishes Worker versions and static assets. Neither tool manages the other's concern.
status: accepted
date: "2026-09-23"
tags: [infra, cloudflare, pulumi, wrangler]
updated: "2026-09-23"
---

# ADR-004: Pulumi owns durable infrastructure; wrangler owns Worker content

## Context

Both Pulumi and `wrangler` can touch a Cloudflare Worker. Left
implicit, this is the most likely source of drift: every release would
change the Worker's content, and if Pulumi's state also tracked that
content, `pulumi preview` would report drift on every single deploy.

## Decision

Split ownership cleanly:

- **wrangler owns content** — Worker versions and static assets.
  These change on every release; they are never represented in
  Pulumi's state.
- **Pulumi owns what's durable** — the Worker resource as a pure
  container (`cloudflare.Worker`, beta — confirmed via
  `@pulumi/cloudflare@6.21.0`'s own `.d.ts` to have no content fields
  at all: no `content`, `mainModule`, or `assets`) and the
  `cloudflare.WorkersCustomDomain` binding it to the site's hostname.
  Future durable bindings (KV, R2, etc.) belong here too.

`infra/index.ts` creates the Worker before any `wrangler deploy` ever
runs; `wrangler.jsonc`'s `name` must match `portfolio-infra:workerName`
in `infra/Pulumi.prod.yaml` so both tools address the same Worker.

## Alternatives Considered

- *Pulumi manages content via `cloudflare.WorkersScript` with
  `ignoreChanges`* — the plan's original fallback if `cloudflare.Worker`
  didn't support a content-free container. Not needed: the beta
  resource already has no content fields, so there's nothing to
  `ignoreChanges` on.
- *wrangler creates the Worker, Pulumi imports it after the fact* — the
  documented Plan B if `cloudflare.Worker` proved unworkable. Not
  needed either; `pulumi preview` confirmed the container-first order
  works cleanly against the real account.

## Consequences

- *Positive:* `pulumi preview` never reports drift from routine
  deploys; the two tools' responsibilities don't overlap.
- *Negative / Risks:* `cloudflare.Worker` is a beta resource in the
  Pulumi provider — API surface could change upstream.
- *Follow-ups:* if `cloudflare.Worker` is ever promoted out of beta
  with a different shape, re-verify the container-only assumption
  before upgrading the provider.
