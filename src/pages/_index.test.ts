import { readFileSync } from 'node:fs';
import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import { expect, test, vi } from 'vitest';

vi.mock('astro:assets', () => ({
  Font: () => null,
}));

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
    ['CertContact', CERT_COPY[0].name],
    ['Footer', FOOTER_COPY.name],
  ];

  let previousIndex = -1;
  // The wordmark is `atlas` + `foo`, so the brand string is not contiguous in the HTML.
  const text = result.replace(/<[^>]+>/g, '');
  for (const [name, marker] of markers) {
    // Search forward from the last match, not from position 0 — some
    // markers collide (e.g. `NAV_LABELS.links[3].label.en` and
    // `SECTION_COPY.projects.title.en` are both literally "Projects"), so an
    // unanchored `indexOf` would keep finding the same earlier occurrence
    // (inside Nav's own link text) for every later section too.
    const index = text.indexOf(marker, previousIndex + 1);
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

test('nav and favicon SVG show the atlasfoo isologo and wordmark, not jerry.mejia or the square dot', async () => {
  const container = await AstroContainer.create();
  const result = await container.renderToString(Index);

  const navMatch = result.match(/<nav[\s\S]*?<\/nav>/)?.[0] ?? '';

  // Nav brand shows atlasfoo and not jerry.mejia. Tags split atlas and foo.
  expect(navMatch.replace(/<[^>]+>/g, '')).toContain('atlasfoo');
  expect(navMatch).not.toContain('jerry.mejia');

  // Nav does not render the square dot
  expect(navMatch).not.toMatch(/<span[^>]*rounded-\[3px\][^>]*bg-primary/);
  expect(navMatch).not.toMatch(/<span[^>]*bg-primary[^>]*>\s*<\/span>/);

  // Favicon is linked and its SVG file contains the atlasfoo mark
  expect(result).toContain('href="/favicon.svg"');
  const faviconSvg = readFileSync(
    new URL('../../public/favicon.svg', import.meta.url),
    'utf-8',
  );
  expect(faviconSvg).toContain('atlasfoo');
});

test('wordmark text atlasfoo remains visible on the page if the nav SVG is absent', async () => {
  const container = await AstroContainer.create();
  const result = await container.renderToString(Index);

  const navMatch = result.match(/<nav[\s\S]*?<\/nav>/)?.[0] ?? '';
  const withoutSvg = navMatch.replace(/<svg[\s\S]*?<\/svg>/gi, '');
  expect(withoutSvg.replace(/<[^>]+>/g, '')).toContain('atlasfoo');
});

test('home head uses the design title and description', async () => {
  const container = await AstroContainer.create();
  const result = await container.renderToString(Index);

  expect(result).toContain(
    '<title>Jerry Mejía — Software Architect &amp; AWS Cloud Engineer</title>',
  );
  expect(result).toContain(
    '<meta name="description" content="Portfolio of Jerry Mejía, Software Architect &amp; AWS Cloud Engineer. Distributed systems, observable, resilient, high-availability cloud architecture.">',
  );
});

test('homepage renders the certification slider with position indicator and both certifications', async () => {
  const container = await AstroContainer.create();
  const result = await container.renderToString(Index);

  // Position indicator starting at 01 / 02
  expect(result).toContain('01 / 02');

  // Both certifications present
  expect(result).toContain('AWS Certified Solutions Architect');
  expect(result).toContain(
    'Scrum Foundation Professional Certification (SFPC™)',
  );
});
