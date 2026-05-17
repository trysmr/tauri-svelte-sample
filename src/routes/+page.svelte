<script lang="ts">
  import { invoke } from "@tauri-apps/api/core";
  import { save, open } from "@tauri-apps/plugin-dialog";
  import { bezierPath } from "../lib/graph";

  type Node = {
    id: number;
    x: number;
    y: number;
    label: string;
  };

  type Edge = {
    from: number;
    to: number;
  };

  type Selection =
    | { type: "node"; id: number }
    | { type: "edge"; index: number }
    | null;

  let nodes: Node[] = $state([]);
  let edges: Edge[] = $state([]);
  let nextId = $state(0);
  let dragging: { node: Node; offsetX: number; offsetY: number } | null = $state(null);
  let connecting: { fromId: number; mouseX: number; mouseY: number} | null = $state(null);
  let wasDragging = $state(false);
  let wasConnecting = $state(false);
  let editing: { node: Node, value: string } | null = $state(null);
  let selected: Selection = $state(null);

  function toSvgPoint(event: MouseEvent, svg: SVGSVGElement) {
    const point = svg.createSVGPoint();
    point.x = event.clientX;
    point.y = event.clientY;
    return point.matrixTransform(svg.getScreenCTM()!.inverse());
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
      const target = nodes.find((n) =>
        n.id !== connecting!.fromId &&
          Math.abs(n.x - svgPoint.x) < 60 &&
          Math.abs(n.y - svgPoint.y) < 25
      );
      if (target) {
        edges.push({ from: connecting.fromId, to: target.id });
      }
      wasConnecting = true
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
    }
    else if (event.key === "Escape") {
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
    }
    else if (selected.type === "edge") {
      const index = selected.index
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
    }
    else if (event.key === "Escape") {
      editing = null;
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
      const graph: { nodes: Node[]; edges: Edge[] } = await invoke("load_graph", { path });
      nodes = graph.nodes;
      edges = graph.edges;
      nextId = Math.max(0, ...nodes.map((n) => n.id)) + 1;
    }
  }

  function getNode(id: number): Node | undefined {
    return nodes.find((n) => n.id === id);
  }
</script>

<div class="toolbar">
  <button onclick={saveGraph}>Save</button>
  <button onclick={loadGraph}>Load</button>
</div>

<!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
<!-- svelte-ignore a11y_no_noninteractive_tabindex -->
<svg
  class="canvas"
  role="application"
  tabindex="0"
  onclick={handleCanvasClick}
  onkeydown={handleKeyDown}
  onmousemove={handleMouseMove}
  onmouseup={handleMouseUp}
>

  {#each edges as edge, i}
    {@const from = getNode(edge.from)}
    {@const to = getNode(edge.to)}
    {#if from && to}
      <!-- svelte-ignore a11y_click_events_have_key_events -->
      <!-- svelte-ignore a11y_no_static_element_interactions -->
      <path
        d={bezierPath(from.x + 60, from.y, to.x - 60, to.y)}
        class="edge-hit"
        onclick={(e) => handleEdgeClick(e, i)}
      />
      <path
        d={bezierPath(from.x + 60, from.y, to.x - 60, to.y)}
        class="edge"
        class:selected={selected?.type === "edge" && selected.index === i}
        pointer-events="none"
      />
    {/if}
  {/each}

  {#if connecting}
    {@const from = getNode(connecting.fromId)}
    {#if from}
      <path
        d={bezierPath(from.x + 60, from.y, connecting.mouseX, connecting.mouseY)}
        class="edge connecting"
      />
    {/if}
  {/if}

  {#each nodes as node (node.id)}
    <clipPath id="clip-{node.id}">
      <rect
        x={node.x - 55}
        y={node.y - 25}
        width={110}
        height={50}
      />
    </clipPath>
    <!-- svelte-ignore a11y_no_static_element_interactions -->
    <rect
      x={node.x - 60}
      y={node.y - 25}
      width={120}
      height={50}
      rx={8}
      ry={8}
      class="node"
      class:selected={selected?.type === "node" && selected.id === node.id}
      onmousedown={(e) => handleNodeMouseDown(e, node)}
      ondblclick={(e) => handleNodeDblClick(e, node)}
    />
    <!-- svelte-ignore a11y_no_static_element_interactions -->
    <circle
      cx={node.x + 60}
      cy={node.y}
      r={6}
      class="connector"
      onmousedown={(e) => handleConnectorMouseDown(e, node)}
    />
    {#if editing?.node.id === node.id}
      <foreignObject
        x={node.x - 55}
        y={node.y - 12}
        width={110}
        height={24}
      >
        <!-- svelte-ignore a11y_autofocus -->
        <input
          type="text"
          class="label-input"
          bind:value={editing.value}
          onkeydown={handleLabelKeyDown}
          onblur={commitLabel}
          autofocus
        />
      </foreignObject>
    {:else if node.label}
      <text
        x={node.x}
        y={node.y + 5}
        class="label"
        clip-path="url(#clip-{node.id})"
      >{node.label}</text>
    {/if}
  {/each}
</svg>

<style>
  :global(body) {
    margin: 0;
    overflow: hidden;
  }

  .toolbar {
    position: fixed;
    top: 12px;
    right: 12px;
    display: flex;
    gap: 8px;
    z-index: 10;
  }

  .toolbar button {
    padding: 6px 14px;
    border: 1px solid #bcc0cc;
    border-radius: 6px;
    background: #ffffff;
    color: #4c4f69;
    font-size: 13px;
    cursor: pointer;
  }

  .toolbar button:hover {
    border-color: #1e66f5;
    color: #1e66f5;
  }

  .canvas {
    width: 100vw;
    height: 100vh;
    background-color: #eff1f5;
    outline: none;
  }

  .node {
    fill: #ffffff;
    stroke: #bcc0cc;
    stroke-width: 1.5;
    cursor: grab;
  }

  .node:hover {
    stroke: #1e66f5;
  }

  .node.selected {
    stroke: #1e66f5;
    stroke-width: 2;
  }

  .connector {
    fill: #bcc0cc;
    stroke: #1e66f5;
    stroke-width: 1.5;
    cursor: crosshair;
  }

  .connector:hover {
    fill: #1e66f5;
  }

  .edge-hit {
    fill: none;
    stroke: transparent;
    stroke-width: 12;
    cursor: pointer;
  }

  .edge {
    fill: none;
    stroke: #9ca0b0;
    stroke-width: 1.5;
  }

  .edge.selected {
    stroke: #1e66f5;
    stroke-width: 2.5;
  }

  .edge.connecting {
    stroke: #1e66f5;
    stroke-dasharray: 5 3;
  }

  .label {
    fill: #4c4f69;
    font-size: 12px;
    text-anchor: middle;
    pointer-events: none;
    user-select: none;
  }

  .label-input {
    width: 100%;
    height: 100%;
    border: 1px solid #1e66f5;
    border-radius: 4px;
    background: #ffffff;
    color: #4c4f69;
    font-size: 12px;
    text-align: center;
    outline: none;
    padding: 0 4px;
    box-sizing: border-box;
  }
</style>
