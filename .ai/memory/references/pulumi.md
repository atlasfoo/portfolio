---
type: reference
title: "Pulumi (infra/, @pulumi/cloudflare provider)"
description: Infrastructure-as-code tool provisioning the durable Cloudflare resources (Worker container, custom domain) from infra/index.ts, with state in an AWS S3 DIY backend.
tier: workflow
kind: tooling
role: —
resource: CLI `pulumi` / URL: `pulumi.com/docs/`
tags: [infra, pulumi, tooling]
updated: "2026-09-25"
---

# Pulumi (infra/, @pulumi/cloudflare provider)

## What it is

The TypeScript Pulumi program in `infra/` (`infra/index.ts`,
`infra/Pulumi.yaml`, `infra/Pulumi.prod.yaml`), provider
`@pulumi/cloudflare` pinned to `^6.21.0`. See
[ADR-004](../decisions/004-pulumi-wrangler-boundary.md) for what it
owns vs. what `wrangler` owns, and
[ADR-005](../decisions/005-pulumi-state-on-aws-s3.md) for where its
state lives.

## How the project uses it

Development-time/CI-time only — the running site has no dependency on
Pulumi. `bun run infra:preview`/`infra:up` locally;
`.github/workflows/infra.yml` runs `pulumi preview` on PRs touching
`infra/**` and `pulumi up` on merge to `master`.

## How to consult it

`pulumi.com/docs/` for the CLI and programming model;
`pulumi.com/registry/packages/cloudflare/` for the provider — but
prefer reading the installed `.d.ts` files
(`node_modules/@pulumi/cloudflare/`) over the public docs when they
might disagree, since provider versions can drift from published docs.

## Gotchas

The `cloudflare:` config namespace is reserved for the *provider's*
own config (`apiKey`, `apiToken`, etc.) — project-specific config
(`accountId`, `zoneId`, `hostname`, `workerName`) must go under the
project's own namespace (`portfolio-infra:`), confirmed the hard way
while wiring the Cloudflare account id. A fresh CI checkout has no
Pulumi stack selected by default (that state lives outside git, in the
local workspace) — `.github/workflows/infra.yml` runs
`pulumi stack select prod` explicitly before `preview`/`up`.
