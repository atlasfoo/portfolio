import { describe, expect, test } from 'vitest';
import {
  ARCHITECTURE_CONNECTIONS,
  ARCHITECTURE_NODES,
  DEFAULT_ARCHITECTURE_NODE_ID,
} from '../../content/homepage';
import { lineState, resolveActiveNode } from './architecture-diagram';

/**
 * Failing-first tests for `architecture-diagram.ts` (implemented in T-035).
 *
 * `resolveActiveNode` and `lineState` port the mock's `renderVals()`
 * connection-highlighting logic (design-import/Portafolio Jerry Mejia.dc.html)
 * and back HOME-004's "detail panel never blank" requirement.
 */

describe('resolveActiveNode', () => {
  test('returns the node matching a valid activeId', () => {
    const node = resolveActiveNode(ARCHITECTURE_NODES, 'pagos');
    expect(node?.id).toBe('pagos');
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
  test('highlights connections touching the active node (as the "from" endpoint)', () => {
    const states = lineState(ARCHITECTURE_CONNECTIONS, 'gw');
    const touching = states.filter(
      (_: unknown, i: number) =>
        ARCHITECTURE_CONNECTIONS[i][0] === 'gw' ||
        ARCHITECTURE_CONNECTIONS[i][1] === 'gw',
    );
    expect(touching.length).toBeGreaterThan(0);
    for (const state of touching) {
      expect(state.stroke).toBe('rgba(91,140,255,0.95)');
      expect(state.width).toBe(2);
    }
  });

  test('dims connections that do not touch the active node', () => {
    const states = lineState(ARCHITECTURE_CONNECTIONS, 'gw');
    const notTouching = states.filter(
      (_: unknown, i: number) =>
        ARCHITECTURE_CONNECTIONS[i][0] !== 'gw' &&
        ARCHITECTURE_CONNECTIONS[i][1] !== 'gw',
    );
    expect(notTouching.length).toBeGreaterThan(0);
    for (const state of notTouching) {
      expect(state.stroke).toBe('rgba(120,140,200,0.22)');
      expect(state.width).toBe(1.1);
    }
  });

  test('a connection with neither endpoint active is dimmed', () => {
    const [states] = lineState([['pagos', 'bus']], 'tarjetas');
    expect(states).toEqual({ stroke: 'rgba(120,140,200,0.22)', width: 1.1 });
  });

  test('a connection is highlighted when the active node is either endpoint', () => {
    const [fromActive] = lineState([['tarjetas', 'pg']], 'tarjetas');
    const [toActive] = lineState([['pg', 'tarjetas']], 'tarjetas');
    expect(fromActive).toEqual({ stroke: 'rgba(91,140,255,0.95)', width: 2 });
    expect(toActive).toEqual({ stroke: 'rgba(91,140,255,0.95)', width: 2 });
  });
});
