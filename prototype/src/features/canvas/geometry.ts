import type { CanvasNode } from '@/lib/types';

export type AlignmentAxis =
  | 'left'
  | 'hcenter'
  | 'right'
  | 'top'
  | 'vcenter'
  | 'bottom';

export function snapNodePosition({
  moving,
  proposedX,
  proposedY,
  otherNodes,
  zoom,
  grid = 8,
}: {
  moving: CanvasNode;
  proposedX: number;
  proposedY: number;
  otherNodes: CanvasNode[];
  zoom: number;
  grid?: number;
}) {
  const threshold = 7 / zoom;
  const movingXEdges = [
    proposedX,
    proposedX + moving.width / 2,
    proposedX + moving.width,
  ];
  const movingYEdges = [
    proposedY,
    proposedY + moving.height / 2,
    proposedY + moving.height,
  ];
  let bestX = threshold + 1;
  let bestY = threshold + 1;
  let x = proposedX;
  let y = proposedY;
  let guideX: number | undefined;
  let guideY: number | undefined;

  for (const other of otherNodes) {
    if (other.id === moving.id) continue;
    const targetXEdges = [other.x, other.x + other.width / 2, other.x + other.width];
    const targetYEdges = [other.y, other.y + other.height / 2, other.y + other.height];

    for (const sourceX of movingXEdges) {
      for (const targetX of targetXEdges) {
        const delta = targetX - sourceX;
        if (Math.abs(delta) < bestX) {
          bestX = Math.abs(delta);
          x += delta;
          guideX = targetX;
        }
      }
    }
    for (const sourceY of movingYEdges) {
      for (const targetY of targetYEdges) {
        const delta = targetY - sourceY;
        if (Math.abs(delta) < bestY) {
          bestY = Math.abs(delta);
          y += delta;
          guideY = targetY;
        }
      }
    }
  }

  if (bestX > threshold) x = Math.round(x / grid) * grid;
  if (bestY > threshold) y = Math.round(y / grid) * grid;
  return { x, y, guideX, guideY };
}

export function alignNodePositions(
  nodes: CanvasNode[],
  selectedIds: string[],
  axis: AlignmentAxis,
) {
  const selected = nodes.filter((node) => selectedIds.includes(node.id));
  if (selected.length < 2) return new Map<string, Pick<CanvasNode, 'x' | 'y'>>();
  const reference = selected[0];
  return new Map(
    selected.map((node) => {
      if (axis === 'left') return [node.id, { x: reference.x, y: node.y }];
      if (axis === 'right') {
        return [node.id, { x: reference.x + reference.width - node.width, y: node.y }];
      }
      if (axis === 'hcenter') {
        return [
          node.id,
          { x: reference.x + (reference.width - node.width) / 2, y: node.y },
        ];
      }
      if (axis === 'top') return [node.id, { x: node.x, y: reference.y }];
      if (axis === 'bottom') {
        return [node.id, { x: node.x, y: reference.y + reference.height - node.height }];
      }
      return [
        node.id,
        { x: node.x, y: reference.y + (reference.height - node.height) / 2 },
      ];
    }),
  );
}

export function arrangeNodePositions(nodes: CanvasNode[], selectedIds: string[]) {
  const targets =
    selectedIds.length >= 2 ? nodes.filter((node) => selectedIds.includes(node.id)) : nodes;
  if (targets.length < 2) return new Map<string, Pick<CanvasNode, 'x' | 'y'>>();
  const sorted = [...targets].sort((a, b) => a.y - b.y || a.x - b.x);
  const startX = Math.min(...targets.map((node) => node.x));
  const startY = Math.min(...targets.map((node) => node.y));
  const cellWidth = Math.max(...targets.map((node) => node.width)) + 80;
  const cellHeight = Math.max(...targets.map((node) => node.height)) + 100;
  const columns = Math.max(1, Math.ceil(Math.sqrt(sorted.length)));
  return new Map(
    sorted.map((node, index) => [
      node.id,
      {
        x: startX + (index % columns) * cellWidth,
        y: startY + Math.floor(index / columns) * cellHeight,
      },
    ]),
  );
}

