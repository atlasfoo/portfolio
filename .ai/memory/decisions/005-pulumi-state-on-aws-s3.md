---
type: decision
id: ADR-005
title: "Pulumi state lives in an AWS S3 backend, not Cloudflare R2"
description: The Pulumi DIY backend for this project's state is an S3 bucket in AWS, authenticated via GitHub OIDC in CI, chosen to use the maintainer's existing AWS credit rather than for any technical dependency on AWS.
status: accepted
date: "2026-09-23"
tags: [infra, pulumi, aws]
updated: "2026-09-23"
---

# ADR-005: Pulumi state lives in an AWS S3 backend, not Cloudflare R2

## Context

Pulumi's DIY backend needs a bucket somewhere. The site itself deploys
entirely to Cloudflare — this decision is about where Pulumi's own
state lives, not about the runtime infrastructure.

## Decision

Use an S3 bucket in the maintainer's AWS account
(`atlasfoo-pulumi-state-182618816378-us-east-1-an`, us-east-1) as the
Pulumi backend (`pulumi login 's3://<bucket>?region=<region>'`),
authenticated in CI via GitHub OIDC (`aws-actions/configure-aws-credentials`,
no static keys) assuming an IAM role scoped to that bucket and to this
repository. State secrets are encrypted with `PULUMI_CONFIG_PASSPHRASE`.

The bucket and the CI role are provisioned by the maintainer, outside
Pulumi's own state — a stack cannot create the bucket it stores its
own state in.

## Alternatives Considered

- *Cloudflare R2* (S3-compatible, the initial choice, amended
  2026-09-22) — reverted in favor of AWS: the maintainer has available
  AWS credit to use, and R2's checksum-header quirks (`awssdk=v2`
  compatibility) added risk for no benefit once the credit made AWS
  free in practice.
- *Pulumi Cloud (managed backend)* — not evaluated in depth; the DIY
  backend was chosen from the start to keep state fully within
  infrastructure the maintainer already controls.

## Consequences

- *Positive:* zero incremental cost given existing AWS credit; no
  dependency on Cloudflare for Pulumi's own state, keeping that
  concern independent of the deploy target.
- *Negative / Risks:* introduces AWS as a second cloud provider purely
  for state storage — one more IAM surface, OIDC trust policy, and
  bucket to keep secure, for a project that is otherwise
  Cloudflare-only.
- *Follow-ups:* if the AWS credit runs out or the maintainer wants a
  single-provider footprint, revisit — R2 or Pulumi Cloud remain live
  options.
