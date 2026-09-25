import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import { expect, test } from 'vitest';
import { HERO_COPY } from '../../content/homepage';
import Hero from './Hero.astro';

test('renders kicker in both languages', async () => {
  const container = await AstroContainer.create();
  const result = await container.renderToString(Hero);

  expect(result).toContain(HERO_COPY.kicker.en);
  expect(result).toContain(HERO_COPY.kicker.es);
  expect(result).toContain('data-lang-content="en"');
  expect(result).toContain('data-lang-content="es"');
});

test('renders headline (title) in both languages', async () => {
  const container = await AstroContainer.create();
  const result = await container.renderToString(Hero);

  expect(result).toContain(HERO_COPY.title.en);
  expect(result).toContain(HERO_COPY.title.es);
});

test('renders subhead (subtitle) in both languages', async () => {
  const container = await AstroContainer.create();
  const result = await container.renderToString(Hero);

  expect(result).toContain(HERO_COPY.subtitle.en);
  expect(result).toContain(HERO_COPY.subtitle.es);
});

test('renders primary and secondary CTAs, reusing Button', async () => {
  const container = await AstroContainer.create();
  const result = await container.renderToString(Hero);

  expect(result).toContain(HERO_COPY.ctaPrimary.href);
  expect(result).toContain(HERO_COPY.ctaPrimary.label.en);
  expect(result).toContain(HERO_COPY.ctaPrimary.label.es);

  expect(result).toContain(HERO_COPY.ctaSecondary.href);
  expect(result).toContain(HERO_COPY.ctaSecondary.label.en);
  expect(result).toContain(HERO_COPY.ctaSecondary.label.es);

  // Button's own base classes — evidence the CTAs aren't hand-rolled <a>/<button> markup.
  expect(result).toContain('rounded-lg px-6 py-3');
});

test('renders the stat row with bilingual labels', async () => {
  const container = await AstroContainer.create();
  const result = await container.renderToString(Hero);

  // Spot-check one stat's bilingual label rather than every stat.
  const [firstStat] = HERO_COPY.stats;
  expect(result).toContain(firstStat.value);
  expect(result).toContain(firstStat.label.en);
  expect(result).toContain(firstStat.label.es);
});

test("carries the mock's vertical rhythm (top/bottom padding + min-height)", async () => {
  const container = await AstroContainer.create();
  const result = await container.renderToString(Hero);

  const rootTag = result.match(/<div[^>]*>/)?.[0] ?? '';
  expect(rootTag).toMatch(/pt-\[78px\]/);
  expect(rootTag).toMatch(/pb-16/);
  expect(rootTag).toMatch(/min-h-\[88vh\]/);
});

test("h1 reaches the mock's full clamp range", async () => {
  const container = await AstroContainer.create();
  const result = await container.renderToString(Hero);

  expect(result).toMatch(/<h1[^>]*clamp\(40px,5\.6vw,72px\)[^>]*>/);
});

test('stat row uses explicit divider elements instead of divide-x/px-8, so a wrapped stat lands flush-left', async () => {
  const container = await AstroContainer.create();
  const result = await container.renderToString(Hero);

  expect(result).not.toMatch(/divide-x/);
  expect(result).not.toMatch(/first:pl-0/);
  expect(result).toMatch(/class="[^"]*gap-\[34px\][^"]*"/);
  // At least one standalone 1px divider element between stats.
  expect(result).toMatch(
    /class="[^"]*w-px[^"]*self-stretch[^"]*bg-border2[^"]*"/,
  );
});

test('mounts HeroTerminal as a client:visible island', async () => {
  const container = await AstroContainer.create();
  const result = await container.renderToString(Hero);

  // Astro's SSR output for a hydrated framework component is a serialized
  // <astro-island> custom element rather than the component's own markup
  // (the component itself only renders client-side). The directive and
  // component identity are attributes on that element:
  //   <astro-island ... component-url=".../HeroTerminal..." client="visible"
  //     opts="{&quot;name&quot;:&quot;HeroTerminal&quot;,...}"></astro-island>
  expect(result).toContain('<astro-island');
  expect(result).toContain('client="visible"');
  expect(result).toContain('HeroTerminal');
});
