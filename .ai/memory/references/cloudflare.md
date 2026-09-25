---
type: reference
title: "Cloudflare (Workers, Workers Static Assets, DNS)"
description: Hosts the deployed site — a Cloudflare Worker with Workers Static Assets, bound to the site's hostname via a custom domain.
tier: code-scope
kind: infrastructure
role: infrastructure
resource: MCP `cloudflare` / URL: `developers.cloudflare.com/workers/`
tags: [infra, cloudflare, deploy]
updated: "2026-09-25"
---

# Cloudflare (Workers, Workers Static Assets, DNS)

## What it is

The Worker (`atlasfoo-portfolio-worker`) that serves the built site via
Workers Static Assets, plus the custom domain binding it to the site's
existing hostname/zone (`atlasfoo.dev`). Provisioned by Pulumi
(`infra/index.ts`, see [ADR-004](../decisions/004-pulumi-wrangler-boundary.md));
content published by `wrangler` (`wrangler.jsonc`, `.github/workflows/deploy.yml`).

## How the project uses it

Runtime dependency: this is where the live site is actually served
from. Two Cloudflare API tokens are used, deliberately separated by
scope — a Workers Admin + Zone Workers Routes Write token for Pulumi
provisioning, and a Workers Editor-only token for `deploy.yml`'s
content publishing, so a compromised deploy token cannot touch the
Worker's existence or its custom domain. See `infra/README.md §
Runbook` for the full breakdown.

## How to consult it

The `cloudflare` MCP server (`docs`/`search`/`execute` tools), or
`developers.cloudflare.com/workers/` directly.

## Gotchas

Workers Static Assets and the beta `cloudflare.Worker` Pulumi resource
are both newer surfaces — less community prior art than Pages. See
[ADR-003](../decisions/003-workers-static-assets-over-pages.md) /
[ADR-004](../decisions/004-pulumi-wrangler-boundary.md) for why they
were chosen anyway. Static asset requests are free and unlimited on
both the Free and Paid Workers plans (verified against Cloudflare's
own pricing docs) — this project has no `main` Worker script, so every
request falls in that free category.
