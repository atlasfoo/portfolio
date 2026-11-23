import type {
  ArchitectureConnection,
  ArchitectureNode,
} from '../../content/homepage';
import { DEFAULT_ARCHITECTURE_NODE_ID } from '../../content/homepage';

const LINE_ON = { stroke: 'rgba(91,140,255,0.95)', width: 2 } as const;
const LINE_OFF = { stroke: 'rgba(120,140,200,0.22)', width: 1.1 } as const;

const REDUCED_MOTION_QUERY = '(prefers-reduced-motion: reduce)';

/** Center plus size, in the stage SVG's coordinate space. */
export interface StageBox {
  x: number;
  y: number;
  w: number;
  h: number;
}

/**
 * Resolves the node to show in the detail panel. Falls back to the default
 * node (`DEFAULT_ARCHITECTURE_NODE_ID`) whenever `activeId` is falsy or
 * doesn't match any node, so the panel is never blank.
 */
export function resolveActiveNode(
  nodes: readonly ArchitectureNode[],
  activeId: string | undefined,
): ArchitectureNode | undefined {
  const match = activeId
    ? nodes.find((node) => node.id === activeId)
    : undefined;
  return (
    match ?? nodes.find((node) => node.id === DEFAULT_ARCHITECTURE_NODE_ID)
  );
}

/**
 * Ports the mock's `renderVals()` connection-highlighting logic: a
 * connection is "on" when either endpoint is the active node.
 */
export function lineState(
  connections: readonly ArchitectureConnection[],
  activeId: string,
): { stroke: string; width: number }[] {
  return connections.map(([from, to]) =>
    from === activeId || to === activeId ? LINE_ON : LINE_OFF,
  );
}

/**
 * HOME-012 gate. The caller injects `matchMedia` so the island can skip
 * `animate` without reading `window` inside this module.
 */
export function shouldAnimateStage(
  matchMedia: (query: string) => { matches: boolean },
): boolean {
  return !matchMedia(REDUCED_MOTION_QUERY).matches;
}

function edgePoint(
  rect: StageBox,
  toward: StageBox,
  gap = 8,
): { x: number; y: number } {
  const dx = toward.x - rect.x;
  const dy = toward.y - rect.y;
  const len = Math.hypot(dx, dy) || 1;
  const sx = dx === 0 ? Number.POSITIVE_INFINITY : rect.w / 2 / Math.abs(dx);
  const sy = dy === 0 ? Number.POSITIVE_INFINITY : rect.h / 2 / Math.abs(dy);
  const scale = Math.min(1, sx, sy);
  return {
    x: rect.x + dx * scale + (dx / len) * gap,
    y: rect.y + dy * scale + (dy / len) * gap,
  };
}

export interface StageLinkOptions {
  hub?: boolean;
  fromId?: string;
  toId?: string;
  core?: StageBox;
}

/**
 * Link path between node edges. Desktop columns use a cubic S-curve; the
 * mobile radial hub bows non-core links away from the central `negocio` node.
 */
export function stageLinkPath(
  from: StageBox,
  to: StageBox,
  options?: StageLinkOptions,
): string {
  const start = edgePoint(from, to);
  const end = edgePoint(to, from);
  if (
    options?.hub &&
    options.core &&
    options.fromId !== 'negocio' &&
    options.toId !== 'negocio'
  ) {
    const mx = (start.x + end.x) / 2;
    const my = (start.y + end.y) / 2;
    const vx = end.x - start.x;
    const vy = end.y - start.y;
    const vlen = Math.hypot(vx, vy) || 1;
    let px = -vy / vlen;
    let py = vx / vlen;
    if ((mx + px - options.core.x) * px + (my + py - options.core.y) * py < 0) {
      px = -px;
      py = -py;
    }
    return `M ${start.x} ${start.y} Q ${mx + px * 56} ${my + py * 56} ${end.x} ${end.y}`;
  }
  const dx = end.x - start.x;
  const dy = end.y - start.y;
  if (Math.abs(dx) >= Math.abs(dy)) {
    const mid = start.x + dx * 0.5;
    return (
      `M ${start.x} ${start.y} C ${mid} ${start.y}, ` +
      `${mid} ${end.y}, ${end.x} ${end.y}`
    );
  }
  const mid = start.y + dy * 0.5;
  return (
    `M ${start.x} ${start.y} C ${start.x} ${mid}, ` +
    `${end.x} ${mid}, ${end.x} ${end.y}`
  );
}
