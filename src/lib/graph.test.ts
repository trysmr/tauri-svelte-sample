import { describe, test, expect } from "vitest";
import { bezierPath, findNodeAtPoint, removeNode, removeEdge } from "./graph";
import type { Node, Edge } from "./types";

describe("bezierPath", () => {
  test("直線的な水平パス", () => {
    const result = bezierPath(0, 100, 200, 100);
    expect(result).toBe("M 0 100 C 100 100, 100 100, 200 100");
  });

  test("制御点がX座標の中間になる", () => {
    const result = bezierPath(100, 0, 300, 200);
    expect(result).toBe("M 100 0 C 200 0, 200 200, 300 200");
  });

  test("右から左への逆方向のパス", () => {
    const result = bezierPath(300, 100, 100, 100);
    expect(result).toBe("M 300 100 C 200 100, 200 100, 100 100");
  });
});

describe("findNodeAtPoint", () => {
  const nodes: Node[] = [
    { id: 0, x: 100, y: 100, label: "A" },
    { id: 1, x: 300, y: 200, label: "B" },
  ];

  test("ノードの中心をクリック", () => {
    const result = findNodeAtPoint(nodes, 100, 100);
    expect(result?.id).toBe(0);
  });

  test("ノードの範囲内（端ギリギリ）", () => {
    const result = findNodeAtPoint(nodes, 159, 124);
    expect(result?.id).toBe(0);
  });

  test("ノードの範囲外", () => {
    const result = findNodeAtPoint(nodes, 200, 200);
    expect(result).toBeUndefined();
  });

  test("excludeIdで自身を除外", () => {
    const result = findNodeAtPoint(nodes, 100, 100, 0);
    expect(result).toBeUndefined();
  });

  test("複数ノードが重なる場合は最初にマッチしたもの", () => {
    const overlapping: Node[] = [
      { id: 0, x: 100, y: 100, label: "A" },
      { id: 1, x: 110, y: 100, label: "B" },
    ];
    const result = findNodeAtPoint(overlapping, 105, 100);
    expect(result?.id).toBe(0);
  });
});

describe("removeNode", () => {
  const nodes: Node[] = [
    { id: 0, x: 0, y: 0, label: "A" },
    { id: 1, x: 100, y: 0, label: "B" },
    { id: 2, x: 200, y: 0, label: "C" },
  ];
  const edges: Edge[] = [
    { from: 0, to: 1 },
    { from: 1, to: 2 },
  ];

  test("ノード削除で接続エッジも連動削除", () => {
    const result = removeNode(nodes, edges, 1);
    expect(result.nodes).toHaveLength(2);
    expect(result.edges).toHaveLength(0);
  });

  test("端のノード削除は関連エッジのみ削除", () => {
    const result = removeNode(nodes, edges, 0);
    expect(result.nodes).toHaveLength(2);
    expect(result.edges).toEqual([{ from: 1, to: 2 }]);
  });
});

describe("removeEdge", () => {
  const edges: Edge[] = [
    { from: 0, to: 1 },
    { from: 1, to: 2 },
  ];

  test("指定indexのエッジを削除", () => {
    const result = removeEdge(edges, 0);
    expect(result).toEqual([{ from: 1, to: 2 }]);
  });

  test("元の配列は変更しない", () => {
    removeEdge(edges, 0);
    expect(edges).toHaveLength(2);
  });
});
