import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import { expect, test } from 'vitest';
import Welcome from './Welcome.astro';

test('Welcome renders the starter content', async () => {
  const container = await AstroContainer.create();
  const result = await container.renderToString(Welcome);

  expect(result).toContain("What's New in Astro 6.0?");
});
