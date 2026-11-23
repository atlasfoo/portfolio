---
type: log-entry
date: 2026-11-22
slug: home-od-refresh
kind: work-closure
depth: spec
adr: none
---

# Home Refresh — Atlasfoo Brand, Nav Guide, Cert Slider, and Animejs Diagram

## What happened

Updated the Astro 7 homepage to match the Open Design `Portfolio (PROJECT)` visual refresh while preserving static output, dark/light semantic tokens ([ADR-002](../decisions/002-semantic-theme-tokens.md)), and EN/ES switching:

- Replaced the `jerry.mejia` wordmark and dot with the inline `atlasfoo` isologo (`--brand-foo` / `--brand-chevron`), `public/favicon.svg`, design `<head>` title/description (dropping `favicon.ico`), and `~/atlasfoo` / `Jerry Mejia<atlasfoo>` hero terminal identity.
- Right-aligned the desktop navigation cluster and added a scroll-tracked desktop activity indicator (`aria-current="location"`), with no Blog link and keeping the mobile `<details>` menu.
- Replaced the static certification card with the `CertSlider` React island (`01 / 0N`, autoplay + controls when `certs.length > 1`, hidden arrows and no autoplay when `<= 1`), leaving one active AWS SAA entry in `CERT_COPY`.
- Ported the Open Design `ArchitectureDiagram` stage with `animejs@4.5.0` (skipped under `prefers-reduced-motion: reduce`), `--arch-*` theme tokens, full-width below-stage detail strip, and the square radial hub with bowed links on mobile viewports.
- Aligned the methodology card/terminal (`OpenCode`, `$ opencode --role architect`, stepped `blink` caret) and decoupled component/page tests from hardcoded editable copy literals.

## Criteria delivered

- `HOME-010` — Nav highlights active section without Blog — delivered
- `HOME-011` — Visible brand is `atlasfoo` — delivered
- `HOME-012` — New diagram is operable, including reduced-motion and mobile hub — delivered
- `HOME-013` — Slider supports multiple certifications (AWS SAA / SFPC) — waived on published data (component/tests verified via fixtures; user chose 1 active cert in `CERT_COPY`, superseded by `HOME-016`)
- `HOME-014` — Brand matches design across nav, head, and terminal — delivered *(corrective / amendment)*
- `HOME-015` — Desktop nav right-aligned with link-tracking guide — delivered *(corrective / amendment)*
- `HOME-016` — Below-stage diagram detail, OpenDesign methodology terminal, hidden arrows on 1 cert, and literal-free tests — delivered *(corrective)*

## Phases executed

| # | Theme | Notable result |
|---|---|---|
| 1 | Marca y nav | Inline `atlasfoo` SVG/favicon and desktop scroll guide (`T-001`–`T-004`) |
| 1b | Marca fiel | Tokenized `atlas`/`foo`, 24px logo, head/whoami updates, right-aligned nav (`T-009`–`T-016`) |
| 2 | Slider de certificaciones | `CertSlider` island, 5.2s autoplay, reduced-motion guard, AWS badge (`T-005`–`T-006`) |
| 3 | Diagrama de arquitectura | `animejs@4.5.0` stage, `--arch-*` tokens, `shouldAnimateStage` gate (`T-007`–`T-008`) |
| fast | Post-phase adjustments | Below-stage detail, methodology terminal/chips, 1-cert arrow hide, literal-free tests, mobile radial hub (`T-017`–`T-020`) |

## Decisions and deviations

- **One active certification + explicit `HOME-013` waiver:** User commented out SFPC in `src/content/homepage.ts` and authorized waiving `HOME-013`'s two-cert published data requirement in favor of `HOME-016`; `CertSlider.test.tsx` keeps multi-slide coverage via fixtures.
- **Test decoupling from copy literals:** `CertContact.test.ts`, `_index.test.ts`, and `Methodology.test.ts` read expectations from `homepage.ts` exports instead of repeating editable strings.
- **Diagram pointer glow shortcut:** Stage glow remains anchored to the active node rather than tracking the cursor (`ArchitectureDiagram.tsx`); mobile was ported to Open Design's radial hub (`T-020`).
- **Pre-existing test/typecheck accommodations:** Added a type assertion in `vitest.config.ts` (`Phase 1`) and mocked `astro:assets` `Font` in `Layout.test.ts` (`Phase 2`) so container tests pass cleanly.
- **Verification fallback:** `verify` subagent (`ses_e08c54345ffeUu6G3lRN6OBw6L`) failed (`Model unavailable: google/gemini-3.8-flash`), and `executor-high` (`ses_e08c1785cffeNbjw8TN1RLcmIs`) was cancelled without writes; both were completed inline against the same gate and evidence standard, plus user visual verification.

## ADR proposals & brain updates

No ADR proposed; UI/layout choices and test-fixture isolation followed existing [architecture](../identity/architecture.md), [conventions](../identity/conventions.md), and [ADR-002](../decisions/002-semantic-theme-tokens.md).

Proposed updates for `jaiba-init:update-brain`:
- Add `reference` entries for **Open Design (`Portfolio (PROJECT)`)** (active visual source replacing legacy [design-specs](../references/design-specs.md)) and **`animejs` (`^4.5.0`)** runtime dependency.
- Note under [conventions](../identity/conventions.md) that page/section tests assert against `src/content/homepage.ts` exports rather than duplicating editable copy literals.

## Pointers

- Prior homepage baseline: [`2026-08-16-portfolio-homepage.md`](./2026-08-16-portfolio-homepage.md)
- Quality gate & conventions: [quality-gate](../identity/quality-gate.md), [conventions](../identity/conventions.md), [scope](../identity/scope.md)
- Phase WIP commits on `feature/homepage-content`: `0cbe3b2`, `2e8c9c0` (diagram + post-phase adjustments pending final commit)

## Suggested final commit

```
feat(home): refresh brand, nav guide, cert slider, and animejs diagram

Align the homepage with the Open Design refresh: atlasfoo branding and
favicon, right-aligned desktop nav with scroll guide, CertSlider island,
animejs architecture stage with mobile radial hub, and updated methodology
terminal.
```

## Gate at close

Pass | `bun run test` 36 files 272/272 · `bun run test:coverage` 90.04% stmts / 84.84% branch / 98.36% funcs / 91.76% lines · `bun run check` clean · `bun run typecheck` 0 errors · `bun run lint:actions` clean · `bun run build` (`dist/index.html`) · user visual verification confirmed; `HOME-013` two-cert data gap explicitly waived.

<!-- jaiba-close-v1
contract jaiba-memory-surface 1.0.0
binding filesystem
project git:github.com/atlasfoo/portfolio
context path:/mnt/Storage/repos/portfolio/.ai/work
scope 3518582f40e0d5cd9abd851979e2a8eee6e4ab4b
close 2026-11-17-home-od-refresh
body fdd8f80d27be9366e0478f74091a8be7d677bc9e
plan.md c302787cb35894b38b4178bd73792ef776eea990
tasks.md 002449f2932b8c68c35c82cffb0561e0723e5eb5
walkthrough.md acc3c4aacd3db5dc7a9c60848f024b58fc656ff4
PRD.md 7b1462b329e7711ab23a41ec33e2538c77b2c4da
.gitignore absent
-->
