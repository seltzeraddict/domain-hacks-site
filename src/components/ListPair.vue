<template>
  <span :class="['pair', 'status-' + status]" tabindex="0">
    <div :class="['tooltip', 'status-' + status]">{{ tooltipText[status] }}</div>
    {{ label }}<wbr>.<span :class="['tld', 'status-' + status]">{{ tld }}</span>
  </span>
</template>

<script setup>
import { ref, watch } from 'vue'
import { lookupDomain } from '../apis.js'
import { Status, statusFromDns } from '../domains.js'

const props = defineProps({
  label: { type: String, required: true },
  tld: { type: String, required: true },
})

const tooltipText = {
  [Status.CHECKING]: 'Checking . . .',
  [Status.FREE]: 'Might be available.',
  [Status.TLD_ONLY]: "That's just the tld. Try to put something in front!",
  [Status.TAKEN]: 'Already registered.',
  [Status.UNKNOWN]: "Couldn't check this one.",
}

const status = ref(Status.CHECKING)

watch(
  () => [props.label, props.tld],
  async ([label, tld], _, onCleanup) => {
    if (!label) {
      status.value = Status.TLD_ONLY
      return
    }
    const lookup = new AbortController()
    onCleanup(() => lookup.abort()) // props changed or component gone: drop the old answer
    status.value = Status.CHECKING
    try {
      status.value = statusFromDns(await lookupDomain(`${label}.${tld}`, lookup.signal))
    } catch (error) {
      if (error.name !== 'AbortError') status.value = Status.UNKNOWN
    }
  },
  { immediate: true },
)
</script>

<style lang="scss">
.pair {
  position: relative;
  min-width: 0; // a flex item: moves to the next line first, and only wraps when too long for a line of its own
  overflow-wrap: anywhere;
  padding: 0 0.75rem 0 0;
  &.status-taken {
    text-decoration: line-through;
  }
  .tld {
    &.status-free {
      color: var(--success-color);
    }

    &.status-tld-only {
      color: var(--warn-color);
    }

    &.status-checking,
    &.status-unknown {
      color: var(--text-color);
      opacity: 0.6;
    }
    color: var(--error-color);
  }
  .tooltip {
    &.status-free {
      background: var(--success-color);
      &:after {
        border-color: transparent transparent var(--success-color) transparent;
      }
    }
    &.status-tld-only {
      background: var(--warn-color);
      &:after {
        border-color: transparent transparent var(--warn-color) transparent;
      }
    }
    position: absolute;
    user-select: none;
    padding: 0 0.5rem;
    white-space: normal;
    width: max-content;
    max-width: 14rem;
    text-decoration: none;
    right: calc(50% + 0.375rem);
    top: 150%;
    transform: translate(50%, 0);
    opacity: 0;
    pointer-events: none;
    background: var(--highlight-color);
    color: var(--background);
    z-index: 1000;
    transition: opacity var(--fast-animation-speed);
    &::after {
      content: "";
      position: absolute;
      bottom: 100%;
      left: 50%;
      margin-left: -5px;
      border-width: 5px;
      border-style: solid;
      border-color: transparent transparent var(--highlight-color) transparent;
    }
  }
  &:hover .tooltip,
  &:focus .tooltip {
    opacity: 1;
    pointer-events: all;
  }
}
</style>