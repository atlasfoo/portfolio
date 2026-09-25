// @vitest-environment jsdom
import { act, cleanup, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';
import { TERMINAL_LINES } from '../../content/homepage';
import type { Lang } from '../../lib/lang';
import { dispatchLangChange } from '../../lib/lang-client';
import HeroTerminal from './HeroTerminal';

/**
 * `HeroTerminal.tsx` does not exist yet (it lands in T-031) — this file is
 * expected to fail with a "module not found" error until then. It encodes
 * the contract for the React island that types out the hero terminal copy:
 *
 *  - On mount, reads the active language via `getCurrentLang()` and reveals
 *    that language's snippet (`TERMINAL_LINES.map(l => l[lang]).join('\n')`)
 *    incrementally over time via `setTimeout`/`stepReveal`, unless
 *    `prefersReducedMotion(window.matchMedia)` is true, in which case the
 *    full snippet renders immediately with no stepped reveal.
 *  - Subscribes to `window`'s `langchange` event and restarts the reveal
 *    for the new language's snippet when it fires.
 *  - Renders the (possibly partial) revealed text as the `textContent` of
 *    a single element queryable via `data-testid="hero-terminal-output"`.
 *    This is the DOM contract T-031 must implement against.
 *
 * `matchMedia` is stubbed via `vi.stubGlobal` (jsdom doesn't implement it).
 * Typing-over-time assertions use fake timers; exact frame-by-frame timing
 * is not asserted (the mock's reveal-stepper RNG makes that non-
 * deterministic) — only the shape: a non-empty, strict-prefix mid-typing
 * state, followed eventually by the full snippet.
 */

function fullSnippet(lang: Lang): string {
  return TERMINAL_LINES.map((line) => line[lang]).join('\n');
}

function stubMatchMedia(reducedMotion: boolean): void {
  vi.stubGlobal(
    'matchMedia',
    vi.fn().mockImplementation((query: string) => ({
      matches: reducedMotion && query === '(prefers-reduced-motion: reduce)',
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })),
  );
}

beforeEach(() => {
  document.documentElement.dataset.lang = 'en';
});

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
  vi.useRealTimers();
});

describe('HeroTerminal', () => {
  test('types out the English snippet over time', () => {
    stubMatchMedia(false);
    vi.useFakeTimers();

    render(<HeroTerminal />);
    const output = screen.getByTestId('hero-terminal-output');
    const fullEn = fullSnippet('en');

    act(() => {
      vi.advanceTimersByTime(200);
    });

    const midway = output.textContent ?? '';
    expect(midway.length).toBeGreaterThan(0);
    expect(midway.length).toBeLessThan(fullEn.length);
    expect(fullEn.startsWith(midway)).toBe(true);

    act(() => {
      vi.advanceTimersByTime(30_000);
    });

    expect(output.textContent).toBe(fullEn);
  });

  test('re-types the Spanish snippet when a langchange event fires', () => {
    stubMatchMedia(false);
    vi.useFakeTimers();

    render(<HeroTerminal />);
    const output = screen.getByTestId('hero-terminal-output');

    // Let the English snippet finish typing first.
    act(() => {
      vi.advanceTimersByTime(30_000);
    });
    expect(output.textContent).toBe(fullSnippet('en'));

    // Mirrors LangToggle.astro: the `data-lang` attribute is updated before
    // the `langchange` event is dispatched.
    act(() => {
      document.documentElement.dataset.lang = 'es';
      dispatchLangChange('es');
    });

    const fullEs = fullSnippet('es');

    // The reveal restarts from scratch for the new language.
    const restarted = output.textContent ?? '';
    expect(restarted.length).toBeLessThan(fullEs.length);
    expect(fullEs.startsWith(restarted)).toBe(true);

    act(() => {
      vi.advanceTimersByTime(200);
    });

    const midway = output.textContent ?? '';
    expect(midway.length).toBeGreaterThan(0);
    expect(midway.length).toBeLessThan(fullEs.length);
    expect(fullEs.startsWith(midway)).toBe(true);

    act(() => {
      vi.advanceTimersByTime(30_000);
    });

    expect(output.textContent).toBe(fullEs);
  });

  test('renders the full snippet instantly with no stepped reveal under prefers-reduced-motion', () => {
    stubMatchMedia(true);
    vi.useFakeTimers();

    render(<HeroTerminal />);
    const output = screen.getByTestId('hero-terminal-output');
    const fullEn = fullSnippet('en');

    // Full text is present immediately, before any timer has run.
    expect(output.textContent).toBe(fullEn);

    // Advancing timers changes nothing — there is no stepped reveal to run.
    act(() => {
      vi.advanceTimersByTime(30_000);
    });
    expect(output.textContent).toBe(fullEn);
  });
});
