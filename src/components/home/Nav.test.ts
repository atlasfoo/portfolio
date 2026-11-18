import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import { expect, test } from 'vitest';
import { PAGE_CONTAINER_CLASS } from '../../lib/home/layout';
import Nav from './Nav.astro';

test('renders the wordmark', async () => {
  const container = await AstroContainer.create();
  const result = await container.renderToString(Nav);

  expect(result.replace(/<[^>]+>/g, '')).toContain('atlasfoo');
  expect(result).not.toContain('jerry.mejia');
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
  expect(result).not.toContain('blog.html');
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

test('renders the atlasfoo isologo before the wordmark, not a square dot', async () => {
  const container = await AstroContainer.create();
  const result = await container.renderToString(Nav);

  // The square dot span is gone
  expect(result).not.toMatch(/<span[^>]*rounded-\[3px\][^>]*bg-primary/);
  expect(result).not.toMatch(/<span[^>]*bg-primary[^>]*>\s*<\/span>/);

  // Renders the inline atlasfoo isologo SVG with currentColor chevron before the wordmark
  expect(result).toMatch(
    /<svg[^>]*>[\s\S]*?stroke="currentColor"[\s\S]*?<\/svg>[\s\S]*?atlas/,
  );
});

test('the wordmark text remains visible if the SVG is absent', async () => {
  const container = await AstroContainer.create();
  const result = await container.renderToString(Nav);

  // If the SVG cannot paint or is stripped from the markup, the text atlasfoo is still present
  const withoutSvg = result.replace(/<svg[\s\S]*?<\/svg>/gi, '');
  expect(withoutSvg.replace(/<[^>]+>/g, '')).toContain('atlasfoo');
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

test('renders a desktop activity guide hint that is hidden below md', async () => {
  const container = await AstroContainer.create();
  const result = await container.renderToString(Nav);

  // The hint element exists for desktop activity indication
  expect(result).toContain('data-nav-hint');

  // Must use the existing hidden md: pattern so the hint cannot cover the mobile page
  const hintTag = result.match(/<[^>]+data-nav-hint[^>]*>/)?.[0] ?? '';
  expect(hintTag).toMatch(/class="[^"]*\bhidden md:[^"]*"/);

  // Server render has no scroll position; aria-current is populated by the client script
  expect(result).not.toContain('aria-current="location"');
});

test('desktop activity guide hint does not bake opacity-0 into its class list', async () => {
  const container = await AstroContainer.create();
  const result = await container.renderToString(Nav);

  const hintTag = result.match(/<[^>]+data-nav-hint[^>]*>/)?.[0] ?? '';
  expect(hintTag).toMatch(/class="[^"]*\bhidden md:[^"]*"/);
  expect(hintTag).not.toMatch(/\bopacity-0\b/);
});

test('the existing mobile disclosure menu retains the same in-page anchors as the desktop list', async () => {
  const container = await AstroContainer.create();
  const result = await container.renderToString(Nav);

  const mobileMatch = result.match(
    /<details[^>]*data-nav-mobile-menu[^>]*>[\s\S]*?<\/details>/,
  );
  expect(mobileMatch).not.toBeNull();
  const mobileMenu = mobileMatch?.[0] ?? '';

  const mobileAnchors = Array.from(
    mobileMenu.matchAll(/href="(#[a-z0-9-]+)"/g),
    (m) => m[1],
  );

  expect(mobileAnchors).toEqual([
    '#architecture',
    '#stack',
    '#sectors',
    '#projects',
  ]);
});

test('renders the wordmark as atlas plus a foo child span using the text-brand-foo theme utility', async () => {
  const container = await AstroContainer.create();
  const result = await container.renderToString(Nav);

  // Wordmark must be the text 'atlas' plus a child span whose text is exactly 'foo'
  const wordmarkMatch = result.match(
    /atlas\s*<span[^>]*class="([^"]*)"[^>]*>\s*foo\s*<\/span>/,
  );
  expect(wordmarkMatch).not.toBeNull();

  const fooSpanClass = wordmarkMatch?.[1] ?? '';
  // The foo span class must use the theme utility text-brand-foo (token --brand-foo, not a raw hex, not text-primary)
  expect(fooSpanClass).toMatch(/\btext-brand-foo\b/);
  expect(fooSpanClass).not.toMatch(/\btext-primary\b/);
  expect(fooSpanClass).not.toMatch(/#[0-9a-fA-F]{3,8}/);
});

test('styles the brand title with Space Grotesk 16px/700 sizing and not font-mono text-sm', async () => {
  const container = await AstroContainer.create();
  const result = await container.renderToString(Nav);

  // Locate the element directly wrapping the atlas wordmark
  const wrapperMatch = result.match(
    /<([a-z0-9]+)\s+([^>]*class="([^"]*)"[^>]*)>\s*atlas/i,
  );
  expect(wrapperMatch).not.toBeNull();

  const wrapperClass = wrapperMatch?.[3] ?? '';

  // Assert it is not font-mono text-sm on the wordmark wrapper
  expect(wrapperClass).not.toMatch(/\bfont-mono\b/);
  expect(wrapperClass).not.toMatch(/\btext-sm\b/);

  // Assert brand title uses Space Grotesk sizing equivalent to 16px/700 (text-base and font-bold)
  expect(wrapperClass).toMatch(/\b(?:text-base|text-\[16px\])\b/);
  expect(wrapperClass).toMatch(/\b(?:font-bold|font-\[700\])\b/);
});

test('renders the logo SVG at 24px with the text-brand-chevron theme token and currentColor chevron', async () => {
  const container = await AstroContainer.create();
  const result = await container.renderToString(Nav);

  const svgMatch = result.match(
    /<svg[^>]*class="([^"]*)"[^>]*>([\s\S]*?)<\/svg>/,
  );
  expect(svgMatch).not.toBeNull();

  const svgClass = svgMatch?.[1] ?? '';
  const svgBody = svgMatch?.[2] ?? '';

  // 24px: class includes size-6 or both h-6 and w-6
  const is24px =
    /\bsize-6\b/.test(svgClass) ||
    (/\bh-6\b/.test(svgClass) && /\bw-6\b/.test(svgClass));
  expect(is24px).toBe(true);

  // Must not include 16px sizing (h-4 or w-4)
  expect(svgClass).not.toMatch(/\b[hw]-4\b/);

  // SVG carries chevron theme token text-brand-chevron
  expect(svgClass).toMatch(/\btext-brand-chevron\b/);
  expect(svgClass).not.toMatch(/#[0-9a-fA-F]{3,8}/);

  // Chevron path retains stroke="currentColor"
  expect(svgBody).toContain('stroke="currentColor"');
});

test('desktop links, status, and toggles sit in one right-hand group after a flexible spacer without justify-between', async () => {
  const container = await AstroContainer.create();
  const result = await container.renderToString(Nav);

  // Helper to find the inner flex row element containing both brand text 'atlas' and 'data-theme-toggle'
  function findElement(
    html: string,
    predicate: (el: {
      tag: string;
      className: string;
      outerHtml: string;
    }) => boolean,
  ) {
    const tagRegex = /<(\/)?([a-z0-9]+)([^>]*)>/gi;
    let match = tagRegex.exec(html);
    while (match !== null) {
      if (!match[1]) {
        const tag = match[2].toLowerCase();
        const attrs = match[3];
        const classMatch = attrs.match(/class="([^"]*)"/i);
        const className = classMatch ? classMatch[1] : '';

        let depth = 1;
        let endIdx = -1;
        const innerRegex = new RegExp(`</?${tag}(?:\\s+[^>]*|>|$)`, 'gi');
        innerRegex.lastIndex = tagRegex.lastIndex;
        let innerMatch = innerRegex.exec(html);
        while (innerMatch !== null) {
          if (innerMatch[0].startsWith('</')) {
            depth--;
            if (depth === 0) {
              endIdx = innerRegex.lastIndex;
              break;
            }
          } else if (!innerMatch[0].endsWith('/>')) {
            depth++;
          }
          innerMatch = innerRegex.exec(html);
        }
        if (endIdx !== -1) {
          const outerHtml = html.slice(match.index, endIdx);
          if (predicate({ tag, className, outerHtml })) {
            return { tag, className, outerHtml };
          }
        }
      }
      match = tagRegex.exec(html);
    }
    return null;
  }

  const innerRow = findElement(
    result,
    (el) =>
      el.className.includes('flex') &&
      el.outerHtml.includes('atlas') &&
      el.outerHtml.includes('data-theme-toggle'),
  );

  expect(innerRow).not.toBeNull();
  if (!innerRow) {
    return;
  }

  // That row's class must not include justify-between
  expect(innerRow.className).not.toMatch(/\bjustify-between\b/);

  // That row must contain a flex-1 spacer
  expect(innerRow.outerHtml).toMatch(/\bflex-1\b/);

  // Order inside that row: atlas index < flex-1 index < #architecture index < data-theme-toggle index
  const atlasIndex = innerRow.outerHtml.indexOf('atlas');
  const spacerIndex = innerRow.outerHtml.indexOf('flex-1');
  const archIndex = innerRow.outerHtml.indexOf('#architecture');
  const toggleIndex = innerRow.outerHtml.indexOf('data-theme-toggle');

  expect(atlasIndex).toBeGreaterThan(-1);
  expect(spacerIndex).toBeGreaterThan(-1);
  expect(archIndex).toBeGreaterThan(-1);
  expect(toggleIndex).toBeGreaterThan(-1);

  expect(atlasIndex).toBeLessThan(spacerIndex);
  expect(spacerIndex).toBeLessThan(archIndex);
  expect(archIndex).toBeLessThan(toggleIndex);
});
