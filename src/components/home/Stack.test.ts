import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import { expect, test } from 'vitest';
import { SECTION_COPY } from '../../content/homepage';
import Stack from './Stack.astro';

test('renders both language variants of stack group labels', async () => {
  const container = await AstroContainer.create();
  const result = await container.renderToString(Stack);

  // English labels
  expect(result).toContain('Languages');
  expect(result).toContain('Frontend');
  expect(result).toContain('Containers & Cloud');

  // Spanish labels
  expect(result).toContain('Lenguajes');
  expect(result).toContain('Contenedores & Nube');

  // Bilingual show/hide convention: both language variants render inline,
  // tagged for CSS to show/hide based on <html data-lang>.
  expect(result).toContain('data-lang-content="en"');
  expect(result).toContain('data-lang-content="es"');
});

test('renders tool item names from stack groups', async () => {
  const container = await AstroContainer.create();
  const result = await container.renderToString(Stack);

  // Spot-check a sample of tool items across different groups.
  expect(result).toContain('Next.js');
  expect(result).toContain('AWS');
  expect(result).toContain('Kubernetes');
});

test('reuses the Chip component for tool items', async () => {
  const container = await AstroContainer.create();
  const result = await container.renderToString(Stack);

  // Chip's own classes — evidence the items aren't hand-rolled markup.
  expect(result).toContain('rounded-lg');
  expect(result).toContain('bg-panel');
});

test('renders the section eyebrow and title from SECTION_COPY.stack', async () => {
  const container = await AstroContainer.create();
  const result = await container.renderToString(Stack);

  expect(result).toContain(SECTION_COPY.stack.tag.en);
  expect(result).toContain(SECTION_COPY.stack.title.en);
  expect(result).toContain(SECTION_COPY.stack.title.es);
});

test('renders the title in the shared serif section-title treatment', async () => {
  const container = await AstroContainer.create();
  const result = await container.renderToString(Stack);

  expect(result).toMatch(/<h2[^>]*font-serif[^>]*>/);
  expect(result).not.toMatch(/<h2[^>]*font-sans[^>]*>/);
});

test("lays out the stack groups in the mock's auto-fit 4-column grid", async () => {
  const container = await AstroContainer.create();
  const result = await container.renderToString(Stack);

  expect(result).toMatch(
    /grid-cols-\[repeat\(auto-fit,minmax\(210px,1fr\)\)\]/,
  );
});

test('each group carries a left border and indent, with a mono uppercase label', async () => {
  const container = await AstroContainer.create();
  const result = await container.renderToString(Stack);

  expect(result).toMatch(/border-l[^"]*pl-\[18px\]/);
  expect(result).toMatch(
    /class="[^"]*font-mono[^"]*text-\[11px\][^"]*uppercase[^"]*tracking-\[0\.05em\][^"]*"/,
  );
});
