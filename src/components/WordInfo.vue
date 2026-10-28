<template>
  <div class="wordinfo">
    <dt :title="word.word"><span class="word">{{ word.word }}</span></dt>
    <dd class="domains">
      <ListPair v-for="domain in word.domains" :key="domain.tld" :label="domain.label" :tld="domain.tld" />
    </dd>
  </div>
</template>

<script setup>
import ListPair from './ListPair.vue'

defineProps({
  word: { type: Object, required: true },
})
</script>

<style lang="scss">
.wordinfo {
  display: grid;
  grid-template-columns: auto minmax(0, 1fr);
  align-items: baseline;
  padding: .2em 0;
  break-inside: avoid;
  // Rows rise in one after another; past the first 20 (mostly below the fold) they come all at once.
  animation: rise .45s cubic-bezier(.2, .8, .3, 1) backwards; // not "both": a lasting transform would trap tooltips under the next row
  animation-delay: calc(min(var(--index), 20) * 25ms);
  dt {
    display: flex;
    justify-content: flex-end;
    min-width: 0;
    white-space: nowrap;
    font-family: var(--heading-font);
    font-weight: var(--heading-weight);
    font-style: var(--heading-style);
    &::after {
      content: "↝";
      padding: 0 0.65rem;
    }
  }
  // As wide as the longest word, so the arrows line up. When space runs out the word gives way, not its domains
  // (which spell it out anyway).
  .word {
    width: calc(var(--longest) * 1ch + .2em); // .2em: italics lean past their box
    max-width: 45cqi;
    overflow: hidden;
    text-overflow: ellipsis;
    text-align: right;
  }
  dd {
    margin: 0;
  }
  .domains {
    display: flex;
    flex-wrap: wrap;
  }
  &:hover {
    background-color: var(--background);
  }
}

@keyframes rise {
  from {
    opacity: 0;
    transform: translateY(.6em);
  }
}

// The reset shortens animations for reduced motion, but the delays would still stagger the rows.
@media (prefers-reduced-motion: reduce) {
  .wordinfo {
    animation: none;
  }
}

@container (min-width: 38rem) {
  .wordinfo .word {
    max-width: 24cqi;
  }
}
</style>
