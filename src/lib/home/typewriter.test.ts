import { describe, expect, test } from 'vitest';
import { classifyLine, prefersReducedMotion, stepReveal } from './typewriter';

/**
 * `typewriter.ts` does not exist yet (it lands in a later task) — this file
 * is expected to fail with a "module not found" error until then.
 *
 * It encodes the contract for three pure helpers behind the hero terminal
 * island (`HeroTerminal.tsx`):
 *
 *  - `classifyLine(line: string): TerminalTone` — ports the design mock's
 *    `colorTerm()` line-by-line classifier. Precedence, in order:
 *    `$`-prefixed → 'prompt'; contains '✓' → 'success'; contains
 *    'jerry_mejia' → 'identity'; contains a production/growing keyword
 *    (EN or ES) → 'highlight'; otherwise → 'muted'.
 *  - `stepReveal(index: number, rng: () => number): number` — ports the
 *    mock's typing-tick step size: `i += rng() < 0.12 ? 2 : 1`. Pure and
 *    injectable so tests can force either branch deterministically.
 *  - `prefersReducedMotion(matchMediaFn): boolean` — reads
 *    `(prefers-reduced-motion: reduce)` through an injected
 *    `matchMedia`-shaped function.
 */

describe('classifyLine', () => {
  test('a line starting with "$" is a prompt', () => {
    expect(classifyLine('$ whoami')).toBe('prompt');
  });

  test('a line containing "✓" is a success line', () => {
    expect(classifyLine('deploy complete ✓')).toBe('success');
  });

  test('a line containing "jerry_mejia" is an identity line', () => {
    expect(classifyLine('user: jerry_mejia')).toBe('identity');
  });

  test('a line containing "production" is a highlight (English)', () => {
    expect(classifyLine('status: production ready')).toBe('highlight');
  });

  test('a line containing "growing" is a highlight (English)', () => {
    expect(classifyLine('a growing set of tools')).toBe('highlight');
  });

  test('a line containing "producción" is a highlight (Spanish)', () => {
    expect(classifyLine('entorno de producción')).toBe('highlight');
  });

  test('a line containing "creciendo" is a highlight (Spanish)', () => {
    expect(classifyLine('un stack creciendo')).toBe('highlight');
  });

  test('a line matching none of the rules is muted (default)', () => {
    expect(classifyLine('just some plain output')).toBe('muted');
  });

  test('an empty line is muted (default)', () => {
    expect(classifyLine('')).toBe('muted');
  });

  test('precedence: "$" prefix wins over "✓" elsewhere in the line', () => {
    expect(classifyLine('$ echo ✓')).toBe('prompt');
  });

  test('precedence: "✓" wins over "jerry_mejia" elsewhere in the line', () => {
    expect(classifyLine('✓ jerry_mejia deployed')).toBe('success');
  });

  test('precedence: "jerry_mejia" wins over a production/growing keyword', () => {
    expect(classifyLine('jerry_mejia: production ready')).toBe('identity');
  });
});

describe('stepReveal', () => {
  test('advances by 2 when the RNG lands under the 0.12 threshold', () => {
    expect(stepReveal(0, () => 0)).toBe(2);
    expect(stepReveal(5, () => 0.1)).toBe(7);
  });

  test('advances by 1 when the RNG lands at or above the 0.12 threshold', () => {
    expect(stepReveal(0, () => 0.99)).toBe(1);
    expect(stepReveal(5, () => 0.12)).toBe(6);
  });

  test('is pure: same index and RNG behavior always produce the same result', () => {
    const rng = () => 0.5;
    expect(stepReveal(3, rng)).toBe(stepReveal(3, rng));
  });
});

describe('prefersReducedMotion', () => {
  test('returns true when the injected matchMedia reports a match', () => {
    const fakeMatchMedia = (query: string) => ({
      matches: query === '(prefers-reduced-motion: reduce)',
    });
    expect(prefersReducedMotion(fakeMatchMedia)).toBe(true);
  });

  test('returns false when the injected matchMedia reports no match', () => {
    const fakeMatchMedia = () => ({ matches: false });
    expect(prefersReducedMotion(fakeMatchMedia)).toBe(false);
  });

  test('queries the reduced-motion media feature specifically', () => {
    let queried = '';
    const fakeMatchMedia = (query: string) => {
      queried = query;
      return { matches: false };
    };
    prefersReducedMotion(fakeMatchMedia);
    expect(queried).toBe('(prefers-reduced-motion: reduce)');
  });
});
