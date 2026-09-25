import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import { expect, test } from 'vitest';
import Projects from './Projects.astro';

/**
 * `Projects.astro` shrank to just mounting the `ProjectsGrid` island (T-085)
 * — the section header (eyebrow/title/lead) moved into the island itself so
 * it can share one `justify-between` row with the filter pills, matching the
 * mock. Header content is now covered by `ProjectsGrid.test.tsx`.
 */
test('mounts ProjectsGrid as a client:visible island', async () => {
  const container = await AstroContainer.create();
  const result = await container.renderToString(Projects);

  // Astro serializes a client-hydrated component to an <astro-island>
  // custom element carrying the component's file name (via component-url)
  // and the resolved client directive (via the `client` attribute — the
  // colon form `client:visible` is compile-time only and doesn't survive
  // into rendered output).
  expect(result).toContain('astro-island');
  expect(result).toContain('client="visible"');
  expect(result).toContain('ProjectsGrid');
});

test('renders nothing outside the island (no separate static header)', async () => {
  const container = await AstroContainer.create();
  const result = await container.renderToString(Projects);

  // Everything before the <astro-island> tag should be empty apart from
  // Astro's own hydration boilerplate (<style>/<script> tags it injects
  // ahead of every client-hydrated island) — evidence the header moved into
  // the island rather than staying here too.
  const beforeIsland = result.split('<astro-island')[0];
  const stripped = beforeIsland
    .replace(/<style>[\s\S]*?<\/style>/g, '')
    .replace(/<script>[\s\S]*?<\/script>/g, '');
  expect(stripped.trim()).toBe('');
});
