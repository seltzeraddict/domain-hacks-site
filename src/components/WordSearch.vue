<template>
  <form class="searchbar" role="search" @submit.prevent="search(query)">
    <div class="field bordergradient">
      <input type="text" :placeholder="placeholder" aria-label="Word to search for" :maxlength="MAX_QUERY_LENGTH" v-model="query">
      <button type="submit"><span class="label">Find domain hacks</span></button>
    </div>
  </form>
</template>

<script setup>
import { ref, watch } from 'vue'
import { MAX_QUERY_LENGTH } from '../share.js'
import { search, state } from '../store.js'

defineProps({
  placeholder: { type: String, default: 'Search...' },
})

// A shared link, Back or Forward changes the search without the form: show what is being searched.
const query = ref(state.query)
watch(() => state.query, (current) => (query.value = current))
</script>

<style lang="scss">
// Pinned where a search puts it, one gap below the top of the window (level with the side column), while the
// results scroll under it.
.searchbar {
  position: sticky;
  top: var(--gap);
  z-index: 2;
  padding: var(--border-width) 0;
  background: var(--background); // results scrolling under it stay hidden

  // Covers the gap above it too, with the page's own background, so results don't show through there.
  &::before {
    content: "";
    position: absolute;
    right: 0;
    bottom: 100%;
    left: 0;
    height: var(--gap);
    background: var(--background) var(--plus-pattern) fixed;
  }

  .field {
    display: flex;
  }

  input[type=text] {
    flex: 1;
    min-width: 0;
    margin: .5em;
    padding: .5em .75em;
    font-size: max(16px, 1rem); // smaller makes phones zoom in on focus
    background: var(--background);
    border: none;
    color: var(--text-color);
    &::placeholder {
      color: var(--text-color);
      opacity: .5;
    }
  }

  button {
    flex: none;
    padding: 0 1em 0 .5em;
    color: var(--text-color-highlight);
    background: none;
    border: none;
    cursor: pointer;
    &::after {
      content: "→";
      margin-left: .75em;
    }
  }
}

// Narrow: just the arrow. The button keeps its words for screen readers.
@media (max-width: 37em) {
  .searchbar .label {
    position: absolute;
    width: 1px;
    height: 1px;
    overflow: hidden;
    clip-path: inset(50%);
    white-space: nowrap;
  }
}
</style>
