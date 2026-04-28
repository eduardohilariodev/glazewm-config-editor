<script lang="ts">
  import YamlEditor from '$shared/ui/YamlEditor.svelte'
  import { parseConfig } from '$shared/yaml'

  let {
    value = '',
    onApply,
  }: {
    value?: string
    onApply?: (yaml: string) => void
  } = $props()

  let draft = $state(value)
  let error = $state<string | null>(null)
  let dirty = $state(false)

  $effect(() => {
    if (!dirty) {
      draft = value
    }
  })

  function onEditorChange(val: string) {
    draft = val
    dirty = true
    error = null
  }

  function apply() {
    try {
      parseConfig(draft)
      onApply?.(draft)
      dirty = false
      error = null
    } catch (e) {
      error = (e as Error).message
    }
  }

  function reset() {
    draft = value
    dirty = false
    error = null
  }
</script>

<div class="relative flex flex-col h-full min-h-0">
  {#if error}
    <div
      class="flex items-start gap-2 px-3 py-2 bg-[#4a1a1a] border-b border-[#6a2a2a] text-[#ff8888] text-[0.85rem] shrink-0"
      role="alert"
    >
      <span class="font-bold shrink-0">YAML error:</span>
      <span class="font-mono">{error}</span>
    </div>
  {/if}

  <div class="flex-1 min-h-0 overflow-hidden">
    <YamlEditor bind:value={draft} onchange={onEditorChange} />
  </div>

  <div class="absolute bottom-4 right-4 z-10 flex gap-2">
    <button
      type="button"
      class="px-3 py-[0.35rem] border border-[#444] rounded bg-[#2a2a2a] text-[#ccc] text-[0.85rem] cursor-pointer hover:bg-[#3a3a3a] disabled:opacity-40 disabled:cursor-not-allowed"
      onclick={reset}
      disabled={!dirty}
    >Reset</button>
    <button
      type="button"
      class="px-3 py-[0.35rem] border border-[#0289a3] rounded bg-[#015f74] text-white text-[0.85rem] cursor-pointer hover:bg-[#0289a3] disabled:opacity-40 disabled:cursor-not-allowed"
      onclick={apply}
      disabled={!dirty}
    >Save</button>
  </div>
</div>

