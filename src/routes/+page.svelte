<script lang="ts">
  import { useCanvas } from "$lib/useCanvas.svelte";
  import Toolbar from "$lib/components/Toolbar.svelte";
  import NodeView from "$lib/components/NodeView.svelte";
  import EdgeView from "$lib/components/EdgeView.svelte";
  import { pathFunctions, connectionOffsets } from "$lib/graph";

  const canvas = useCanvas();
</script>

<Toolbar
  onSave={canvas.saveGraph}
  onLoad={canvas.loadGraph}
  edgeStyle={canvas.edgeStyle}
  onEdgeStyleChange={(style) => (canvas.edgeStyle = style)}
/>

<!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
<!-- svelte-ignore a11y_no_noninteractive_tabindex -->
<svg
  class="canvas"
  role="application"
  tabindex="0"
  onclick={canvas.handleCanvasClick}
  onkeydown={canvas.handleKeyDown}
  onmousemove={canvas.handleMouseMove}
  onmouseup={canvas.handleMouseUp}
>
  {#each canvas.edges as edge, i (i)}
    {@const from = canvas.getNode(edge.from)}
    {@const to = canvas.getNode(edge.to)}
    {@const offsets = connectionOffsets[canvas.edgeStyle]}
    {#if from && to}
      <EdgeView
        x1={from.x + offsets.sourceX}
        y1={from.y + offsets.sourceY}
        x2={to.x + offsets.targetX}
        y2={to.y + offsets.targetY}
        pathFn={pathFunctions[canvas.edgeStyle]}
        isSelected={canvas.selected?.type === "edge" &&
          canvas.selected.index === i}
        onClick={(e) => {
          e.stopPropagation();
          canvas.handleEdgeClick(e, i);
        }}
      />
    {/if}
  {/each}

  {#if canvas.connecting}
    {@const from = canvas.getNode(canvas.connecting.fromId)}
    {@const offsets = connectionOffsets[canvas.edgeStyle]}
    {#if from}
      <EdgeView
        x1={from.x + offsets.sourceX}
        y1={from.y + offsets.sourceY}
        x2={canvas.connecting.mouseX}
        y2={canvas.connecting.mouseY}
        pathFn={pathFunctions[canvas.edgeStyle]}
        isConnecting={true}
      />
    {/if}
  {/if}

  {#each canvas.nodes as node (node.id)}
    {@const offsets = connectionOffsets[canvas.edgeStyle]}
    <NodeView
      {node}
      connectorX={offsets.connectorX}
      connectorY={offsets.connectorY}
      isSelected={canvas.selected?.type === "node" &&
        canvas.selected.id === node.id}
      editing={canvas.editing?.node.id === node.id ? canvas.editing : null}
      onMouseDown={(e) => canvas.handleNodeMouseDown(e, node)}
      onDblClick={(e) => canvas.handleNodeDblClick(e, node)}
      onConnectorMouseDown={(e) => canvas.handleConnectorMouseDown(e, node)}
      onLabelKeyDown={canvas.handleLabelKeyDown}
      onLabelBlur={canvas.commitLabel}
      onLabelInput={(v) => {
        if (canvas.editing) {
          canvas.editing.value = v;
        }
      }}
    />
  {/each}
</svg>

<style>
  :global(body) {
    margin: 0;
    overflow: hidden;
  }

  .canvas {
    width: 100vw;
    height: 100vh;
    background-color: #eff1f5;
    outline: none;
  }
</style>
