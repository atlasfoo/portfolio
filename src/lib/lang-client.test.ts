import { afterEach, describe, expect, test } from 'vitest';
import { getCurrentLang } from './lang-client';

describe('getCurrentLang', () => {
  afterEach(() => {
    // biome-ignore lint/suspicious/noExplicitAny: cleaning up test-only globals
    delete (globalThis as any).document;
  });

  test('returns "es" when document.documentElement.dataset.lang is "es"', () => {
    // biome-ignore lint/suspicious/noExplicitAny: test needs a document stub, not a real DOM
    (globalThis as any).document = {
      documentElement: { dataset: { lang: 'es' } },
    };
    expect(getCurrentLang()).toBe('es');
  });

  test('returns "en" when document.documentElement.dataset.lang is "en"', () => {
    // biome-ignore lint/suspicious/noExplicitAny: test needs a document stub, not a real DOM
    (globalThis as any).document = {
      documentElement: { dataset: { lang: 'en' } },
    };
    expect(getCurrentLang()).toBe('en');
  });

  test('returns "en" when document.documentElement.dataset.lang is undefined', () => {
    // biome-ignore lint/suspicious/noExplicitAny: test needs a document stub, not a real DOM
    (globalThis as any).document = {
      documentElement: { dataset: {} },
    };
    expect(getCurrentLang()).toBe('en');
  });

  test('returns "en" when document.documentElement.dataset.lang is an invalid string', () => {
    // biome-ignore lint/suspicious/noExplicitAny: test needs a document stub, not a real DOM
    (globalThis as any).document = {
      documentElement: { dataset: { lang: 'fr' } },
    };
    expect(getCurrentLang()).toBe('en');
  });
});
