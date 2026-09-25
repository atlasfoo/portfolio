import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import { expect, test } from 'vitest';
import CertContact from './CertContact.astro';

/**
 * Extracts the `<a ...>` opening tag whose `href` matches exactly, so tests
 * can assert on `target`/`rel` without prescribing where in the DOM the
 * anchor lives relative to other markup (e.g. a wrapped Button).
 */
function anchorTagFor(html: string, href: string): string {
  const escaped = href.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const match = html.match(new RegExp(`<a[^>]*href="${escaped}"[^>]*>`));
  expect(match, `expected an <a> tag with href="${href}"`).not.toBeNull();
  return match ? match[0] : '';
}

test('renders the AWS cert badge and name', async () => {
  const container = await AstroContainer.create();
  const result = await container.renderToString(CertContact);

  // Badge tile — "AWS" over "CERTIFIED", not bilingual.
  expect(result).toContain('AWS');
  expect(result).toContain('CERTIFIED');

  // Proper noun, not bilingual.
  expect(result).toContain('AWS Certified Solutions Architect');
});

test('renders both language variants of the cert tag', async () => {
  const container = await AstroContainer.create();
  const result = await container.renderToString(CertContact);

  expect(result).toContain('CERTIFICATION');
  expect(result).toContain('CERTIFICACIÓN');

  // Bilingual show/hide convention: both language variants render inline,
  // tagged for CSS to show/hide based on <html data-lang>.
  expect(result).toContain('data-lang-content="en"');
  expect(result).toContain('data-lang-content="es"');
});

test('renders contact heading and lede in both languages', async () => {
  const container = await AstroContainer.create();
  const result = await container.renderToString(CertContact);

  expect(result).toContain('Let’s talk about your system');
  expect(result).toContain('Hablemos de tu sistema');

  expect(result).toContain(
    'Recruiter or client: if you need someone who speaks both code and business, reach out.',
  );
  expect(result).toContain(
    'Reclutador o cliente: si necesitas a alguien que entienda el código y el negocio por igual, escríbeme.',
  );
});

test('mailto CTA links to the right address and reuses Button styling', async () => {
  const container = await AstroContainer.create();
  const result = await container.renderToString(CertContact);

  const mailAnchor = anchorTagFor(result, 'mailto:iscomejia15@outlook.com');

  // Not external in the same sense as GitHub/LinkedIn — no new-tab target.
  expect(mailAnchor).not.toContain('target="_blank"');

  // Evidence of Button's own classes near the CTA, not a specific DOM
  // nesting between the <a> and Button's <button>.
  expect(result).toContain('rounded-lg');
  expect(
    result.includes('bg-primary-600') || result.includes('shadow-cta'),
  ).toBe(true);
});

test('GitHub link opens externally with rel="noopener"', async () => {
  const container = await AstroContainer.create();
  const result = await container.renderToString(CertContact);

  const githubAnchor = anchorTagFor(result, 'https://github.com/atlasfoo');
  expect(githubAnchor).toContain('target="_blank"');
  expect(githubAnchor).toContain('rel="noopener"');
});

test('LinkedIn link opens externally with rel="noopener"', async () => {
  const container = await AstroContainer.create();
  const result = await container.renderToString(CertContact);

  const linkedinAnchor = anchorTagFor(
    result,
    'https://linkedin.com/in/jerrymejia15',
  );
  expect(linkedinAnchor).toContain('target="_blank"');
  expect(linkedinAnchor).toContain('rel="noopener"');
});

test('lays out a two-card grid (cert / contact) matching the mock proportions', async () => {
  const container = await AstroContainer.create();
  const result = await container.renderToString(CertContact);

  expect(result).toMatch(/grid-cols-\[0\.8fr_1\.2fr\]/);
});

test("cert badge matches the mock's exact gradient tile and copy hierarchy", async () => {
  const container = await AstroContainer.create();
  const result = await container.renderToString(CertContact);

  expect(result).toMatch(/size-\[74px\][^"]*rounded-\[14px\]/);
  expect(result).toContain('linear-gradient(145deg,#2F6BFF,#1b3fa8)');
  expect(result).toMatch(
    /<[^>]*text-\[17px\][^>]*>AWS Certified Solutions Architect/,
  );
  expect(result).toMatch(/<[^>]*text-faint[^>]*>Amazon Web Services/);
});

test("contact card carries the mock's radial-glow background and serif title", async () => {
  const container = await AstroContainer.create();
  const result = await container.renderToString(CertContact);

  expect(result).toMatch(/radial-gradient\(600px_300px_at_100%_0%/);
  expect(result).toMatch(
    /<h2[^>]*font-serif[^>]*clamp\(28px,3\.6vw,42px\)[^>]*>/,
  );
});

test('contact lead carries no mono font', async () => {
  const container = await AstroContainer.create();
  const result = await container.renderToString(CertContact);

  const leadIndex = result.indexOf(
    'Recruiter or client: if you need someone who speaks both code and business, reach out.',
  );
  const beforeLead = result.slice(0, leadIndex);
  const lastPTag = [...beforeLead.matchAll(/<p class="([^"]*)"/g)].pop();
  expect(lastPTag?.[1]).not.toMatch(/font-mono/);
});

test('GitHub and LinkedIn links render as bordered mono pills', async () => {
  const container = await AstroContainer.create();
  const result = await container.renderToString(CertContact);

  const githubAnchor = anchorTagFor(result, 'https://github.com/atlasfoo');
  expect(githubAnchor).toMatch(/rounded-\[10px\]/);
  expect(githubAnchor).toMatch(/border-border2/);
  expect(githubAnchor).toMatch(/font-mono/);
});
