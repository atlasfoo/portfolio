import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import { expect, test } from 'vitest';
// Component doesn't exist yet (T-038) — this import is expected to fail to
// resolve, which is the "red for the right reason" this test starts red for.
import ArchitectureSection from './ArchitectureSection.astro';

test('renders the architecture section heading and lede in both languages', async () => {
  const container = await AstroContainer.create();
  const result = await container.renderToString(ArchitectureSection);

  // Eyebrow/tag
  expect(result).toContain('LIVE ARCHITECTURE');
  expect(result).toContain('ARQUITECTURA EN VIVO');

  // Title
  expect(result).toContain('One architecture, told live');
  expect(result).toContain('Una arquitectura, contada en vivo');

  // Lead
  expect(result).toContain(
    'This is what a system designed to fail gracefully looks like: decoupled layers, async communication and end-to-end visibility.',
  );
  expect(result).toContain(
    'Así se ve un sistema diseñado para fallar bien: capas desacopladas, comunicación asíncrona y visibilidad de punta a punta.',
  );

  // Bilingual show/hide convention: both language variants render inline,
  // tagged for CSS to show/hide based on <html data-lang>.
  expect(result).toContain('data-lang-content="en"');
  expect(result).toContain('data-lang-content="es"');
});

test('no longer renders the hover/tap hint in the section header (it moved into the diagram detail panel)', async () => {
  const container = await AstroContainer.create();
  const result = await container.renderToString(ArchitectureSection);

  // The hint text still appears further down, server-rendered as part of
  // ArchitectureDiagram's own island markup (T-077) — only the header block
  // (everything before the island wrapper) is scoped by this assertion.
  const header = result.split('<div class="mt-4 md:mt-8">')[0];
  expect(header).not.toContain('// hover or tap each piece');
  expect(header).not.toContain('// pasa el cursor o toca cada pieza');
});

test('mounts ArchitectureDiagram as a client:visible island', async () => {
  const container = await AstroContainer.create();
  const result = await container.renderToString(ArchitectureSection);

  // Astro serializes a client-hydrated component to an <astro-island>
  // custom element carrying the component's file name (via component-url)
  // and the resolved client directive (via the `client` attribute — the
  // colon form `client:visible` is compile-time only and doesn't survive
  // into rendered output). Both are observable evidence of the mount
  // without depending on ArchitectureDiagram.tsx's own markup, which
  // doesn't exist yet (T-036).
  expect(result).toContain('astro-island');
  expect(result).toMatch(/component-url="[^"]*ArchitectureDiagram[^"]*"/);
  expect(result).toMatch(/client="visible"/);
});

test('renders the title in the shared serif section-title treatment', async () => {
  const container = await AstroContainer.create();
  const result = await container.renderToString(ArchitectureSection);

  expect(result).toMatch(/<h2[^>]*font-serif[^>]*>/);
  expect(result).not.toMatch(/<h2[^>]*font-sans[^>]*>/);
});

test('wraps the diagram in a responsive md: breakpoint so it stacks below the lede on narrow viewports', async () => {
  const container = await AstroContainer.create();
  const result = await container.renderToString(ArchitectureSection);

  // Exact class name is the implementer's call (T-038); we only require
  // that a real Tailwind `md:` utility is applied to some element in the
  // rendered markup, evidence of a breakpoint-driven layout switch rather
  // than a diagram that merely shrinks in place.
  expect(result).toMatch(/class="[^"]*\bmd:[a-zA-Z0-9_-]+[^"]*"/);
});
