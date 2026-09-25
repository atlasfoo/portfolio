import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import { expect, test } from 'vitest';
import Card from './Card.astro';

test('default variant renders surface classes', async () => {
  const container = await AstroContainer.create();
  const result = await container.renderToString(Card);

  expect(result).toContain('bg-panel');
  expect(result).toContain('border-border2');
});

test('accent variant renders accent classes', async () => {
  const container = await AstroContainer.create();
  const result = await container.renderToString(Card, {
    props: { variant: 'accent' },
  });

  expect(result).toContain('border-[rgba(47,107,255,0.22)]');
  expect(result).toContain(
    'bg-[linear-gradient(180deg,rgba(47,107,255,0.07),var(--bg))]',
  );
});

test('renders eyebrow and title props', async () => {
  const container = await AstroContainer.create();
  const result = await container.renderToString(Card, {
    props: { eyebrow: 'card / surface', title: 'Surface card' },
  });

  expect(result).toContain('card / surface');
  expect(result).toContain('Surface card');
});

test('renders slotted body content', async () => {
  const container = await AstroContainer.create();
  const result = await container.renderToString(Card, {
    slots: { default: 'Body copy goes here.' },
  });

  expect(result).toContain('Body copy goes here.');
});

test("carries the mock's card radius and hover lift/border/background treatment", async () => {
  const container = await AstroContainer.create();
  const result = await container.renderToString(Card);

  expect(result).toMatch(/rounded-\[14px\]/);
  expect(result).toMatch(/hover:-translate-y-1/);
  expect(result).toMatch(/hover:border-\[rgba\(47,107,255,0\.45\)\]/);
  expect(result).toMatch(/hover:bg-primary-600\/5/);
  expect(result).toMatch(
    /transition-\[border-color,translate,background-color\]/,
  );
});

test("spaces the eyebrow/title/body per the mock's capability-card metrics", async () => {
  const container = await AstroContainer.create();
  const result = await container.renderToString(Card, {
    props: { eyebrow: 'card / surface', title: 'Surface card' },
  });

  expect(result).toMatch(/<p[^>]*mb-4[^>]*>card \/ surface<\/p>/);
  expect(result).toMatch(/<h3[^>]*text-lg[^>]*mb-2[^>]*>Surface card<\/h3>/);
});
