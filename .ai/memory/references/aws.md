---
type: reference
title: "AWS (S3 backend + IAM/OIDC for Pulumi state)"
description: An S3 bucket holds Pulumi's DIY state backend; GitHub Actions authenticates to it via IAM OIDC, no static AWS keys. Used only for Pulumi's own state, not the site's runtime.
tier: workflow
kind: infrastructure
role: —
resource: CLI `aws` / URL: `docs.aws.amazon.com`
tags: [infra, aws, pulumi]
updated: "2026-09-25"
---

# AWS (S3 backend + IAM/OIDC for Pulumi state)

## What it is

The S3 bucket `atlasfoo-pulumi-state-182618816378-us-east-1-an`
(us-east-1, maintainer-provisioned) plus an IAM OIDC provider and role
(`BrvRoleForAtlasfooGithubPulumi`) that GitHub Actions assumes via
`aws-actions/configure-aws-credentials` — no static AWS keys anywhere
in the repo or in GitHub secrets. See
[ADR-005](../decisions/005-pulumi-state-on-aws-s3.md) for why AWS
instead of Cloudflare R2.

## How the project uses it

Workflow-only — stores Pulumi's state and locks. The deployed site has
no AWS dependency at all ([identity/scope.md](../identity/scope.md):
Cloudflare-only runtime).

## How to consult it

`docs.aws.amazon.com` for IAM/OIDC/S3; the `aws` CLI locally (the
maintainer's session, never checked into the repo).

## Gotchas

The IAM role's trust policy `sub` claim must stay scoped to
`repo:atlasfoo/portfolio:pull_request` (preview) and
`repo:atlasfoo/portfolio:ref:refs/heads/master` (`up`) — **not** a
wildcard like `repo:atlasfoo/*`, which would let any workflow in any
of the maintainer's repos assume the role (found and corrected once
already — the trust policy had shipped over-broad and had to be
tightened). Also **not** `environment:<name>`, because `infra.yml`
does not run under a GitHub Environment; if that ever changes, the
trust policy must change with it.
