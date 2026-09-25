import { describe, expect, test } from 'vitest';
import {
  ARCHITECTURE_CONNECTIONS,
  ARCHITECTURE_NODES,
  CAPABILITIES,
  CERT_COPY,
  CONTACT_COPY,
  FILTER_DEFS,
  FOOTER_COPY,
  HERO_COPY,
  METHODOLOGY_COPY,
  NAV_LABELS,
  PROJECTS,
  SECTORS,
  STACK_GROUPS,
  TERMINAL_LINES,
} from './homepage';

/**
 * Structural tests for the bilingual content module `homepage.ts`.
 *
 * `homepage.ts` does not exist yet (it lands in a later task) — this file
 * is expected to fail with a "module not found" error until then. It
 * encodes the shape that module must implement against:
 *
 *  - Every translatable field is a `{ en: string; es: string }` pair
 *    (a "bilingual entry"), possibly nested inside arrays/objects.
 *  - `PROJECTS` items carry a `tags: string[]` field whose values must
 *    each match an `id` in `FILTER_DEFS`.
 *  - `ARCHITECTURE_NODES` items carry an `id: string`; `ARCHITECTURE_CONNECTIONS`
 *    is an array of `[fromId, toId]` tuples that must each resolve to a
 *    real node id.
 *
 * Tests never assert exact copy text — only shape and non-emptiness —
 * so they stay valid regardless of what the actual Spanish/English copy says.
 */

interface Bilingual {
  en: string;
  es: string;
}

function isBilingual(value: unknown): value is Bilingual {
  return (
    typeof value === 'object' &&
    value !== null &&
    typeof (value as Bilingual).en === 'string' &&
    typeof (value as Bilingual).es === 'string'
  );
}

/** Recursively walks any exported value and collects every `{ en, es }` leaf. */
function collectBilingual(value: unknown, acc: Bilingual[] = []): Bilingual[] {
  if (isBilingual(value)) {
    acc.push(value);
    return acc;
  }
  if (Array.isArray(value)) {
    for (const item of value) collectBilingual(item, acc);
    return acc;
  }
  if (value !== null && typeof value === 'object') {
    for (const nested of Object.values(value)) collectBilingual(nested, acc);
  }
  return acc;
}

function expectAllNonEmptyBilingual(source: unknown, label: string) {
  const entries = collectBilingual(source);
  expect(
    entries.length,
    `${label}: expected at least one bilingual ({ en, es }) entry`,
  ).toBeGreaterThan(0);
  for (const entry of entries) {
    expect(
      entry.en.trim().length,
      `${label}: found a bilingual entry with an empty "en" value`,
    ).toBeGreaterThan(0);
    expect(
      entry.es.trim().length,
      `${label}: found a bilingual entry with an empty "es" value`,
    ).toBeGreaterThan(0);
  }
}

describe('homepage content — bilingual coverage', () => {
  test('nav labels', () => {
    expectAllNonEmptyBilingual(NAV_LABELS, 'NAV_LABELS');
  });

  test('hero copy', () => {
    expectAllNonEmptyBilingual(HERO_COPY, 'HERO_COPY');
  });

  test('capabilities', () => {
    expectAllNonEmptyBilingual(CAPABILITIES, 'CAPABILITIES');
  });

  test('stack groups', () => {
    expectAllNonEmptyBilingual(STACK_GROUPS, 'STACK_GROUPS');
  });

  test('sectors', () => {
    expectAllNonEmptyBilingual(SECTORS, 'SECTORS');
  });

  test('projects', () => {
    expectAllNonEmptyBilingual(PROJECTS, 'PROJECTS');
  });

  test('filter defs', () => {
    expectAllNonEmptyBilingual(FILTER_DEFS, 'FILTER_DEFS');
  });

  test('methodology copy', () => {
    expectAllNonEmptyBilingual(METHODOLOGY_COPY, 'METHODOLOGY_COPY');
  });

  test('architecture nodes', () => {
    expectAllNonEmptyBilingual(ARCHITECTURE_NODES, 'ARCHITECTURE_NODES');
  });

  test('terminal snippet lines', () => {
    expectAllNonEmptyBilingual(TERMINAL_LINES, 'TERMINAL_LINES');
  });

  test('cert copy', () => {
    expectAllNonEmptyBilingual(CERT_COPY, 'CERT_COPY');
  });

  test('contact copy', () => {
    expectAllNonEmptyBilingual(CONTACT_COPY, 'CONTACT_COPY');
  });

  test('footer copy', () => {
    expectAllNonEmptyBilingual(FOOTER_COPY, 'FOOTER_COPY');
  });
});

describe('homepage content — cross-references', () => {
  test('every project tag resolves to a real filter id', () => {
    const filterIds = new Set(FILTER_DEFS.map((filter) => filter.id));
    expect(
      filterIds.size,
      'FILTER_DEFS should declare at least one filter id',
    ).toBeGreaterThan(0);

    for (const project of PROJECTS) {
      expect(
        project.tags.length,
        `project "${project.name}" should declare at least one tag`,
      ).toBeGreaterThan(0);
      for (const tag of project.tags) {
        expect(
          filterIds.has(tag),
          `project "${project.name}" has tag "${tag}" with no matching FILTER_DEFS id`,
        ).toBe(true);
      }
    }
  });

  test('every architecture connection resolves to real node ids', () => {
    const nodeIds = new Set(ARCHITECTURE_NODES.map((node) => node.id));
    expect(
      nodeIds.size,
      'ARCHITECTURE_NODES should declare at least one node',
    ).toBeGreaterThan(0);

    for (const [from, to] of ARCHITECTURE_CONNECTIONS) {
      expect(
        nodeIds.has(from),
        `connection references unknown node id "${from}"`,
      ).toBe(true);
      expect(
        nodeIds.has(to),
        `connection references unknown node id "${to}"`,
      ).toBe(true);
    }
  });
});
