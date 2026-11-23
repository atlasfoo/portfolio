import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import { expect, test } from 'vitest';
import { CERT_COPY, CERT_TAG, CONTACT_COPY } from '../../content/homepage';
import { resolveCertImage } from '../../lib/home/cert-badge';
import { formatCertDate } from '../../lib/home/cert-dates';
import CertContact from './CertContact.astro';

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Extracts the `<a ...>` opening tag whose `href` matches exactly, so tests
 * can assert on `target`/`rel` without prescribing where in the DOM the
 * anchor lives relative to other markup (e.g. a wrapped Button).
 */
function anchorTagFor(html: string, href: string): string {
  const escaped = escapeRegExp(href);
  const match = html.match(new RegExp(`<a[^>]*href="${escaped}"[^>]*>`));
  expect(match, `expected an <a> tag with href="${href}"`).not.toBeNull();
  return match ? match[0] : '';
}

function getContactLink(id: string) {
  const link = CONTACT_COPY.links.find((item) => item.id === id);
  expect(
    link,
    `expected contact link "${id}" in CONTACT_COPY.links`,
  ).toBeDefined();
  if (!link) throw new Error(`Missing contact link "${id}"`);
  return link;
}

test('renders the primary cert badge and name', async () => {
  const container = await AstroContainer.create();
  const result = await container.renderToString(CertContact);

  const [firstCert] = CERT_COPY;
  const resolvedImage = resolveCertImage(firstCert.image);
  if (resolvedImage) {
    expect(result).toContain(`src="${resolvedImage}"`);
  } else if (firstCert.badge) {
    const hasTile =
      /size-\[74px\][^"]*rounded-\[14px\]/.test(result) &&
      result.includes('linear-gradient(145deg,#2F6BFF,#1b3fa8)') &&
      result.includes(firstCert.badge.top) &&
      result.includes(firstCert.badge.bottom);
    expect(hasTile).toBe(true);
  }

  // Proper noun, not bilingual.
  expect(result).toContain(firstCert.name);
});

test('renders issue and expiry dates with machine-readable datetimes', async () => {
  const container = await AstroContainer.create();
  const result = await container.renderToString(CertContact);

  const [firstCert] = CERT_COPY;
  const issued = formatCertDate(firstCert.issued);
  const expires = formatCertDate(firstCert.expires);

  if (issued && firstCert.dates) {
    expect(result).toContain(
      `<time dateTime="${issued.dateTime}">${issued.label}</time>`,
    );
    expect(result).toContain(firstCert.dates.issued.es);
    expect(result).toContain(firstCert.dates.issued.en);
  }

  if (expires && firstCert.dates) {
    expect(result).toContain(
      `<time dateTime="${expires.dateTime}">${expires.label}</time>`,
    );
    expect(result).toContain(firstCert.dates.expires.es);
    expect(result).toContain(firstCert.dates.expires.en);
  }
});

test('omits the remote credential link when none is configured', async () => {
  const container = await AstroContainer.create();
  const result = await container.renderToString(CertContact);

  expect(result).not.toContain('View credential');
  expect(result).not.toContain('Ver credencial');
});

test('renders the remote credential link when provided', async () => {
  const container = await AstroContainer.create();
  const href = 'https://www.credly.com/badges/abc-123';
  const result = await container.renderToString(CertContact, {
    props: {
      credential: {
        label: { en: 'View credential', es: 'Ver credencial' },
        href,
      },
    },
  });

  const tag = anchorTagFor(result, href);
  expect(tag).toContain('target="_blank"');
  expect(tag).toContain('rel="noopener"');
  expect(result).toContain('View credential');
  expect(result).toContain('Ver credencial');
});

test('renders both language variants of the cert tag', async () => {
  const container = await AstroContainer.create();
  const result = await container.renderToString(CertContact);

  expect(result).toContain(CERT_TAG.en);
  expect(result).toContain(CERT_TAG.es);

  // Bilingual show/hide convention: both language variants render inline,
  // tagged for CSS to show/hide based on <html data-lang>.
  expect(result).toContain('data-lang-content="en"');
  expect(result).toContain('data-lang-content="es"');
});

test('renders contact heading and lede in both languages', async () => {
  const container = await AstroContainer.create();
  const result = await container.renderToString(CertContact);

  expect(result).toContain(CONTACT_COPY.title.en);
  expect(result).toContain(CONTACT_COPY.title.es);

  expect(result).toContain(CONTACT_COPY.lead.en);
  expect(result).toContain(CONTACT_COPY.lead.es);
});

test('mailto CTA links to the right address and reuses Button styling', async () => {
  const container = await AstroContainer.create();
  const result = await container.renderToString(CertContact);

  const emailLink = getContactLink('email');
  const mailAnchor = anchorTagFor(result, emailLink.href);

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

  const githubLink = getContactLink('github');
  const githubAnchor = anchorTagFor(result, githubLink.href);
  expect(githubAnchor).toContain('target="_blank"');
  expect(githubAnchor).toContain('rel="noopener"');
});

test('LinkedIn link opens externally with rel="noopener"', async () => {
  const container = await AstroContainer.create();
  const result = await container.renderToString(CertContact);

  const linkedinLink = getContactLink('linkedin');
  const linkedinAnchor = anchorTagFor(result, linkedinLink.href);
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

  const [firstCert] = CERT_COPY;
  // Only assert the generated tile when no badge image is present; with an
  // image in `public/certs/` the `<img>` variant replaces it by design.
  if (!/<img[^>]+src="\/certs\//.test(result)) {
    expect(result).toMatch(/size-\[74px\][^"]*rounded-\[14px\]/);
    expect(result).toContain('linear-gradient(145deg,#2F6BFF,#1b3fa8)');
  }
  expect(result).toMatch(
    new RegExp(`<[^>]*text-\\[17px\\][^>]*>${escapeRegExp(firstCert.name)}`),
  );
  expect(result).toMatch(
    new RegExp(`<[^>]*text-faint[^>]*>${escapeRegExp(firstCert.issuer)}`),
  );
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

  const leadIndex = result.indexOf(CONTACT_COPY.lead.en);
  expect(leadIndex).toBeGreaterThan(-1);
  const beforeLead = result.slice(0, leadIndex);
  const lastPTag = [...beforeLead.matchAll(/<p class="([^"]*)"/g)].pop();
  expect(lastPTag?.[1]).not.toMatch(/font-mono/);
});

test('GitHub and LinkedIn links render as bordered mono pills', async () => {
  const container = await AstroContainer.create();
  const result = await container.renderToString(CertContact);

  const githubLink = getContactLink('github');
  const githubAnchor = anchorTagFor(result, githubLink.href);
  expect(githubAnchor).toMatch(/rounded-\[10px\]/);
  expect(githubAnchor).toMatch(/border-border2/);
  expect(githubAnchor).toMatch(/font-mono/);

  const linkedinLink = getContactLink('linkedin');
  const linkedinAnchor = anchorTagFor(result, linkedinLink.href);
  expect(linkedinAnchor).toMatch(/rounded-\[10px\]/);
  expect(linkedinAnchor).toMatch(/border-border2/);
  expect(linkedinAnchor).toMatch(/font-mono/);
});

test('renders the certification slider with dynamic position label', async () => {
  const container = await AstroContainer.create();
  const result = await container.renderToString(CertContact);

  const expectedPosition = `01 / ${String(CERT_COPY.length).padStart(2, '0')}`;
  expect(result).toContain(expectedPosition);
});

test('renders slider navigation controls matching CERT_COPY length', async () => {
  const container = await AstroContainer.create();
  const result = await container.renderToString(CertContact);

  for (let i = 0; i < CERT_COPY.length; i++) {
    expect(result).toContain(`aria-label="Certification ${i + 1}"`);
  }

  if (CERT_COPY.length > 1) {
    expect(result).toMatch(/aria-label="[^"]*(?:previous|anterior)[^"]*"/i);
    expect(result).toMatch(/aria-label="[^"]*(?:next|siguiente)[^"]*"/i);
  } else {
    expect(result).not.toMatch(
      /aria-label="[^"]*(?:previous|anterior|next|siguiente)[^"]*"/i,
    );
  }
});

test('renders all configured certifications from CERT_COPY', async () => {
  const container = await AstroContainer.create();
  const result = await container.renderToString(CertContact);

  for (const cert of CERT_COPY) {
    expect(result).toContain(cert.name);
    expect(result).toContain(cert.issuer);
    if (!resolveCertImage(cert.image) && cert.badge) {
      expect(result).toContain(cert.badge.top);
      expect(result).toContain(cert.badge.bottom);
    }
  }
});
