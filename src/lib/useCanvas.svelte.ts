import { invoke } from "@tauri-apps/api/core";
import { save, open } from "@tauri-apps/plugin-dialog";
import { toSvgPoint } from "$lib/graph";
import type { Node, Edge, Selection } from "$lib/types";

export function useCanvas() {
  let nodes: Node[] = $state([]);
  let edges: Edge[] = $state([]);
  let nextId = $state(0);
  let dragging: { node: Node; offsetX: number; offsetY: number } | null =
    $state(null);
  let connecting: { fromId: number; mouseX: number; mouseY: number } | null =
    $state(null);
  let wasDragging = $state(false);
  let wasConnecting = $state(false);
  let editing: { node: Node; value: string } | null = $state(null);
  let selected: Selection = $state(null);

  function getNode(id: number): Node | undefined {
    return nodes.find((n) => n.id === id);
  }

  function handleCanvasClick(event: MouseEvent) {
    if (wasDragging || wasConnecting) {
      wasDragging = false;
      wasConnecting = false;
      return;
    }
    selected = null;
    editing = null;

    const svg = event.currentTarget as SVGSVGElement;
    const svgPoint = toSvgPoint(event, svg);

    nodes.push({
      id: nextId++,
      x: svgPoint.x,
      y: svgPoint.y,
      label: "",
    });
  }

  function handleNodeMouseDown(event: MouseEvent, node: Node) {
    event.stopPropagation();

    selected = { type: "node", id: node.id };

    const svg = (event.currentTarget as SVGElement).ownerSVGElement!;
    const svgPoint = toSvgPoint(event, svg);

    dragging = {
      node: node,
      offsetX: svgPoint.x - node.x,
      offsetY: svgPoint.y - node.y,
    };
  }

  function handleConnectorMouseDown(event: MouseEvent, node: Node) {
    event.stopPropagation();

    const svg = (event.currentTarget as SVGElement).ownerSVGElement!;
    const svgPoint = toSvgPoint(event, svg);

    connecting = {
      fromId: node.id,
      mouseX: svgPoint.x,
      mouseY: svgPoint.y,
    };
  }

  function handleEdgeClick(event: MouseEvent, index: number) {
    event.stopPropagation();

    selected = { type: "edge", index: index };
  }

  function handleMouseMove(event: MouseEvent) {
    const svg = event.currentTarget as SVGSVGElement;
    const svgPoint = toSvgPoint(event, svg);

    if (dragging) {
      dragging.node.x = svgPoint.x - dragging.offsetX;
      dragging.node.y = svgPoint.y - dragging.offsetY;
    }

    if (connecting) {
      connecting.mouseX = svgPoint.x;
      connecting.mouseY = svgPoint.y;
    }
  }

  function handleMouseUp(event: MouseEvent) {
    if (dragging) {
      wasDragging = true;
      dragging = null;
    }

    if (connecting) {
      const svg = event.currentTarget as SVGSVGElement;
      const svgPoint = toSvgPoint(event, svg);
      const target = nodes.find(
        (n) =>
          n.id !== connecting!.fromId &&
          Math.abs(n.x - svgPoint.x) < 60 &&
          Math.abs(n.y - svgPoint.y) < 25,
      );
      if (target) {
        edges.push({ from: connecting.fromId, to: target.id });
      }
      wasConnecting = true;
      connecting = null;
    }
  }

  function handleKeyDown(event: KeyboardEvent) {
    if (editing) {
      return;
    }

    if (event.key === "Backspace" || event.key === "Delete") {
      event.preventDefault();
      deleteSelected();
    } else if (event.key === "Escape") {
      selected = null;
    }
  }

  function deleteSelected() {
    if (!selected) {
      return;
    }

    if (selected.type === "node") {
      const id = selected.id;
      edges = edges.filter((e) => e.from !== id && e.to !== id);
      nodes = nodes.filter((n) => n.id !== id);
    } else if (selected.type === "edge") {
      const index = selected.index;
      edges = edges.filter((_, i) => i !== index);
    }
    selected = null;
  }

  function handleNodeDblClick(event: MouseEvent, node: Node) {
    event.stopPropagation();

    editing = { node: node, value: node.label };
    requestAnimationFrame(() => {
      const input = document.querySelector<HTMLInputElement>(".label-input");
      if (input) {
        input.focus();
      }
    });
  }

  async function commitLabel() {
    if (!editing) {
      return;
    }

    const target = editing.node;
    const value = editing.value;
    editing = null;
    const formatted: string = await invoke("format_label", { input: value });
    target.label = formatted;
  }

  function handleLabelKeyDown(event: KeyboardEvent) {
    if (event.key === "Enter" && event.keyCode !== 229) {
      commitLabel();
    } else if (event.key === "Escape") {
      editing = null;
    }
  }

  function updateEditingValue(value: string) {
    if (editing) {
      editing.value = value;
    }
  }

  async function saveGraph() {
    const path = await save({
      filters: [{ name: "JSON", extensions: ["json"] }],
    });
    if (path) {
      await invoke("save_graph", {
        path,
        graph: { nodes, edges },
      });
    }
  }

  async function loadGraph() {
    const path = await open({
      filters: [{ name: "JSON", extensions: ["json"] }],
    });
    if (path) {
      const graph: { nodes: Node[]; edges: Edge[] } = await invoke(
        "load_graph",
        { path },
      );
      nodes = graph.nodes;
      edges = graph.edges;
      nextId = Math.max(0, ...nodes.map((n) => n.id)) + 1;
    }
  }

  return {
    get nodes() {
      return nodes;
    },
    get edges() {
      return edges;
    },
    get connecting() {
      return connecting;
    },
    get editing() {
      return editing;
    },
    get selected() {
      return selected;
    },
    getNode,
    handleCanvasClick,
    handleNodeMouseDown,
    handleConnectorMouseDown,
    handleEdgeClick,
    handleMouseMove,
    handleMouseUp,
    handleKeyDown,
    handleNodeDblClick,
    commitLabel,
    handleLabelKeyDown,
    updateEditingValue,
    saveGraph,
    loadGraph,
  };
}
