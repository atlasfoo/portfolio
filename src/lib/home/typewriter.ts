import type { TerminalTone } from '../../content/homepage';

const HIGHLIGHT_KEYWORDS = ['production', 'growing', 'producción', 'creciendo'];

/**
 * Ports the design mock's `colorTerm()` line-by-line classifier.
 * Precedence, in order: `$`-prefixed -> 'prompt'; contains '✓' -> 'success';
 * contains 'jerry_mejia' -> 'identity'; contains a production/growing
 * keyword (EN or ES) -> 'highlight'; otherwise -> 'muted'.
 */
export function classifyLine(line: string): TerminalTone {
  if (line.startsWith('$')) return 'prompt';
  if (line.includes('✓')) return 'success';
  if (line.includes('jerry_mejia')) return 'identity';
  if (HIGHLIGHT_KEYWORDS.some((keyword) => line.includes(keyword)))
    return 'highlight';
  return 'muted';
}

/**
 * Ports the mock's typing-tick step size: `i += rng() < 0.12 ? 2 : 1`.
 * Pure and injectable so tests can force either branch deterministically.
 */
export function stepReveal(index: number, rng: () => number): number {
  return index + (rng() < 0.12 ? 2 : 1);
}

/**
 * Reads `(prefers-reduced-motion: reduce)` through an injected
 * `matchMedia`-shaped function.
 */
export function prefersReducedMotion(
  matchMediaFn: (query: string) => { matches: boolean },
): boolean {
  return matchMediaFn('(prefers-reduced-motion: reduce)').matches;
}
