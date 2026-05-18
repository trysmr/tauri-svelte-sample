<script lang="ts">
  import type { EdgeStyle } from "$lib/types";

  let {
    onSave,
    onLoad,
    edgeStyle,
    onEdgeStyleChange,
  }: {
    onSave: () => void;
    onLoad: () => void;
    edgeStyle: EdgeStyle;
    onEdgeStyleChange: (style: EdgeStyle) => void;
  } = $props();

  const styles: { value: EdgeStyle; label: string }[] = [
    { value: "bezier-horizontal", label: "Bezier H" },
    { value: "bezier-vertical", label: "Bezier V" },
    { value: "orthogonal-horizontal", label: "Ortho H" },
    { value: "orthogonal-vertical", label: "Ortho V" },
    { value: "straight", label: "Straight" },
    { value: "step-horizontal", label: "Step H" },
    { value: "step-vertical", label: "Step V" },
  ];
</script>

<div class="toolbar">
  <select
    value={edgeStyle}
    onchange={(e) => onEdgeStyleChange(e.currentTarget.value as EdgeStyle)}
  >
    {#each styles as style (style.value)}
      <option value={style.value}>{style.label}</option>
    {/each}
  </select>
  <button onclick={onSave}>Save</button>
  <button onclick={onLoad}>Load</button>
</div>

<style>
  .toolbar {
    position: fixed;
    top: 12px;
    right: 12px;
    display: flex;
    gap: 8px;
    z-index: 10;
  }

  .toolbar button,
  .toolbar select {
    padding: 6px 14px;
    border: 1px solid #bcc0cc;
    border-radius: 6px;
    background: #ffffff;
    color: #4c4f69;
    font-size: 13px;
    cursor: pointer;
  }

  .toolbar button:hover,
  .toolbar select:hover {
    border-color: #1e66f5;
    color: #1e66f5;
  }
</style>
