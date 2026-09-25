import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import { expect, test } from 'vitest';
import { PAGE_CONTAINER_CLASS } from '../../lib/home/layout';
import Nav from './Nav.astro';

test('renders the wordmark', async () => {
  const container = await AstroContainer.create();
  const result = await container.renderToString(Nav);

  expect(result).toContain('jerry.mejia');
});

test('renders section anchor links with English ids', async () => {
  const container = await AstroContainer.create();
  const result = await container.renderToString(Nav);

  expect(result).toContain('href="#architecture"');
  expect(result).toContain('href="#stack"');
  expect(result).toContain('href="#sectors"');
  expect(result).toContain('href="#projects"');
});

test('renders both language variants of each link label', async () => {
  const container = await AstroContainer.create();
  const result = await container.renderToString(Nav);

  // English labels
  expect(result).toContain('Architecture');
  expect(result).toContain('Stack');
  expect(result).toContain('Sectors');
  expect(result).toContain('Projects');

  // Spanish labels (Stack is identical in both languages)
  expect(result).toContain('Arquitectura');
  expect(result).toContain('Sectores');
  expect(result).toContain('Proyectos');

  // Bilingual show/hide convention: both language variants render inline,
  // tagged for CSS to show/hide based on <html data-lang>.
  expect(result).toContain('data-lang-content="en"');
  expect(result).toContain('data-lang-content="es"');
});

test('does not render a Blog link', async () => {
  const container = await AstroContainer.create();
  const result = await container.renderToString(Nav);

  expect(result).not.toContain('Blog');
});

test('renders a bilingual status pill with a dot marker', async () => {
  const container = await AstroContainer.create();
  const result = await container.renderToString(Nav);

  expect(result).toContain('Available');
  expect(result).toContain('Disponible');
  expect(result).toContain('data-lang-content="en"');
  expect(result).toContain('data-lang-content="es"');

  // Dot marker: reuse of the existing StatusDot pill styling.
  expect(result).toContain('bg-success-400');
});

test('mounts the language and theme toggle controls', async () => {
  const container = await AstroContainer.create();
  const result = await container.renderToString(Nav);

  expect(result).toContain('data-lang-toggle');
  expect(result).toContain('data-theme-toggle');
});

test('insets its content row in the shared page container, keeping the bar itself full-bleed', async () => {
  const container = await AstroContainer.create();
  const result = await container.renderToString(Nav);

  // The <nav> element's own background/border stay full-bleed by design —
  // only its inner content row is inset, matching the mock. Asserting the
  // container class is present at all is the meaningful check here; the
  // full-bleed-bar half is a markup-shape property this render-to-string
  // test can't isolate without a real layout engine.
  expect(result).toContain(PAGE_CONTAINER_CLASS);
});

test('blurs its background instead of the flat panel tone (mock: backdrop-filter blur(14px))', async () => {
  const container = await AstroContainer.create();
  const result = await container.renderToString(Nav);

  const navTag = result.match(/<nav[^>]*>/)?.[0] ?? '';
  expect(navTag).toMatch(/backdrop-blur/);
  expect(navTag).toContain('bg-nav');
  expect(navTag).not.toContain('bg-panel');
});

test('renders a brand glyph before the wordmark', async () => {
  const container = await AstroContainer.create();
  const result = await container.renderToString(Nav);

  expect(result).toMatch(
    /<span[^>]*bg-primary[^>]*>\s*<\/span>\s*<span[^>]*>\s*jerry\.mejia/,
  );
});

test('renders the status indicator with a hairline divider and no bordered pill wrapper', async () => {
  const container = await AstroContainer.create();
  const result = await container.renderToString(Nav);

  expect(result).toMatch(
    /class="[^"]*w-px[^"]*h-\[18px\][^"]*bg-border2[^"]*"/,
  );
  expect(result).not.toContain(
    'inline-flex items-center gap-2 bg-panel border border-border2 rounded-lg px-3 py-1.5',
  );
});

test('hides the desktop link/status row below md: and collapses it into a mobile disclosure', async () => {
  const container = await AstroContainer.create();
  const result = await container.renderToString(Nav);

  // The desktop row (links + divider/status) is hidden on narrow viewports —
  // it only appears at md: and up.
  expect(result).toMatch(/class="[^"]*hidden md:flex[^"]*"/);

  // A native <details>/<summary> disclosure carries the mobile menu — no new
  // JS needed, keyboard-operable for free.
  expect(result).toContain('data-nav-mobile-menu');
  expect(result).toMatch(/<details[^>]*data-nav-mobile-menu[^>]*>/);
  expect(result).toMatch(/<summary[^>]*>/);
  expect(result).toMatch(
    /class="[^"]*md:hidden[^"]*"[^>]*data-nav-mobile-menu/,
  );
});

test('the mobile disclosure repeats the same section links and status pill, stacked', async () => {
  const container = await AstroContainer.create();
  const result = await container.renderToString(Nav);

  const detailsMatch = result.match(
    /<details[^>]*data-nav-mobile-menu[^>]*>[\s\S]*?<\/details>/,
  );
  expect(detailsMatch).not.toBeNull();
  const mobileMenu = detailsMatch?.[0] ?? '';

  expect(mobileMenu).toContain('href="#architecture"');
  expect(mobileMenu).toContain('href="#stack"');
  expect(mobileMenu).toContain('href="#sectors"');
  expect(mobileMenu).toContain('href="#projects"');
  expect(mobileMenu).toContain('Available');
  expect(mobileMenu).toContain('Disponible');
});

test('the hamburger summary has an accessible name', async () => {
  const container = await AstroContainer.create();
  const result = await container.renderToString(Nav);

  const summaryMatch = result.match(/<summary[^>]*>[\s\S]*?<\/summary>/);
  expect(summaryMatch).not.toBeNull();
  const summary = summaryMatch?.[0] ?? '';

  // Either an aria-label on <summary> itself or a visually-hidden text node
  // inside it satisfies the accessible-name requirement.
  const hasAriaLabel = /aria-label="[^"]+"/.test(summary);
  const hasSrOnlyText = /sr-only/.test(summary);
  expect(hasAriaLabel || hasSrOnlyText).toBe(true);
});

test('mounts exactly one language toggle and one theme toggle, even with a mobile menu present', async () => {
  const container = await AstroContainer.create();
  const result = await container.renderToString(Nav);

  expect(result.match(/data-lang-toggle/g)?.length).toBe(1);
  expect(result.match(/data-theme-toggle/g)?.length).toBe(1);
});
