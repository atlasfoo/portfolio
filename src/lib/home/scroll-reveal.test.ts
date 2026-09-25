import { describe, expect, test } from 'vitest';
import { FALLBACK_REVEAL_MS, resolveRevealStrategy } from './scroll-reveal';

/**
 * `scroll-reveal.ts` does not exist yet (it lands in a later task) — this
 * file is expected to fail with a "module not found" error until then.
 *
 * It encodes the contract for the pure decision logic behind the design
 * mock's `observeReveal()` (`design-import/Portafolio Jerry Mejia.dc.html`):
 *
 *  - `resolveRevealStrategy(hasIntersectionObserver, prefersReducedMotion):
 *    'immediate' | 'observe'` — 'immediate' when IntersectionObserver is
 *    unsupported (mirrors the mock's `if (!('IntersectionObserver' in
 *    window))` branch) OR when reduced motion is preferred (an extension of
 *    the mock, new for this plan); 'observe' only when both an observer is
 *    supported and there is no reduced-motion preference.
 *  - `FALLBACK_REVEAL_MS` — the mock's fallback-timer duration (2600ms) that
 *    covers the "observer never fires" sad path (HOME-001): a defensive
 *    timer that still reveals content even in an environment that reports
 *    observer support but whose observer callback never runs.
 *
 * No DOM/IntersectionObserver instantiation here or in the module — this is
 * pure decision logic only. The actual wiring into `document.querySelectorAll`
 * / `new IntersectionObserver` / `setTimeout` is T-056's job.
 */

describe('resolveRevealStrategy', () => {
  test('returns "immediate" when IntersectionObserver is unsupported and motion is not reduced', () => {
    expect(resolveRevealStrategy(false, false)).toBe('immediate');
  });

  test('returns "immediate" when IntersectionObserver is unsupported and motion is reduced', () => {
    expect(resolveRevealStrategy(false, true)).toBe('immediate');
  });

  test('returns "immediate" when IntersectionObserver is supported but motion is reduced', () => {
    expect(resolveRevealStrategy(true, true)).toBe('immediate');
  });

  test('returns "observe" when IntersectionObserver is supported and motion is not reduced', () => {
    expect(resolveRevealStrategy(true, false)).toBe('observe');
  });
});

describe('FALLBACK_REVEAL_MS', () => {
  test('is a positive number', () => {
    expect(typeof FALLBACK_REVEAL_MS).toBe('number');
    expect(FALLBACK_REVEAL_MS).toBeGreaterThan(0);
  });

  test("matches the design mock's fallback-timer duration (2600ms)", () => {
    expect(FALLBACK_REVEAL_MS).toBe(2600);
  });
});
