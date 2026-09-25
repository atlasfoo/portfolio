---
type: log-entry
date: 2026-09-21
slug: devops-foundation
kind: work-closure
depth: design
adr: ADR-003, ADR-004, ADR-005
---

# DevOps foundation: Pulumi provisioning + GitHub Actions CI/CD pipeline

## What happened

Added infrastructure-as-code (Pulumi, TypeScript, `@pulumi/cloudflare`)
provisioning a Cloudflare Worker (Workers Static Assets) and its custom
domain, plus four GitHub Actions workflows implementing a strict
build-once/deploy-many pipeline: `pr-check.yml` (gate), `release.yml`
(bump → build → publish an immutable Release + tarball), `deploy.yml`
(consumes the tarball, never rebuilds — also the rollback path), and
`infra.yml` (Pulumi preview/apply). `pulumi preview` verified clean
against the real Cloudflare account.

## Criteria delivered

None — design depth; done = plan scope + gate. Every scope item is
now fully delivered, including the GitHub Environment `production`
(created and verified after the plan's initial close — see Decisions
and deviations). Only real-world end-to-end verification (T-025)
remains, blocked by a platform constraint, not by missing work.

## Phases executed

| # | Theme | Notable result |
|---|---|---|
| 1 | `infra/` scaffolding, gate health | `tsconfig`/`vitest.config` adjusted so `infra/**` doesn't break `astro check` or the coverage gate |
| 2 | Infrastructure as code | `infra/index.ts` provisions Worker + custom domain; `pulumi preview` clean against the real account |
| 3 | PR Check | `pr-check.yml`; `actionlint` wired as both a pre-commit hook and a CI gate step (developer's call, moved from CI-only) |
| 4 | Release pipeline | `release.yml`: App-token bump/tag/changelog, reproducible tarball, Release publish |
| 5 | Deploy pipeline | `deploy.yml`: `wrangler versions upload`/`deploy`, rollback via `workflow_dispatch` |
| 6 | Infra CI + runbook | `infra.yml`; `infra/README.md` runbook; brain proposals drafted |
| — | Post-close fix | `commit-and-tag-version --noBumpWhenEmptyChanges` + a `bump`-job guard so chore/docs/ci-only merges don't release |

## Decisions and deviations

- **actionlint runs in two layers**, not just CI as originally planned: a `lefthook` pre-commit hook for fast local feedback, plus the CI gate step as the real, unbypassable barrier — same pattern the repo already used for `biome check`. Developer's explicit call after questioning the original CI-only design.
- **actionlint CLI**: the npm `actionlint` package (2.0.6, 2022) turned out to be a WASM wrapper with no CLI. Replaced with rhysd/actionlint's official download script, vendored and pinned to `1.7.12`.
- **Real bug found and fixed post-close**: `commit-and-tag-version` bumps at least a patch for *any* commit type by default (its `legacyWhatBump`, verified empirically in a sandbox repo after an initial source-reading-only explanation proved wrong). Fixed with `--noBumpWhenEmptyChanges` plus a `release.yml` guard that skips `build`/`publish` when nothing was actually bumped — without it, a chore/docs/ci-only merge to `master` would have broken the pipeline trying to re-publish an existing Release.
- **Platform constraint, not a design flaw**: GitHub does not register a workflow for `pull_request`/`workflow_dispatch` until it exists on the default branch. None of the four workflows have had a real GitHub Actions run yet — verification is local/`actionlint`-only, deferred until this work merges to `master`.
- **T-021 resolved manually, then verified.** Creating the GitHub Environment `production` (and its secret) was denied by Claude Code's auto-mode classifier as an infrastructure action outside this session's authorized scope. Handed off via `infra/PROVISIONING.md` (committed, ordered, real resource names filled in); the developer completed AWS/Cloudflare/GitHub provisioning manually and asked for verification. Read-only checks (`gh api`, `aws iam`) found everything correct **except one real bug**: the AWS IAM role's trust policy `sub` condition was `["repo:atlasfoo/*", "repo:atlasfoo/*"]` — duplicated, and a wildcard that would have let *any* workflow in *any* of the developer's repos assume the role and reach the state bucket. Corrected to `sub: ["repo:atlasfoo/portfolio:pull_request", "repo:atlasfoo/portfolio:ref:refs/heads/master"]`, applied by the developer (IAM changes are outside the agent's authorized tooling scope), re-verified correct.
- **T-025 still open** — not by missing provisioning anymore, but by the platform constraint above: none of the four workflows have run for real yet since they only exist on `feature/homepage`. Closes itself once this branch merges to `master` and a real release runs.
- **`accountId` config bug** (T-010): Pulumi's `cloudflare:` config namespace is reserved for the provider itself — `accountId` had to move to the project's own `portfolio-infra:` namespace.

## ADR proposals & brain updates

Three ADRs and four `reference` stubs, drafted in the exact target
frontmatter/body format (verified against
[decisions/001-jaiba-brain-adoption.md](../decisions/001-jaiba-brain-adoption.md)
and
[references/design-specs.md](../references/design-specs.md)).
Proposed only — `jaiba-init:update-brain` enacts.

### ADR-003: Cloudflare Workers Static Assets over Pages

```yaml
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
```

**Context.** The original requirement named Cloudflare Pages. The plan
needed a hard separation between building an artifact and promoting it
to traffic — build once, deploy many times, rollback without
rebuilding.

**Decision.** Deploy to a Cloudflare Worker with Workers Static Assets
(`wrangler.jsonc` → `assets.directory`, no `main` script), not Pages.
Two reasons: Cloudflare's own current guidance points new projects at
Workers, and Workers natively exposes the artifact-then-promote model
the pipeline needs (`wrangler versions upload` then `versions deploy`)
— Pages Direct Upload would need to simulate that split with branch
aliases.

**Alternatives considered.** Cloudflare Pages (rejected — no
first-class upload/promote split, legacy for new projects). A Worker
with a server script (rejected — the site has no server logic).

**Consequences.** *Positive:* `wrangler versions upload`/`deploy` map
directly onto the pipeline's build/deploy separation; rollback is
"deploy an older version." *Negative:* Workers Static Assets and the
beta `cloudflare.Worker` Pulumi resource (ADR-004) are both younger
surfaces, less prior art than Pages. *Follow-up:* revisit if the site
ever needs server-side logic.

### ADR-004: Pulumi ↔ wrangler boundary

```yaml
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
```

**Context.** Both tools can touch a Worker. Left implicit, every
release would show as drift in Pulumi's state.

**Decision.** wrangler owns content (versions, assets — changes every
release, never in Pulumi's state). Pulumi owns what's durable: the
Worker as a pure container (`cloudflare.Worker`, beta — confirmed via
`@pulumi/cloudflare@6.21.0`'s `.d.ts` to have no content fields at
all) and the custom domain binding.

**Alternatives considered.** `cloudflare.WorkersScript` with
`ignoreChanges` on content (not needed — the beta resource has no
content fields to ignore). wrangler-creates-then-Pulumi-imports (not
needed — container-first order worked cleanly against the real
account).

**Consequences.** *Positive:* `pulumi preview` never reports drift
from routine deploys. *Negative:* `cloudflare.Worker` is a beta
resource — API surface could change upstream. *Follow-up:* re-verify
the container-only assumption if the resource's shape changes on
promotion out of beta.

### ADR-005: Pulumi state on AWS S3

```yaml
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
```

**Context.** Pulumi's DIY backend needs a bucket; the site itself
deploys entirely to Cloudflare.

**Decision.** Use an S3 bucket
(`atlasfoo-pulumi-state-182618816378-us-east-1-an`, us-east-1) as the
backend, authenticated in CI via GitHub OIDC (no static keys),
provisioned by the maintainer outside Pulumi's own state.

**Alternatives considered.** Cloudflare R2 (the initial choice,
reverted 2026-09-22 — the maintainer's available AWS credit made AWS
free in practice, and R2 had checksum-header compatibility risk for no
benefit). Pulumi Cloud (not evaluated in depth).

**Consequences.** *Positive:* zero incremental cost; Pulumi's state
stays independent of the deploy target. *Negative:* a second cloud
provider purely for state storage. *Follow-up:* revisit if the AWS
credit runs out.

### Reference stubs (4)

One file each for **Cloudflare** (`tier: code-scope`, `kind:
infrastructure`, `role: infrastructure`, resource: `MCP cloudflare`),
**Pulumi** (`tier: workflow`, `kind: tooling`, resource: `CLI pulumi`),
**AWS — S3 + IAM/OIDC** (`tier: workflow`, `kind: infrastructure`,
resource: `CLI aws`), and **GitHub Actions + bump GitHub App** (`tier:
workflow`, `kind: tooling`, resource: `CLI gh`). Full bodies (What it
is / How the project uses it / How to consult it / Gotchas) were
drafted in `.ai/work/brain-proposals.md` during T-028 using the
`okf-pattern.md` field vocabulary — reproduced in full above for
ADRs; the reference stub bodies follow the same structure and are
straightforward to reconstruct from this entry's "What happened" and
"Decisions and deviations" sections plus each surface's role as
described there. `jaiba-init:update-brain` should re-derive short
bodies from those sections rather than expecting a separate file (it
was working-memory only, deleted at archive per JAIBA rule 9).

## Pointers

- Commits (all on `feature/homepage`, unmerged): `0b9397b` (Phase
  1–2), `f824a2a` (Phase 3), `0cb8e74` (Phase 4), `bec7e7e` (Phase 5),
  `046605f` (Phase 6), `098df45` (release no-op fix), `4d56f7f`
  (`infra/PROVISIONING.md`).
- PR #2 (draft, `feature/homepage` → `master`) — opened to attempt a
  real `pr-check.yml` run; blocked by the workflow-registration
  platform constraint above. Do not merge without reading
  `infra/PROVISIONING.md` first.
- `infra/PROVISIONING.md` — the manual AWS/Cloudflare/GitHub checklist
  closing T-021/T-025.
- Consulted:
  [identity/architecture.md](../identity/architecture.md),
  [identity/scope.md](../identity/scope.md),
  [identity/quality-gate.md](../identity/quality-gate.md),
  [identity/conventions.md](../identity/conventions.md),
  [decisions/001-jaiba-brain-adoption.md](../decisions/001-jaiba-brain-adoption.md).

## Suggested final commit

```
feat(infra): add Pulumi provisioning and GitHub Actions CI/CD pipeline

Cloudflare Worker + custom domain provisioned via Pulumi (S3-backed
state). Four workflows: pr-check (gate), release (bump/build/publish
an immutable artifact), deploy (consume-only, with rollback), infra
(preview/apply). Manual AWS/Cloudflare/GitHub Environment provisioning
still required before a real run — see infra/PROVISIONING.md.
```

## Gate at close

Pass | Plan gate green (`test` 206/206, `test:coverage` 99.49%
stmts/94% branches, `build`). One task (T-025) left open — real
end-to-end verification, blocked on merging to `master` (workflows
aren't registered by GitHub until then). All provisioning (T-021)
is done and verified.
