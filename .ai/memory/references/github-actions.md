---
type: reference
title: "GitHub Actions workflows + bump GitHub App"
description: CI/CD runs entirely in GitHub Actions (pr-check, release, deploy, infra workflows); the release workflow pushes version bumps using a GitHub App token instead of GITHUB_TOKEN so the resulting push triggers downstream workflows and can bypass branch protection.
tier: workflow
kind: tooling
role: —
resource: CLI `gh` / URL: `docs.github.com/en/actions`
tags: [ci, github-actions, tooling]
updated: "2026-09-25"
---

# GitHub Actions workflows + bump GitHub App

## What it is

Four workflows: `pr-check.yml` (gate, no artifact — lint, typecheck,
coverage, build smoke, commitlint, actionlint), `release.yml` (bump →
build → publish a Release + tarball, skipping when nothing is
releasable), `deploy.yml` (consumes the tarball, never rebuilds —
also the rollback path), `infra.yml` (Pulumi preview/apply). Plus a
pre-existing GitHub App ("bump") installed with *Contents: write*,
consumed via `actions/create-github-app-token@v1` (pinned; only
accepts `app-id`, not the newer `client-id`).

## How the project uses it

All CI/CD. The App token specifically matters in `release.yml`:
`GITHUB_TOKEN`-authored pushes don't trigger other workflows'
`release: published` events, and can't bypass branch protection — an
App token does both.

## How to consult it

`docs.github.com/en/actions` for workflow syntax; the `gh` CLI for
inspecting runs/releases/environments locally.

## Gotchas

A workflow file is only recognized by GitHub (for `pull_request`,
`workflow_dispatch`, etc.) once it exists on the repository's default
branch — a workflow added only on a feature branch cannot be triggered
for real, even by opening a PR from that branch. All four workflows
still await their first real run pending a merge to `master`.
`actions/create-github-app-token@v1`'s pinned `action.yml` only has
`app-id`/`app_id` inputs (verified with `actionlint`, which will
reject `client-id` against this pin even though upstream docs describe
it as the newer, recommended input).
