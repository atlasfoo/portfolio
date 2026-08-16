import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import { expect, test } from 'vitest';
import Chip from './Chip.astro';

test('Chip renders slotted text', async () => {
  const container = await AstroContainer.create();
  const result = await container.renderToString(Chip, {
    slots: { default: 'active' },
  });

  expect(result).toContain('active');
});

test('Chip applies pill utility classes', async () => {
  const container = await AstroContainer.create();
  const result = await container.renderToString(Chip, {
    slots: { default: 'tag' },
  });

  expect(result).toContain('bg-panel');
  expect(result).toContain('border-border2');
  expect(result).toContain('rounded-lg');
});
