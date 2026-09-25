import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import { expect, test } from 'vitest';
import Methodology from './Methodology.astro';

test('renders both language variants of the title in the shared serif treatment', async () => {
  const container = await AstroContainer.create();
  const result = await container.renderToString(Methodology);

  expect(result).toContain('Cómo construyo hoy');
  expect(result).toContain('How I build today');

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

  expect(result).toContain(
    'Integro agentes de IA dentro de una metodología de desarrollo propia. No para reemplazar el criterio, sino para multiplicarlo: más velocidad, menos trabajo repetitivo y más tiempo para la arquitectura y el negocio.',
  );
  expect(result).toContain(
    'I weave AI agents into my own development methodology. Not to replace judgment, but to multiply it: more speed, less busywork and more time for architecture and the business.',
  );

  const bodyTextIndex = result.indexOf(
    'I weave AI agents into my own development methodology.',
  );
  const beforeBody = result.slice(0, bodyTextIndex);
  const lastPTagMatch = [...beforeBody.matchAll(/<p class="([^"]*)"/g)].pop();
  expect(lastPTagMatch?.[1]).not.toMatch(/font-mono/);
});

test('renders every tool as an accent-variant Chip', async () => {
  const container = await AstroContainer.create();
  const result = await container.renderToString(Methodology);

  for (const tool of ['Claude Code', 'Cursor', 'Antigravity']) {
    expect(result).toContain(tool);
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
  expect(result).toMatch(/<[^>]*text-primary2[^>]*>\$ claude --role architect/);

  // Comment line, both languages, dim tone.
  expect(result).toMatch(
    /<[^>]*text-dim[^>]*>[\s\S]*# desarrollo agéntico \+ criterio humano/,
  );
  expect(result).toMatch(
    /<[^>]*text-dim[^>]*>[\s\S]*# agentic dev \+ human judgment/,
  );

  // "Done" lines, both languages, green check.
  expect(result).toContain('arquitectura propuesta');
  expect(result).toContain('architecture proposed');
  expect(result).toContain('tests generados');
  expect(result).toContain('tests generated');
  expect(result).toMatch(/<span class="text-success-400">✓<\/span>/);

  // Running line, both languages, bright body tone.
  expect(result).toMatch(/<[^>]*text-body[^>]*>[\s\S]*> construyendo/);
  expect(result).toMatch(/<[^>]*text-body[^>]*>[\s\S]*> building/);

  // Blinking cursor element, same animate-pulse convention as HeroTerminal.
  expect(result).toMatch(/animate-pulse/);

  // Terminal panel itself: dark background over the mock's mono 12.5px type.
  expect(result).toMatch(/text-\[12\.5px\]/);
});
