import { afterEach, describe, expect, test } from 'vitest';
import { buildLangInitScript, getInitialLang, LANG_STORAGE_KEY } from './lang';

describe('getInitialLang', () => {
  test('defaults to en when nothing is stored', () => {
    expect(getInitialLang(null)).toBe('en');
  });

  test('respects a stored "es" value', () => {
    expect(getInitialLang('es')).toBe('es');
  });

  test('respects a stored "en" value', () => {
    expect(getInitialLang('en')).toBe('en');
  });

  test('falls back to en for an unrecognized stored value', () => {
    expect(getInitialLang('fr')).toBe('en');
  });
});

describe('buildLangInitScript', () => {
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

  test('stamps data-lang="en" on <html> when localStorage is empty', () => {
    // biome-ignore lint/suspicious/noExplicitAny: test needs a storage stub, not real localStorage
    (globalThis as any).localStorage = { getItem: () => null };
    const calls: [string, string][] = [];
    run(buildLangInitScript(), calls);
    expect(calls).toEqual([['data-lang', 'en']]);
  });

  test('stamps data-lang="es" when localStorage holds the stored key', () => {
    // biome-ignore lint/suspicious/noExplicitAny: test needs a storage stub, not real localStorage
    (globalThis as any).localStorage = {
      getItem: (key: string) => (key === LANG_STORAGE_KEY ? 'es' : null),
    };
    const calls: [string, string][] = [];
    run(buildLangInitScript(), calls);
    expect(calls).toEqual([['data-lang', 'es']]);
  });

  test('defaults to en when reading localStorage throws (e.g. disabled storage)', () => {
    // biome-ignore lint/suspicious/noExplicitAny: test needs a storage stub, not real localStorage
    (globalThis as any).localStorage = {
      getItem: () => {
        throw new Error('storage disabled');
      },
    };
    const calls: [string, string][] = [];
    run(buildLangInitScript(), calls);
    expect(calls).toEqual([['data-lang', 'en']]);
  });
});
