import { describe, test, expect } from "vitest";
import { bezierPath } from "./graph";

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
})
