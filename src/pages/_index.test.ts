import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import { expect, test } from 'vitest';
import {
  CAPABILITIES,
  CERT_COPY,
  FOOTER_COPY,
  HERO_COPY,
  METHODOLOGY_COPY,
  NAV_LABELS,
  SECTION_COPY,
  SECTORS,
  STACK_GROUPS,
} from '../content/homepage';
import { PAGE_CONTAINER_CLASS } from '../lib/home/layout';
import Index from './index.astro';

test('renders every homepage section in order', async () => {
  const container = await AstroContainer.create();
  const result = await container.renderToString(Index);

  const markers: Array<[string, string]> = [
    ['Nav', NAV_LABELS.brand],
    ['Hero', HERO_COPY.title.en],
    ['ArchitectureSection', SECTION_COPY.architecture.title.en],
    ['Capabilities', CAPABILITIES[0].title.en],
    ['Stack', STACK_GROUPS[0].label.en],
    ['Sectors', SECTORS[0].title.en],
    ['Projects', SECTION_COPY.projects.title.en],
    ['Methodology', METHODOLOGY_COPY.title.en],
    ['CertContact', CERT_COPY.name],
    ['Footer', FOOTER_COPY.name],
  ];

  let previousIndex = -1;
  for (const [name, marker] of markers) {
    // Search forward from the last match, not from position 0 — some
    // markers collide (e.g. `NAV_LABELS.links[3].label.en` and
    // `SECTION_COPY.projects.title.en` are both literally "Projects"), so an
    // unanchored `indexOf` would keep finding the same earlier occurrence
    // (inside Nav's own link text) for every later section too.
    const index = result.indexOf(marker, previousIndex + 1);
    expect(
      index,
      `expected ${name} marker "${marker}" to appear after the previous section`,
    ).toBeGreaterThan(previousIndex);
    previousIndex = index;
  }
});

test('every Nav anchor href has a matching in-page id exactly once', async () => {
  const container = await AstroContainer.create();
  const result = await container.renderToString(Index);

  for (const link of NAV_LABELS.links) {
    expect(result).toContain(`href="${link.href}"`);

    const idAttr = `id="${link.id}"`;
    const occurrences = result.split(idAttr).length - 1;
    expect(occurrences, `expected exactly one "${idAttr}" in the page`).toBe(1);
  }
});

test('insets every top-level section in the shared page container', async () => {
  const container = await AstroContainer.create();
  const result = await container.renderToString(Index);

  // One container wrapper per top-level <section> (Hero, ArchitectureSection,
  // Capabilities, Stack, Sectors, Projects, Methodology, CertContact) — Nav's
  // own use of the same class is covered by Nav.test.ts.
  const occurrences = result.split(PAGE_CONTAINER_CLASS).length - 1;
  expect(occurrences).toBeGreaterThanOrEqual(8);
});
