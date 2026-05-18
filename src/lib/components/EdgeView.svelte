<script lang="ts">
  import type { PathFn } from "$lib/graph";

  let {
    x1,
    y1,
    x2,
    y2,
    pathFn,
    isSelected = false,
    isConnecting = false,
    onClick,
  }: {
    x1: number;
    y1: number;
    x2: number;
    y2: number;
    pathFn: PathFn;
    isSelected?: boolean;
    isConnecting?: boolean;
    onClick?: (event: MouseEvent) => void;
  } = $props();
</script>

{#if onClick}
  <!-- svelte-ignore a11y_click_events_have_key_events -->
  <!-- svelte-ignore a11y_no_static_element_interactions -->
  <path d={pathFn(x1, y1, x2, y2)} class="edge-hit" onclick={onClick} />
{/if}

<path
  d={pathFn(x1, y1, x2, y2)}
  class="edge"
  class:selected={isSelected}
  class:connecting={isConnecting}
  pointer-events="none"
/>

<style>
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
</style>
