import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import { expect, test } from 'vitest';
import { SECTION_COPY } from '../../content/homepage';
import Capabilities from './Capabilities.astro';

test('renders all 7 capability numbers as eyebrows', async () => {
  const container = await AstroContainer.create();
  const result = await container.renderToString(Capabilities);

  for (const number of ['01', '02', '03', '04', '05', '06', '07']) {
    expect(result).toContain(number);
  }
});

test('renders both language variants of every capability title', async () => {
  const container = await AstroContainer.create();
  const result = await container.renderToString(Capabilities);

  // English titles
  expect(result).toContain('Distributed systems');
  expect(result).toContain('Observability & tracing');
  expect(result).toContain('Resilience & high availability');
  expect(result).toContain('DevOps & CI/CD');
  expect(result).toContain('Technical leadership');
  expect(result).toContain('Tech–business bridge');
  expect(result).toContain('Audit & compliance');

  // Spanish titles
  expect(result).toContain('Sistemas distribuidos');
  expect(result).toContain('Observabilidad y trazabilidad');
  expect(result).toContain('Resiliencia y alta disponibilidad');
  expect(result).toContain('DevOps y CI/CD');
  expect(result).toContain('Liderazgo técnico');
  expect(result).toContain('Puente técnico–negocio');
  expect(result).toContain('Auditoría y cumplimiento');

  // Bilingual show/hide convention: both language variants render inline,
  // tagged for CSS to show/hide based on <html data-lang>.
  expect(result).toContain('data-lang-content="en"');
  expect(result).toContain('data-lang-content="es"');
});

test('renders capability description text in both languages', async () => {
  const container = await AstroContainer.create();
  const result = await container.renderToString(Capabilities);

  // Spot-check the first capability's description rather than all 7.
  expect(result).toContain(
    'Decoupled microservices that scale independently and fail without dragging the rest down.',
  );
  expect(result).toContain(
    'Microservicios desacoplados que escalan por separado y fallan sin arrastrar al resto.',
  );
});

test('reuses the Card component for each entry', async () => {
  const container = await AstroContainer.create();
  const result = await container.renderToString(Capabilities);

  // Card's own wrapper class — evidence the cards aren't hand-rolled markup.
  expect(result).toContain('rounded-[14px]');
});

test("each card carries the mock's hover lift/border/background treatment", async () => {
  const container = await AstroContainer.create();
  const result = await container.renderToString(Capabilities);

  expect(result).toMatch(/hover:-translate-y-1/);
  expect(result).toMatch(/rounded-\[14px\]/);
});

test('renders the title in the shared serif section-title treatment', async () => {
  const container = await AstroContainer.create();
  const result = await container.renderToString(Capabilities);

  expect(result).toMatch(/<h2[^>]*font-serif[^>]*>/);
  expect(result).not.toMatch(/<h2[^>]*font-sans[^>]*>/);
});

test('renders the section eyebrow and title from SECTION_COPY.capabilities', async () => {
  const container = await AstroContainer.create();
  const result = await container.renderToString(Capabilities);

  expect(result).toContain(SECTION_COPY.capabilities.tag.en);
  expect(result).toContain(SECTION_COPY.capabilities.tag.es);
  expect(result).toContain(SECTION_COPY.capabilities.title.en);
  expect(result).toContain(SECTION_COPY.capabilities.title.es);
});
