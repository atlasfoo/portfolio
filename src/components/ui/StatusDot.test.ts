import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import { expect, test } from 'vitest';
import StatusDot from './StatusDot.astro';

test('StatusDot renders label prop text', async () => {
  const container = await AstroContainer.create();
  const result = await container.renderToString(StatusDot, {
    props: { label: 'online' },
  });

  expect(result).toContain('online');
});

test('StatusDot applies dot and pill utility classes', async () => {
  const container = await AstroContainer.create();
  const result = await container.renderToString(StatusDot, {
    props: { label: 'online' },
  });

  expect(result).toContain('bg-success-400');
  expect(result).toContain('rounded-lg');
});
