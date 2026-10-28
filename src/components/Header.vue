<template>
  <header class="polkadot gradient">
    <h1 class="heading">{{ siteName }}</h1>
    <h2>generate unique urls that use their <abbr title="top level domain">tld</abbr> as part of a word, like... well, you get the idea</h2>
  </header>
</template>

<script setup>
import { siteName } from '../store.js'
</script>

<style lang="scss">
header {
  h1 {
    font-size: 2em;
    line-height: 1.2;
  }
  h2 {
    font-size: 1.25em;
    line-height: 1.35;
  }
}

// A field of dots in the bottom right corner, below the text.
.polkadot {
  --dot-width: 1.2rem;
  --dots-height: 3.6rem;
  position: relative;
  background: var(--background-highlight);
  padding: 2rem 2rem calc(var(--dots-height) + 1.5rem);
  &::after {
    content: "";
    position: absolute;
    right: 0;
    bottom: 0;
    width: 75%;
    height: var(--dots-height);
    background-image: radial-gradient(var(--text-color-highlight) 15%, transparent 16%),
      radial-gradient(var(--text-color-highlight) 15%, transparent 16%);
    background-size: var(--dot-width) var(--dot-width);
    background-position: 0 0, calc(var(--dot-width) / 2) calc(var(--dot-width) / 2);
  }
}

@media (max-width: 50em) {
  .polkadot {
    --dots-height: 2.4rem;
    padding: 1.5rem 1.5rem calc(var(--dots-height) + 1rem);
  }
}
</style>
