import { execFileSync } from 'node:child_process';
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, describe, expect, it } from 'vitest';

const workflow = readFileSync(
  new URL('../.github/workflows/release.yml', import.meta.url),
  'utf8',
);

function stepScript(name: string) {
  const step = workflow
    .split(`      - name: ${name}\n`)[1]
    ?.split('\n      - name:')[0];
  const script = step?.split('        run: |\n')[1];
  if (!script) throw new Error(`Missing workflow script: ${name}`);
  return script.replace(/^ {10}/gm, '');
}

const directories: string[] = [];

afterEach(() => {
  for (const directory of directories.splice(0)) {
    rmSync(directory, { recursive: true, force: true });
  }
});

function repository() {
  const cwd = mkdtempSync(join(tmpdir(), 'portfolio-release-'));
  directories.push(cwd);
  const git = (...args: string[]) =>
    execFileSync('git', args, { cwd, encoding: 'utf8' }).trim();
  git('init', '--quiet');
  git('config', 'user.name', 'Release Test');
  git('config', 'user.email', 'release@example.test');
  const commit = (message: string) =>
    git(
      '-c',
      'core.hooksPath=/dev/null',
      'commit',
      '--allow-empty',
      '-m',
      message,
    );
  commit('feat: initial site');
  git('tag', 'v1.0.0');
  return { cwd, git, commit };
}

function runStep(cwd: string, name: string, env: Record<string, string> = {}) {
  const output = join(cwd, `output-${name.replaceAll(' ', '-')}`);
  writeFileSync(output, '');
  execFileSync('bash', ['-e', '-o', 'pipefail', '-c', stepScript(name)], {
    cwd,
    env: { ...process.env, ...env, GITHUB_OUTPUT: output },
  });
  return readFileSync(output, 'utf8').trim();
}

describe('release workflow with real Git history', () => {
  it('skips maintenance commits and reports no release successfully', () => {
    const { cwd, commit } = repository();
    for (const message of [
      'chore(infra): use environment token',
      'docs: update runbook',
      'ci: adjust pipeline',
    ])
      commit(message);
    expect(runStep(cwd, 'Check for releasable commits')).toBe('needed=false');
    expect(
      runStep(cwd, 'Check whether a release was created', {
        RELEASE_NEEDED: 'false',
        PRE_BUMP_SHA: '',
      }),
    ).toBe('released=false');
  });

  it.each([
    'feat(site): add portfolio',
    'fix(site): repair link',
    'chore(infra)!: change provisioning contract',
    'refactor: revise config\n\nBREAKING CHANGE: remove old config',
    'refactor: revise config\n\nBREAKING-CHANGE: remove old config',
  ])('allows a release for %s', (message) => {
    const { cwd, commit } = repository();
    commit(message);
    expect(runStep(cwd, 'Check for releasable commits')).toBe('needed=true');
  });

  it('includes unreleased fixes preceding a maintenance commit', () => {
    const { cwd, commit } = repository();
    commit('fix: repair link');
    commit('docs: update runbook');
    expect(runStep(cwd, 'Check for releasable commits')).toBe('needed=true');
  });

  it('keeps changes from prereleases in the release window', () => {
    const { cwd, git, commit } = repository();
    commit('feat: add portfolio');
    git('tag', 'v1.1.0-beta.1');
    commit('chore: update tooling');
    expect(runStep(cwd, 'Check for releasable commits')).toBe('needed=true');
  });

  it('handles a repository without a release tag', () => {
    const { cwd, git } = repository();
    git('tag', '-d', 'v1.0.0');
    expect(runStep(cwd, 'Check for releasable commits')).toBe('needed=true');
  });

  it('reports a release only when the bump creates a commit', () => {
    const { cwd, git, commit } = repository();
    const before = git('rev-parse', 'HEAD');
    expect(
      runStep(cwd, 'Check whether a release was created', {
        RELEASE_NEEDED: 'true',
        PRE_BUMP_SHA: before,
      }),
    ).toBe('released=false');
    commit('chore(release): 1.1.0');
    expect(
      runStep(cwd, 'Check whether a release was created', {
        RELEASE_NEEDED: 'true',
        PRE_BUMP_SHA: before,
      }),
    ).toBe('released=true');
  });
});
