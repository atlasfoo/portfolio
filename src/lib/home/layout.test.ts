import { describe, expect, test } from 'vitest';
import { PAGE_CONTAINER_CLASS, SECTION_TITLE_CLASS } from './layout';

/**
 * `layout.ts` does not exist yet — this file is expected to fail with a
 * "module not found" error until T-058 lands.
 *
 * `PAGE_CONTAINER_CLASS` is the single source of truth for the page's
 * horizontal gutter, ported verbatim from the design mock's computed
 * `<main>` style (`design-import/Portafolio Jerry Mejia.dc.html`):
 * `max-width: 1180px; padding: 0 28px`. Every call site (Nav's content row,
 * each top-level section in `index.astro`) applies this one class string
 * rather than repeating the Tailwind utilities, so the gutter can't drift
 * between sections.
 */
describe('PAGE_CONTAINER_CLASS', () => {
  test("caps the content width at the mock's 1180px", () => {
    expect(PAGE_CONTAINER_CLASS).toContain('max-w-[1180px]');
  });

  test("applies the mock's 28px horizontal padding", () => {
    expect(PAGE_CONTAINER_CLASS).toContain('28px');
  });

  test('centers the container', () => {
    expect(PAGE_CONTAINER_CLASS).toContain('mx-auto');
  });
});

/**
 * `SECTION_TITLE_CLASS` is the single source of truth for every top-level
 * section `<h2>` (Architecture, Capabilities, Stack, Sectors, Projects),
 * ported from the mock's computed style: Instrument Serif 400,
 * `clamp(28px,4vw,46px)`.
 */
describe('SECTION_TITLE_CLASS', () => {
  test('uses the serif font family', () => {
    expect(SECTION_TITLE_CLASS).toContain('font-serif');
  });

  test("caps at the mock's clamp(28px,4vw,46px) size", () => {
    expect(SECTION_TITLE_CLASS).toContain('clamp(28px,4vw,46px)');
  });

  test('does not carry the old sans-serif/semibold treatment', () => {
    expect(SECTION_TITLE_CLASS).not.toContain('font-sans');
    expect(SECTION_TITLE_CLASS).not.toContain('font-semibold');
  });
});
