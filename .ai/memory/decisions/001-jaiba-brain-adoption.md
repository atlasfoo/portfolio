---
type: decision
id: ADR-001
title: "Adoption of the JAIBA brain structure"
description: The project keeps agent-facing memory in .ai/ under the JAIBA framework.
status: accepted
date: "2026-08-13"
tags: [meta, memory, tooling]
updated: "2026-08-13"
---

# ADR-001: Adoption of the JAIBA brain structure

## Context

The project needed a way for AI coding agents to retain context across
sessions, sustain architectural coherence, and surface the reasoning
behind past technical choices. Without persistent structure, every
session restarts from scratch and the same questions get re-litigated.

## Decision

Adopt the JAIBA framework's `.ai/` brain: `AGENTS.md` at the repo root
for agent behavior (with `CLAUDE.md` kept as a symlink to it); `.ai/memory/`
as the constitutive bundle — one concept per file, `index.md` as its entry
point, `identity/` for project identity and the quality gate, `decisions/`
for ADRs, `references/` for external surfaces, and the append-only
chronological record in `log/`; `.ai/work/` for executive memory (PRD when
produced, plan, tasks, walkthrough — gitignored, archived into `log/` at
close).

## Alternatives Considered

- *No structured memory* (status quo) — rejected; sessions lose context
  and decisions are not traceable.
- *A single monolithic context file* — rejected; conflates concerns and
  becomes unmaintainable as the project grows.

## Consequences

- *Positive:* continuity across sessions; decisions become traceable;
  onboarding (human or agent) is faster.
- *Negative / Risks:* requires discipline to keep memory current; stale
  memory can mislead the agent.
- *Follow-ups:* run `jaiba-init:update-brain` after major milestones (e.g.
  once the blog/content-collections work lands, once a test framework is
  chosen).
