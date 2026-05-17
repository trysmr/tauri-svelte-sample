export type Node = {
  id: number;
  x: number;
  y: number;
  label: string;
};

export type Edge = {
  from: number;
  to: number;
};

export type Selection =
  | { type: "node"; id: number }
  | { type: "edge"; index: number }
  | null;
