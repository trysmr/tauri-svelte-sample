import type { Node, Edge } from "$lib/types";

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

export function bezierPath(
  x1: number,
  y1: number,
  x2: number,
  y2: number,
): string {
  const cx = (x1 + x2) / 2;
  return `M ${x1} ${y1} C ${cx} ${y1}, ${cx} ${y2}, ${x2} ${y2}`;
}

export function toSvgPoint(event: MouseEvent, svg: SVGSVGElement) {
  const point = svg.createSVGPoint();
  point.x = event.clientX;
  point.y = event.clientY;
  return point.matrixTransform(svg.getScreenCTM()!.inverse());
}
