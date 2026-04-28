<script lang="ts">
  import { onMount } from 'svelte'
  import { EditorView, basicSetup } from 'codemirror'
  import { yaml } from '@codemirror/lang-yaml'
  import { oneDark } from '@codemirror/theme-one-dark'
  import { EditorState } from '@codemirror/state'

  let {
    value = $bindable(''),
    readonly = false,
    onchange,
  }: {
    value?: string
    readonly?: boolean
    onchange?: (val: string) => void
  } = $props()

  let container: HTMLDivElement
  let view: EditorView
  let internalUpdate = false

  onMount(() => {
    view = new EditorView({
      state: EditorState.create({
        doc: value,
        extensions: [
          basicSetup,
          yaml(),
          oneDark,
          EditorView.editable.of(!readonly),
          EditorView.updateListener.of((update) => {
            if (update.docChanged) {
              internalUpdate = true
              value = update.state.doc.toString()
              onchange?.(value)
              internalUpdate = false
            }
          }),
          EditorView.theme({
            '&': { height: '100%', fontSize: '13px' },
            '.cm-scroller': { overflow: 'auto', fontFamily: 'inherit' },
          }),
        ],
      }),
      parent: container,
    })

    return () => view.destroy()
  })

  $effect(() => {
    if (view && !internalUpdate && value !== view.state.doc.toString()) {
      view.dispatch({
        changes: { from: 0, to: view.state.doc.length, insert: value },
      })
    }
  })
</script>

<div bind:this={container} class="yaml-editor"></div>

<style>
  .yaml-editor {
    width: 100%;
    height: 100%;
    min-height: 300px;
    border-radius: 6px;
    overflow: hidden;
  }
</style>
