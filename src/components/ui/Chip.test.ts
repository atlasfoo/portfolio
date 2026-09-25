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

test('default (no variant) renders neutral classes', async () => {
  const container = await AstroContainer.create();
  const result = await container.renderToString(Chip, {
    slots: { default: 'chip' },
  });

  expect(result).toContain('bg-panel');
  expect(result).toContain('border-border2');
});

test('accent variant renders accent classes', async () => {
  const container = await AstroContainer.create();
  const result = await container.renderToString(Chip, {
    slots: { default: 'chip' },
    props: { variant: 'accent' },
  });

  expect(result).toContain('border-[rgba(47,107,255,0.22)]');
  expect(result).toContain('bg-[rgba(47,107,255,0.08)]');
});
