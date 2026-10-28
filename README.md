# domain-hacks-site

Find domain hacks: type a word, get it and its synonyms split into domains that use the top-level domain as part of
the word (like-th.at, suicid.al), with a quick check of whether each one might still be available.

Revived from [like-th.at / synurl](https://github.com/PeterEhses/synurl) by
[Peter Ehses-Reifer](https://www.peter-ehses.de), modified by Kyle Tansley from 2026-10. GPL-3.0, see `LICENSE`.

## Working on it

Needs Node (version in `.nvmrc`).

```
npm ci            # install exactly what package-lock.json lists
npm run dev       # local server with live reload
npm test          # unit tests for the pure logic (src/*.test.js)
npm run build     # production files into dist/
npm run preview   # serve dist/ locally, to check the real build
```

`.npmrc` stops packages from running install scripts and pins exact versions. New packages: add as few as possible,
and prefer versions at least two weeks old (`npm install --before=<date> <package>`).

## How it works

- `src/apis.js`: the three outside services. [Datamuse](https://www.datamuse.com/api/) for similar words, IANA's
  TLD list, and Google Public DNS (an NS lookup: no such name means the domain probably isn't registered).
- `src/domains.js`: matching words to TLDs, building the result list, reading DNS answers. No network, tested.
- `src/share.js`: searches live in the URL hash (`suicid.al/#ice%20cream`), so links can be shared and Back works.
  The hash never reaches the server, so searches stay out of its logs. Decoding, cleaning, the 100-character cap. Tested.
- `src/store.js`: shared state, the search, and the theme (colors and sizes, set as CSS variables). Every search
  goes through the hash: the form sets it, and the `hashchange` handler runs the search.
- `src/components/`: the page pieces.

## Deploying

Every push to `main` runs `.github/workflows/deploy.yml`: test, build, and commit `dist/` to the `deploy` branch,
which serves suicid.al (site-sync on the estate's monserver picks it up within a minute).

- The Content-Security-Policy is set twice: a meta tag in the built page (`vite.config.js`) and a header in the
  estate's nginx config for this site, which also adds `frame-ancestors 'none'`. Change one, change the other.
- GPL-3.0: the repo has to stay public while the site is live.
- If like-th.at comes back as a second domain: its 2021 site registered a service worker that past visitors' browsers
  may still run. Ship a `public/service-worker.js` that unregisters itself and clears its caches before pointing the
  domain here.

## Changes from the 2021 original

- Vue CLI/webpack 4 to Vite; Vue 2 to Vue 3 (`<script setup>`); Vuex and vue-router removed (one page, a small
  `reactive()` store); axios replaced by `fetch`; node-sass replaced by `sass`; no service worker.
- Fonts are self-hosted (no Google Fonts requests).
- Availability uses an NS lookup instead of an A record, so registered domains without a website no longer show as
  available; failed lookups show as "couldn't check" instead. "Free" is now "might be available": no nameservers
  doesn't guarantee a name is for sale (reserved, premium, restricted country domains, recently expired).
- Search text is URL-encoded, a newer search cancels an older one, the first search waits for the TLD list, and
  there are loading, error and no-result messages.
- Words that can't form a valid domain (apostrophes, accents) are left out; results are ordered by Datamuse score.
- The header shows the domain the visitor came in on.
- Searches are shareable links (`#word`), Back and Forward step through past searches, and the tab title names the
  search.
- New layout: header and footer in a column that stays put on the left, the search pinned at the top right, results
  below it (two columns when there's room), and the page itself scrolls. Stacked on phones, search still pinned.
  Replaces the 12-column square grid that needed JavaScript to size itself.
