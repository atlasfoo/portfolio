import { afterEach, describe, expect, test } from 'vitest';
import {
  buildThemeInitScript,
  getInitialTheme,
  THEME_STORAGE_KEY,
} from './theme';

describe('getInitialTheme', () => {
  test('defaults to dark when nothing is stored', () => {
    expect(getInitialTheme(null)).toBe('dark');
  });

  test('respects a stored "light" value', () => {
    expect(getInitialTheme('light')).toBe('light');
  });

  test('respects a stored "dark" value', () => {
    expect(getInitialTheme('dark')).toBe('dark');
  });

  test('falls back to dark for an unrecognized stored value', () => {
    expect(getInitialTheme('sepia')).toBe('dark');
  });
});

describe('buildThemeInitScript', () => {
  afterEach(() => {
    // biome-ignore lint/suspicious/noExplicitAny: cleaning up test-only globals
    delete (globalThis as any).localStorage;
    // biome-ignore lint/suspicious/noExplicitAny: cleaning up test-only globals
    delete (globalThis as any).document;
  });

  function run(script: string, calls: [string, string][]) {
    // biome-ignore lint/suspicious/noExplicitAny: test needs a document stub, not a real DOM
    (globalThis as any).document = {
      documentElement: {
        setAttribute: (name: string, value: string) =>
          calls.push([name, value]),
      },
    };
    new Function(script)();
  }

  test('stamps data-theme="dark" on <html> when localStorage is empty', () => {
    // biome-ignore lint/suspicious/noExplicitAny: test needs a storage stub, not real localStorage
    (globalThis as any).localStorage = { getItem: () => null };
    const calls: [string, string][] = [];
    run(buildThemeInitScript(), calls);
    expect(calls).toEqual([['data-theme', 'dark']]);
  });

  test('stamps data-theme="light" when localStorage holds the stored key', () => {
    // biome-ignore lint/suspicious/noExplicitAny: test needs a storage stub, not real localStorage
    (globalThis as any).localStorage = {
      getItem: (key: string) => (key === THEME_STORAGE_KEY ? 'light' : null),
    };
    const calls: [string, string][] = [];
    run(buildThemeInitScript(), calls);
    expect(calls).toEqual([['data-theme', 'light']]);
  });

  test('defaults to dark when reading localStorage throws (e.g. disabled storage)', () => {
    // biome-ignore lint/suspicious/noExplicitAny: test needs a storage stub, not real localStorage
    (globalThis as any).localStorage = {
      getItem: () => {
        throw new Error('storage disabled');
      },
    };
    const calls: [string, string][] = [];
    run(buildThemeInitScript(), calls);
    expect(calls).toEqual([['data-theme', 'dark']]);
  });
});
