<script lang="ts">
  import type { Component } from "svelte";

  interface Tab {
    id: string;
    label: string;
    icon?: Component<{ size?: number | string; weight?: string }>;
  }
  interface Props {
    tabs: Tab[];
    active: string;
    onSelect: (id: string) => void;
  }
  let { tabs, active, onSelect }: Props = $props();
</script>

<nav class="flex gap-1 border-b border-[#333] px-2">
  {#each tabs as tab (tab.id)}
    {@const Icon = tab.icon}
    <button
      type="button"
      aria-pressed={active === tab.id}
      class="inline-flex items-center gap-[0.45rem] px-4 py-[0.6rem] border-0 bg-transparent cursor-pointer font-[inherit] text-[0.95rem] border-b-2 border-transparent hover:text-white {active === tab.id ? 'text-[#8eb8ed] !border-b-[#8eb8ed]' : 'text-[#aaa]'}"
      onclick={() => onSelect(tab.id)}
    >
      {#if Icon}
        <span class="inline-flex"><Icon size={18} weight={active === tab.id ? "fill" : "regular"} /></span>
      {/if}
      <span>{tab.label}</span>
    </button>
  {/each}
</nav>
