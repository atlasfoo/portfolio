import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import { expect, test } from 'vitest';
import LangToggle from './LangToggle.astro';

test('LangToggle renders a button control', async () => {
  const container = await AstroContainer.create();
  const result = await container.renderToString(LangToggle);

  expect(result).toContain('<button');
});

test('LangToggle has an accessible name', async () => {
  const container = await AstroContainer.create();
  const result = await container.renderToString(LangToggle);

  expect(result).toContain('aria-label="Toggle language"');
});

test('LangToggle ships an inline client script', async () => {
  const container = await AstroContainer.create();
  const result = await container.renderToString(LangToggle);

  expect(result).toContain('<script');
});
