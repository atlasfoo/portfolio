import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import { describe, expect, test } from 'vitest';
import Layout from './Layout.astro';

async function render(props: { title: string; description?: string }) {
  const container = await AstroContainer.create();
  return container.renderToString(Layout, {
    props,
    slots: { default: '<p>page content</p>' },
  });
}

describe('Layout', () => {
  test('renders the title prop', async () => {
    const result = await render({ title: 'Jerry Mejía' });
    expect(result).toContain('<title>Jerry Mejía</title>');
  });

  test('renders the description prop as a meta tag', async () => {
    const result = await render({
      title: 'Jerry Mejía',
      description: 'Portfolio and design system.',
    });
    expect(result).toContain(
      '<meta name="description" content="Portfolio and design system.">',
    );
  });

  test('stamps data-theme on <html> before paint via an inline script', async () => {
    const result = await render({ title: 'Jerry Mejía' });
    expect(result).toMatch(/<html[^>]*data-theme="dark"/);
    expect(result).toContain('<script>(function(){');
    expect(result).toContain(
      "document.documentElement.setAttribute('data-theme'",
    );
  });

  test('stamps data-lang on <html> before paint via an inline script', async () => {
    const result = await render({ title: 'Jerry Mejía' });
    expect(result).toMatch(/<html[^>]*data-lang="en"/);
    expect(result).toContain(
      "document.documentElement.setAttribute('data-lang'",
    );
  });

  test('renders the background glow layer', async () => {
    const result = await render({ title: 'Jerry Mejía' });
    expect(result).toContain('data-glow-layer');
  });

  test('loads the three design-system font families', async () => {
    const result = await render({ title: 'Jerry Mejía' });
    expect(result).toContain('Instrument Serif');
    expect(result).toContain('Space Grotesk');
    expect(result).toContain('JetBrains Mono');
  });

  test('renders slotted page content', async () => {
    const result = await render({ title: 'Jerry Mejía' });
    expect(result).toContain('page content');
  });
});
