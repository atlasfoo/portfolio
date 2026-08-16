import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import { expect, test } from 'vitest';
import Button from './Button.astro';

test('default variant renders as primary', async () => {
  const container = await AstroContainer.create();
  const result = await container.renderToString(Button, {
    slots: { default: 'Click me' },
  });

  expect(result).toContain('bg-primary-600');
  expect(result).toContain('shadow-cta');
});

test('variant="secondary" renders secondary markup', async () => {
  const container = await AstroContainer.create();
  const result = await container.renderToString(Button, {
    props: { variant: 'secondary' },
    slots: { default: 'Click me' },
  });

  expect(result).toContain('bg-panel');
  expect(result).toContain('border-border2');
});

test('renders slotted label text', async () => {
  const container = await AstroContainer.create();
  const result = await container.renderToString(Button, {
    slots: { default: 'Click me' },
  });

  expect(result).toContain('Click me');
});
