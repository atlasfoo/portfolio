import { existsSync } from 'node:fs';
import { resolve, sep } from 'node:path';

/**
 * Directory where certification badge images are dropped, relative to the
 * project root. Files live under `public/certs/` so Astro copies them as-is
 * and they are served from `/certs/...` (no build step, no import needed).
 */
export const CERT_IMAGE_DIR = resolve(process.cwd(), 'public', 'certs');

export interface CertImageLookup {
  /** Override for tests; defaults to `<cwd>/public/certs`. */
  baseDir?: string;
  /** Override for tests; defaults to `fs.existsSync`. */
  fileExists?: (path: string) => boolean;
}

/**
 * Resolves the public URL of a certification badge image.
 *
 * Accepts either `/certs/aws-sa.png` (the value stored in the content file)
 * or a bare `aws-sa.png`. Returns the `/certs/...` URL only when the file
 * actually exists in `public/certs/`; returns `null` otherwise so callers can
 * fall back to the generated gradient tile.
 *
 * Resolution happens at build time (this site is fully static), so a missing
 * image degrades to the tile instead of shipping a broken `<img>`.
 */
export function resolveCertImage(
  src: string | undefined,
  lookup: CertImageLookup = {},
): string | null {
  if (!src) return null;

  const trimmed = src.trim();
  if (!trimmed) return null;

  const baseDir = resolve(lookup.baseDir ?? CERT_IMAGE_DIR);
  const relative = trimmed.replace(/^\/+/, '').replace(/^certs\//, '');
  if (!relative) return null;

  const candidate = resolve(baseDir, relative);
  // Reject path traversal: the resolved file must stay inside the certs dir.
  if (candidate !== baseDir && !candidate.startsWith(`${baseDir}${sep}`)) {
    return null;
  }

  const exists = lookup.fileExists ?? existsSync;
  if (!exists(candidate)) return null;

  return `/certs/${relative.split(sep).join('/')}`;
}
