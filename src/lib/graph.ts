import type { Node, Edge, EdgeStyle } from "$lib/types";

export function findNodeAtPoint(
  nodes: Node[],
  x: number,
  y: number,
  excludeId?: number,
): Node | undefined {
  return nodes.find(
    (n) =>
      (excludeId === undefined || n.id !== excludeId) &&
      Math.abs(n.x - x) < 60 &&
      Math.abs(n.y - y) < 25,
  );
}

export function removeNode(
  nodes: Node[],
  edges: Edge[],
  id: number,
): { nodes: Node[]; edges: Edge[] } {
  return {
    nodes: nodes.filter((n) => n.id !== id),
    edges: edges.filter((e) => e.from !== id && e.to !== id),
  };
}

export function removeEdge(edges: Edge[], index: number): Edge[] {
  return edges.filter((_, i) => i !== index);
}

export function bezierHorizontal(
  x1: number,
  y1: number,
  x2: number,
  y2: number,
): string {
  const cx = (x1 + x2) / 2;
  return `M ${x1} ${y1} C ${cx} ${y1}, ${cx} ${y2}, ${x2} ${y2}`;
}

export function bezierVertical(
  x1: number,
  y1: number,
  x2: number,
  y2: number,
): string {
  const cy = (y1 + y2) / 2;
  return `M ${x1} ${y1} C ${x1} ${cy}, ${x2} ${cy}, ${x2} ${y2}`;
}

export function orthogonalHorizontal(
  x1: number,
  y1: number,
  x2: number,
  y2: number,
): string {
  const midX = (x1 + x2) / 2;
  return `M ${x1} ${y1} H ${midX} V ${y2} H ${x2}`;
}

export function orthogonalVertical(
  x1: number,
  y1: number,
  x2: number,
  y2: number,
): string {
  const midY = (y1 + y2) / 2;
  return `M ${x1} ${y1} V ${midY} H ${x2} V ${y2}`;
}

export function straight(
  x1: number,
  y1: number,
  x2: number,
  y2: number,
): string {
  return `M ${x1} ${y1} L ${x2} ${y2}`;
}

export function stepHorizontalFirst(
  x1: number,
  y1: number,
  x2: number,
  y2: number,
): string {
  return `M ${x1} ${y1} H ${x2} V ${y2}`;
}

export function stepVerticalFirst(
  x1: number,
  y1: number,
  x2: number,
  y2: number,
): string {
  return `M ${x1} ${y1} V ${y2} H ${x2}`;
}

export type PathFn = (x1: number, y1: number, x2: number, y2: number) => string;

export const pathFunctions: Record<EdgeStyle, PathFn> = {
  "bezier-horizontal": bezierHorizontal,
  "bezier-vertical": bezierVertical,
  "orthogonal-horizontal": orthogonalHorizontal,
  "orthogonal-vertical": orthogonalVertical,
  straight: straight,
  "step-horizontal": stepHorizontalFirst,
  "step-vertical": stepVerticalFirst,
};

export type ConnectionOffsets = {
  connectorX: number;
  connectorY: number;
  sourceX: number;
  sourceY: number;
  targetX: number;
  targetY: number;
};

export const connectionOffsets: Record<EdgeStyle, ConnectionOffsets> = {
  "bezier-horizontal": {
    connectorX: 60,
    connectorY: 0,
    sourceX: 60,
    sourceY: 0,
    targetX: -60,
    targetY: 0,
  },
  "bezier-vertical": {
    connectorX: 0,
    connectorY: 25,
    sourceX: 0,
    sourceY: 25,
    targetX: 0,
    targetY: -25,
  },
  "orthogonal-horizontal": {
    connectorX: 60,
    connectorY: 0,
    sourceX: 60,
    sourceY: 0,
    targetX: -60,
    targetY: 0,
  },
  "orthogonal-vertical": {
    connectorX: 0,
    connectorY: 25,
    sourceX: 0,
    sourceY: 25,
    targetX: 0,
    targetY: -25,
  },
  straight: {
    connectorX: 0,
    connectorY: 0,
    sourceX: 0,
    sourceY: 0,
    targetX: 0,
    targetY: 0,
  },
  "step-horizontal": {
    connectorX: 60,
    connectorY: 0,
    sourceX: 60,
    sourceY: 0,
    targetX: -60,
    targetY: 0,
  },
  "step-vertical": {
    connectorX: 0,
    connectorY: 25,
    sourceX: 0,
    sourceY: 25,
    targetX: 0,
    targetY: -25,
  },
};

export function toSvgPoint(event: MouseEvent, svg: SVGSVGElement) {
  const point = svg.createSVGPoint();
  point.x = event.clientX;
  point.y = event.clientY;
  return point.matrixTransform(svg.getScreenCTM()!.inverse());
}
