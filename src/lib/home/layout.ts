/**
 * Shared page gutter, ported verbatim from the design mock's computed
 * `<main>` style (`design-import/Portafolio Jerry Mejia.dc.html`):
 * `max-width: 1180px; padding: 0 28px`. Applied by every top-level section
 * wrapper (`index.astro`) and Nav's content row so the container can't
 * drift between call sites.
 */
export const PAGE_CONTAINER_CLASS = 'mx-auto w-full max-w-[1180px] px-[28px]';

/**
 * Shared section-header `<h2>` treatment, ported verbatim from the design
 * mock's computed style (Instrument Serif 400, `clamp(28px,4vw,46px)`).
 * Applied by every top-level section header (Architecture, Capabilities,
 * Stack, Sectors, Projects) so the title style can't drift between sections.
 */
export const SECTION_TITLE_CLASS =
  'font-serif font-normal text-[clamp(28px,4vw,46px)] leading-[1.05] text-text';
