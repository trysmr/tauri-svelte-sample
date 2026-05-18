<script lang="ts">
  import type { Node } from "$lib/types";

  let {
    node,
    isSelected,
    editing,
    onMouseDown,
    onDblClick,
    onConnectorMouseDown,
    connectorX,
    connectorY,
    onLabelKeyDown,
    onLabelBlur,
    onLabelInput,
  }: {
    node: Node;
    isSelected: boolean;
    editing: { value: string } | null;
    onMouseDown: (event: MouseEvent) => void;
    onDblClick: (event: MouseEvent) => void;
    onConnectorMouseDown: (event: MouseEvent) => void;
    connectorX: number;
    connectorY: number;
    onLabelKeyDown: (event: KeyboardEvent) => void;
    onLabelBlur: () => void;
    onLabelInput: (value: string) => void;
  } = $props();
</script>

<clipPath id="clip-{node.id}">
  <rect x={node.x - 55} y={node.y - 25} width={110} height={50} />
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
  class:selected={isSelected}
  onmousedown={onMouseDown}
  ondblclick={onDblClick}
/>
<!-- svelte-ignore a11y_no_static_element_interactions -->
<circle
  cx={node.x + connectorX}
  cy={node.y + connectorY}
  r={6}
  class="connector"
  onmousedown={onConnectorMouseDown}
/>
{#if editing}
  <foreignObject x={node.x - 55} y={node.y - 12} width={110} height={24}>
    <!-- svelte-ignore a11y_autofocus -->
    <input
      type="text"
      class="label-input"
      value={editing.value}
      oninput={(e) => onLabelInput(e.currentTarget.value)}
      onkeydown={onLabelKeyDown}
      onblur={onLabelBlur}
      autofocus
    />
  </foreignObject>
{:else if node.label}
  <text x={node.x} y={node.y + 5} class="label" clip-path="url(#clip-{node.id})"
    >{node.label}</text
  >
{/if}

<style>
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
