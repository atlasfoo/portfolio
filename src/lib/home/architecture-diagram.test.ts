import { describe, expect, test } from 'vitest';
import {
  ARCHITECTURE_CONNECTIONS,
  ARCHITECTURE_NODES,
  DEFAULT_ARCHITECTURE_NODE_ID,
} from '../../content/homepage';
import {
  lineState,
  resolveActiveNode,
  stageLinkPath,
} from './architecture-diagram';

/**
 * `resolveActiveNode` keeps the detail panel from going blank.
 * `lineState` marks which connections touch the active node — not the old
 * SVG stroke paint.
 * `shouldAnimateStage` (not exported yet) is the HOME-012 gate: stage motion
 * runs only when reduced-motion is off.
 */

type MatchMediaFn = (query: string) => { matches: boolean };

const REDUCED_MOTION = '(prefers-reduced-motion: reduce)';

async function loadShouldAnimateStage(): Promise<
  ((matchMedia: MatchMediaFn) => boolean) | undefined
> {
  const mod = (await import('./architecture-diagram')) as {
    shouldAnimateStage?: (matchMedia: MatchMediaFn) => boolean;
  };
  return mod.shouldAnimateStage;
}

describe('resolveActiveNode', () => {
  test('returns the node matching a valid activeId', () => {
    const node = resolveActiveNode(ARCHITECTURE_NODES, 'a');
    expect(node?.id).toBe('a');
  });

  test('falls back to the default node when activeId is undefined', () => {
    const node = resolveActiveNode(ARCHITECTURE_NODES, undefined);
    expect(node?.id).toBe(DEFAULT_ARCHITECTURE_NODE_ID);
  });

  test('falls back to the default node when activeId is an empty string', () => {
    const node = resolveActiveNode(ARCHITECTURE_NODES, '');
    expect(node?.id).toBe(DEFAULT_ARCHITECTURE_NODE_ID);
  });

  test('falls back to the default node when activeId matches no node', () => {
    const node = resolveActiveNode(ARCHITECTURE_NODES, 'not-a-real-id');
    expect(node?.id).toBe(DEFAULT_ARCHITECTURE_NODE_ID);
  });
});

describe('lineState', () => {
  test('distinguishes connections that touch the active node from ones that do not', () => {
    const states = lineState(ARCHITECTURE_CONNECTIONS, 'a');
    const touching = states.filter(
      (_: unknown, i: number) =>
        ARCHITECTURE_CONNECTIONS[i][0] === 'a' ||
        ARCHITECTURE_CONNECTIONS[i][1] === 'a',
    );
    const resting = states.filter(
      (_: unknown, i: number) =>
        ARCHITECTURE_CONNECTIONS[i][0] !== 'a' &&
        ARCHITECTURE_CONNECTIONS[i][1] !== 'a',
    );
    expect(touching.length).toBeGreaterThan(0);
    expect(resting.length).toBeGreaterThan(0);
    for (const state of touching) {
      expect(state).toEqual(touching[0]);
      expect(state).not.toEqual(resting[0]);
    }
    // Old SVG paint used fixed rgba strokes. Line state must not carry a
    // dark-only panel fill the light theme cannot override.
    expect(JSON.stringify(states)).not.toMatch(/#06080d|#0c101a/i);
  });

  test('a connection with neither endpoint active is not highlighted', () => {
    const [resting] = lineState([['u', 'a']], 'negocio');
    const [touching] = lineState([['u', 'a']], 'a');
    expect(resting).not.toEqual(touching);
  });

  test('a connection is highlighted when the active node is either endpoint', () => {
    const [fromActive] = lineState([['negocio', 'dependencias']], 'negocio');
    const [toActive] = lineState([['dependencias', 'negocio']], 'negocio');
    expect(fromActive).toEqual(toActive);
  });
});

describe('shouldAnimateStage', () => {
  test('is not exported yet — returns false when reduced-motion matches', async () => {
    const shouldAnimateStage = await loadShouldAnimateStage();
    if (typeof shouldAnimateStage !== 'function') {
      expect.fail('shouldAnimateStage is not exported');
    }

    let queried = '';
    const matchMedia: MatchMediaFn = (query) => {
      queried = query;
      return { matches: query === REDUCED_MOTION };
    };

    expect(shouldAnimateStage(matchMedia)).toBe(false);
    expect(queried).toBe(REDUCED_MOTION);
  });

  test('returns true when reduced-motion is off so the stage may animate', async () => {
    const shouldAnimateStage = await loadShouldAnimateStage();
    if (typeof shouldAnimateStage !== 'function') {
      expect.fail('shouldAnimateStage is not exported');
    }

    expect(shouldAnimateStage(() => ({ matches: false }))).toBe(true);
  });
});

describe('stageLinkPath', () => {
  const core = { x: 150, y: 150, w: 80, h: 44 };
  const top = { x: 150, y: 24, w: 80, h: 44 };
  const right = { x: 250, y: 80, w: 80, h: 44 };
  const bottom = { x: 150, y: 276, w: 80, h: 44 };

  test('uses a cubic curve when not in hub mode or when touching negocio', () => {
    const desktop = stageLinkPath(top, bottom);
    expect(desktop).toContain(' C ');

    const toCore = stageLinkPath(top, core, {
      hub: true,
      fromId: 'u',
      toId: 'negocio',
      core,
    });
    expect(toCore).toContain(' C ');
  });

  test('in hub mode, non-core links bow away from the central negocio node', () => {
    const path = stageLinkPath(right, bottom, {
      hub: true,
      fromId: 'e',
      toId: 'a',
      core,
    });
    const match = path.match(/^M [\d.-]+ [\d.-]+ Q ([\d.-]+) ([\d.-]+) /);
    expect(match).not.toBeNull();
    const ctrlX = Number(match?.[1]);
    const ctrlY = Number(match?.[2]);
    // Midpoint between (250,80) and (150,276) is ~(200,178); bowing away
    // from core=(150,150) pushes the control point farther to the right/down.
    const distCtrl = Math.hypot(ctrlX - core.x, ctrlY - core.y);
    const distMid = Math.hypot(200 - core.x, 178 - core.y);
    expect(distCtrl).toBeGreaterThan(distMid);
  });
});
