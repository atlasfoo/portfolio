import type {
  ArchitectureConnection,
  ArchitectureNode,
} from '../../content/homepage';
import { DEFAULT_ARCHITECTURE_NODE_ID } from '../../content/homepage';

const LINE_ON = { stroke: 'rgba(91,140,255,0.95)', width: 2 } as const;
const LINE_OFF = { stroke: 'rgba(120,140,200,0.22)', width: 1.1 } as const;

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
