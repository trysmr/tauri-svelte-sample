<script lang="ts">
  let { onSave, onLoad }: { onSave: () => void; onLoad: () => void } = $props();
</script>

<div class="toolbar">
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
</style>
