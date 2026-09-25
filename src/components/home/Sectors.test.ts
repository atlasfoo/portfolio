import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import { expect, test } from 'vitest';
import { SECTION_COPY } from '../../content/homepage';
import Sectors from './Sectors.astro';

test('renders both language variants of all 6 sector titles', async () => {
  const container = await AstroContainer.create();
  const result = await container.renderToString(Sectors);

  // English titles
  expect(result).toContain('Financial sector');
  expect(result).toContain('Healthcare');
  expect(result).toContain('Non-bank branches');
  expect(result).toContain('Banking integrations');
  expect(result).toContain('Payment acceptance');
  expect(result).toContain('Card issuing');

  // Spanish titles
  expect(result).toContain('Sector financiero');
  expect(result).toContain('Sector médico');
  expect(result).toContain('Sucursales no bancarias');
  expect(result).toContain('Integraciones bancarias');
  expect(result).toContain('Aceptación de pagos');
  expect(result).toContain('Emisión de tarjetas');

  // Bilingual show/hide convention: both language variants render inline,
  // tagged for CSS to show/hide based on <html data-lang>.
  expect(result).toContain('data-lang-content="en"');
  expect(result).toContain('data-lang-content="es"');
});

test('renders sector description text in both languages', async () => {
  const container = await AstroContainer.create();
  const result = await container.renderToString(Sectors);

  // Spot-check the first sector's description rather than all 6.
  expect(result).toContain('Banking, transactions and regulatory compliance.');
  expect(result).toContain('Banca, transacciones y cumplimiento regulatorio.');

  // Spot-check a second sector's description too.
  expect(result).toContain('Reliable, reconciled, fail-safe collections.');
  expect(result).toContain(
    'Cobros confiables, conciliados y a prueba de fallos.',
  );
});

test('renders a rounded-square marker for each of the 6 sector entries', async () => {
  const container = await AstroContainer.create();
  const result = await container.renderToString(Sectors);

  // Mock marker: a 10px rounded-square (3px radius) with a glow, not a
  // circle — one occurrence per entry.
  const markerMatches = result.match(/rounded-\[3px\] bg-primary/g) ?? [];
  expect(markerMatches.length).toBeGreaterThanOrEqual(6);
});

test('renders the section eyebrow, title and lead from SECTION_COPY.sectors', async () => {
  const container = await AstroContainer.create();
  const result = await container.renderToString(Sectors);

  expect(result).toContain(SECTION_COPY.sectors.tag.en);
  expect(result).toContain(SECTION_COPY.sectors.title.en);
  expect(result).toContain(SECTION_COPY.sectors.title.es);
  expect(SECTION_COPY.sectors.lead).toBeDefined();
  expect(result).toContain(SECTION_COPY.sectors.lead?.en ?? '');
  expect(result).toContain(SECTION_COPY.sectors.lead?.es ?? '');
});

test('renders the title in the shared serif section-title treatment', async () => {
  const container = await AstroContainer.create();
  const result = await container.renderToString(Sectors);

  expect(result).toMatch(/<h2[^>]*font-serif[^>]*>/);
  expect(result).not.toMatch(/<h2[^>]*font-sans[^>]*>/);
});

test('renders each sector entry as its own individually-bordered card, not a fused hairline-divider block', async () => {
  const container = await AstroContainer.create();
  const result = await container.renderToString(Sectors);

  // The mock renders 6 discrete rounded+bordered cards with real gaps
  // between them — not one shared border wrapping a `gap-px`-divided grid.
  // Loose check: one independently-rounded, independently-bordered wrapper
  // per entry, evidence entries aren't fused into a single bordered block.
  const cardMatches = result.match(/rounded-\[13px\] border/g) ?? [];
  expect(cardMatches.length).toBeGreaterThanOrEqual(6);
});

test("lays out entries in the mock's auto-fill 4-column grid", async () => {
  const container = await AstroContainer.create();
  const result = await container.renderToString(Sectors);

  expect(result).toMatch(
    /grid-cols-\[repeat\(auto-fill,minmax\(255px,1fr\)\)\]/,
  );
});

test('marker is a rounded square, not a circle; description drops the mono font', async () => {
  const container = await AstroContainer.create();
  const result = await container.renderToString(Sectors);

  expect(result).toMatch(/rounded-\[3px\][^"]*bg-primary/);
  expect(result).not.toMatch(/font-mono[^"]*text-muted[^"]*text-sm/);
});

test('cards carry a hover border/background transition', async () => {
  const container = await AstroContainer.create();
  const result = await container.renderToString(Sectors);

  expect(result).toMatch(/transition-\[border-color,background-color\]/);
});
