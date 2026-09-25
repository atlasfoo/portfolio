import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import { expect, test } from 'vitest';
import { HERO_COPY } from '../../content/homepage';
import { PAGE_CONTAINER_CLASS } from '../../lib/home/layout';
import Footer from './Footer.astro';

test('Footer renders the dual-language footer line', async () => {
  const container = await AstroContainer.create();
  const result = await container.renderToString(Footer);

  // Assert the name string appears
  expect(result).toContain('Jerry Mejía');

  // Assert both language variants of credit appear with proper data-lang-content attributes
  expect(result).toContain('data-lang-content="en"');
  expect(result).toContain('Designed and built by Jerry Mejía');

  expect(result).toContain('data-lang-content="es"');
  expect(result).toContain('Diseñado y construido por Jerry Mejía');
});

test('renders the hero kicker beside the name on the left side, both languages', async () => {
  const container = await AstroContainer.create();
  const result = await container.renderToString(Footer);

  expect(result).toContain(`Jerry Mejía — `);
  expect(result).toContain(HERO_COPY.kicker.en);
  expect(result).toContain(HERO_COPY.kicker.es);
});

test('lays out a single justify-between row inside the shared page container, mono ~11.5px, dim tone', async () => {
  const container = await AstroContainer.create();
  const result = await container.renderToString(Footer);

  expect(result).toMatch(/class="[^"]*justify-between[^"]*"/);
  expect(result).toContain(PAGE_CONTAINER_CLASS);
  expect(result).toMatch(/font-mono[^"]*text-\[11\.5px\][^"]*text-dim/);
});

test('carries the border-top at container width, not full-bleed', async () => {
  const container = await AstroContainer.create();
  const result = await container.renderToString(Footer);

  // The border-top lives on the same element as PAGE_CONTAINER_CLASS
  // (container-scoped), not on the outer <footer> (which would be full-bleed).
  const footerTag = result.match(/<footer[^>]*>/)?.[0] ?? '';
  expect(footerTag).not.toMatch(/border-t\b/);
  expect(result).toMatch(/class="[^"]*border-t[^"]*"/);
});
