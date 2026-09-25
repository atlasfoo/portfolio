import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import { expect, test } from 'vitest';
import ThemeToggle from './ThemeToggle.astro';

test('ThemeToggle renders a button control', async () => {
  const container = await AstroContainer.create();
  const result = await container.renderToString(ThemeToggle);

  expect(result).toContain('<button');
});

test('ThemeToggle has an accessible name', async () => {
  const container = await AstroContainer.create();
  const result = await container.renderToString(ThemeToggle);

  expect(result).toContain('aria-label="Toggle theme"');
});

test('ThemeToggle ships an inline client script', async () => {
  const container = await AstroContainer.create();
  const result = await container.renderToString(ThemeToggle);

  expect(result).toContain('<script');
});
