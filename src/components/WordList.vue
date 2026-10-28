<template>
  <div class="wordlist">
    <!-- The intro flies up behind the search box on a search; the other lines fade in where it was. -->
    <Transition name="swap">
      <p v-if="message" class="info">{{ message }}</p>
      <p v-else-if="state.words.length" class="info legend">
        <span class="free">might be available</span>
        <span class="taken">registered</span>
        <span class="tld-only">just the tld</span>
        <span class="unknown">couldn't check</span>
      </p>
      <p v-else class="info intro">
        Type a word and get it and its synonyms as domain names. Try
        <a href="#professional">profession.al</a> or <a href="#delicious">delicio.us</a>.
      </p>
    </Transition>
    <!-- Keyed by the search, so every new result list rises in afresh. -->
    <dl v-if="state.words.length" :key="state.query" class="words" :style="{ '--longest': longest }">
      <WordInfo v-for="(word, index) in state.words" :key="word.word" :word="word" :style="{ '--index': index }" />
    </dl>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import WordInfo from './WordInfo.vue'
import { state } from '../store.js'

const message = computed(() => {
  if (state.loading) return 'Looking . . .'
  if (state.error) return state.error
  if (state.query && state.words.length === 0) return `No domain hacks for “${state.query}”. Try another word.`
  return ''
})

// Words are in a monospace font, so the longest one's width is its length in ch. Every row's word column gets it.
const longest = computed(() => Math.max(...state.words.map(({ word }) => word.length)))
</script>

<style lang="scss">
.wordlist {
  position: relative; // holds a leaving line while the next takes its place
  container-type: inline-size;
  margin-top: var(--gap);
  padding: 1.5rem 1rem;
  background: var(--background-highlight);

  .info {
    padding: 0 .75rem;
    text-align: center;
    a {
      color: var(--highlight-color);
      text-decoration: none;
    }
  }
  .legend {
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    gap: 0 1.5em;
    font-size: .8rem;
    .free { color: var(--success-color); }
    .taken { color: var(--error-color); text-decoration: line-through; }
    .tld-only { color: var(--warn-color); }
    .unknown { color: var(--text-color); opacity: .6; }
  }

  // A leaving line steps out of the flow so the next one takes its place without the panel's height jumping.
  // The search bar sits above the panel, so the intro passes under it.
  .swap-leave-active {
    position: absolute;
    top: 1.5rem;
    right: 1rem;
    left: 1rem;
  }
  .swap-enter-active,
  .swap-leave-active {
    transition: opacity .2s;
  }
  .swap-enter-from,
  .swap-leave-to {
    opacity: 0;
  }
  .intro.swap-leave-active {
    transition: none;
    animation: fly-away .32s cubic-bezier(.5, 0, .75, 0);
  }

  // Word | domains, the arrows lined up. Two columns when there's room, read down then across.
  .words {
    margin-top: 1.5rem;
    column-gap: 2rem;
  }
}

@keyframes fly-away {
  from,
  60% {
    opacity: 1;
  }
  to {
    opacity: 0;
    transform: translateY(-6rem);
  }
}

@container (min-width: 38rem) {
  .wordlist .words {
    columns: 2;
    font-size: .85em;
  }
}
</style>
