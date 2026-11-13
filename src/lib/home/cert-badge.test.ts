import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, beforeEach, describe, expect, test } from 'vitest';
import { resolveCertImage } from './cert-badge';

describe('resolveCertImage', () => {
  let baseDir: string;

  beforeEach(() => {
    baseDir = mkdtempSync(join(tmpdir(), 'certs-'));
  });

  afterEach(() => {
    rmSync(baseDir, { recursive: true, force: true });
  });

  const touch = (relative: string) => {
    const full = join(baseDir, relative);
    mkdirSync(join(full, '..'), { recursive: true });
    writeFileSync(full, 'png');
  };

  test('returns null when no image is configured', () => {
    expect(resolveCertImage(undefined, { baseDir })).toBeNull();
    expect(resolveCertImage('', { baseDir })).toBeNull();
    expect(resolveCertImage('   ', { baseDir })).toBeNull();
    expect(resolveCertImage('/', { baseDir })).toBeNull();
    expect(resolveCertImage('/certs/', { baseDir })).toBeNull();
  });

  test('returns the /certs URL when the file exists (absolute form)', () => {
    touch('aws-sa.png');

    expect(resolveCertImage('/certs/aws-sa.png', { baseDir })).toBe(
      '/certs/aws-sa.png',
    );
  });

  test('accepts a bare filename and nested folders', () => {
    touch('aws-sa.png');
    touch(join('aws', 'solutions-architect.png'));

    expect(resolveCertImage('aws-sa.png', { baseDir })).toBe(
      '/certs/aws-sa.png',
    );
    expect(
      resolveCertImage('/certs/aws/solutions-architect.png', { baseDir }),
    ).toBe('/certs/aws/solutions-architect.png');
  });

  test('returns null when the file is missing, so the tile is rendered', () => {
    expect(resolveCertImage('/certs/missing.png', { baseDir })).toBeNull();
  });

  test('rejects paths that escape public/certs', () => {
    const exists = () => true;

    expect(
      resolveCertImage('/certs/../favicon.svg', {
        baseDir,
        fileExists: exists,
      }),
    ).toBeNull();
    expect(
      resolveCertImage('../../package.json', { baseDir, fileExists: exists }),
    ).toBeNull();
  });
});
