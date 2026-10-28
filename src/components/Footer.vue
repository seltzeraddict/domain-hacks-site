<template>
  <footer>
    <p>Original by <a href="https://www.peter-ehses.de">Peter Ehses</a>, revived by <a href="https://kyletansley.com">Kyle Tansley</a>.</p>
    <p>Thanks for the data to <a href="https://www.datamuse.com/">datamuse</a>. Searches go to Datamuse, and availability checks to Google Public DNS.</p>
    <p>Something not working? Probably. Shoot me a bug report or fix it yourself on <a href="https://github.com/seltzeraddict/domain-hacks-site">GitHub</a>!</p>
  </footer>
</template>

<style lang="scss">
footer {
  display: flex;
  flex-direction: column;
  gap: .5em;
  font-size: .8rem;
  a {
    color: var(--highlight-color);
    text-decoration: none;
  }
}
</style>
