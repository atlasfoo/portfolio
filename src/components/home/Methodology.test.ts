import { readFileSync } from 'node:fs';
import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import { expect, test } from 'vitest';
import { METHODOLOGY_COPY } from '../../content/homepage';
import Methodology from './Methodology.astro';

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

test('renders both language variants of the title in the shared serif treatment', async () => {
  const container = await AstroContainer.create();
  const result = await container.renderToString(Methodology);

  expect(result).toContain(METHODOLOGY_COPY.title.es);
  expect(result).toContain(METHODOLOGY_COPY.title.en);

  // Bilingual show/hide convention: both language variants render inline,
  // tagged for CSS to show/hide based on <html data-lang>.
  expect(result).toContain('data-lang-content="en"');
  expect(result).toContain('data-lang-content="es"');

  expect(result).toMatch(
    /<h2[^>]*font-serif[^>]*clamp\(26px,3\.4vw,40px\)[^>]*>/,
  );
});

test('renders both language variants of the body copy with no mono font', async () => {
  const container = await AstroContainer.create();
  const result = await container.renderToString(Methodology);

  expect(result).toContain(METHODOLOGY_COPY.body.es);
  expect(result).toContain(METHODOLOGY_COPY.body.en);

  const bodyTextIndex = result.indexOf(METHODOLOGY_COPY.body.en);
  expect(bodyTextIndex).toBeGreaterThan(-1);
  const beforeBody = result.slice(0, bodyTextIndex);
  const lastPTagMatch = [...beforeBody.matchAll(/<p class="([^"]*)"/g)].pop();
  expect(lastPTagMatch?.[1]).not.toMatch(/font-mono/);
});

test('renders every tool as an accent-variant Chip', async () => {
  const container = await AstroContainer.create();
  const result = await container.renderToString(Methodology);

  let cursor = 0;
  for (const tool of METHODOLOGY_COPY.tools) {
    const index = result.indexOf(tool, cursor);
    expect(index, tool).toBeGreaterThanOrEqual(0);
    cursor = index + tool.length;
  }

  // Evidence the tools are rendered via Chip's accent variant, not the
  // neutral default — the accent border color fragment T-013 adds.
  expect(result).toContain('rgba(47,107,255');
});

test("outer card carries the mock's radius, tinted border and radial-gradient background", async () => {
  const container = await AstroContainer.create();
  const result = await container.renderToString(Methodology);

  expect(result).toMatch(/rounded-\[18px\]/);
  expect(result).toContain('rgba(47,107,255,0.25)');
  expect(result).toMatch(/radial-gradient\(700px_300px_at_0%_0%/);
  expect(result).toMatch(/clamp\(28px,4vw,46px\)/);
});

test('renders the static terminal snippet block with colored lines and a blink cursor', async () => {
  const container = await AstroContainer.create();
  const result = await container.renderToString(Methodology);

  // The command is identical in both languages, so it appears once, plain,
  // colored as the mock's blue `$` prompt.
  expect(result).toMatch(
    new RegExp(
      `<[^>]*text-primary2[^>]*>${escapeRegExp(METHODOLOGY_COPY.terminal.command)}`,
    ),
  );

  // Comment line, both languages, dim tone.
  expect(result).toMatch(
    new RegExp(
      `<[^>]*text-dim[^>]*>[\\s\\S]*${escapeRegExp(METHODOLOGY_COPY.terminal.comment.es)}`,
    ),
  );
  expect(result).toMatch(
    new RegExp(
      `<[^>]*text-dim[^>]*>[\\s\\S]*${escapeRegExp(METHODOLOGY_COPY.terminal.comment.en)}`,
    ),
  );

  // "Done" lines, both languages, green check.
  for (const line of METHODOLOGY_COPY.terminal.done) {
    expect(result).toContain(line.es);
    expect(result).toContain(line.en);
  }
  expect(result).toMatch(/<span class="text-success-400">✓<\/span>/);

  // Running line, both languages, bright body tone.
  expect(result).toMatch(
    new RegExp(
      `<[^>]*text-body[^>]*>[\\s\\S]*${escapeRegExp(METHODOLOGY_COPY.terminal.running.es)}`,
    ),
  );
  expect(result).toMatch(
    new RegExp(
      `<[^>]*text-body[^>]*>[\\s\\S]*${escapeRegExp(METHODOLOGY_COPY.terminal.running.en)}`,
    ),
  );

  // Hard blink (steps), not the fading animate-pulse used by the hero caret.
  expect(result).toMatch(/animate-blink/);
  expect(result).not.toMatch(/animate-pulse/);
  expect(result).toMatch(/motion-reduce:animate-none/);
  expect(result).toMatch(/h-\[15px\]/);
  expect(result).toMatch(/\bw-2\b/);
  const css = readFileSync(`${process.cwd()}/src/styles/global.css`, 'utf8');
  expect(css).toContain('blink 1.05s steps(1) infinite');
  expect(css).toMatch(
    /@keyframes blink\s*\{[\s\S]*49%,\s*100%\s*\{\s*opacity:\s*0/,
  );

  // Terminal panel itself: dark background over the mock's mono 12.5px type.
  expect(result).toMatch(/text-\[12\.5px\]/);
});
