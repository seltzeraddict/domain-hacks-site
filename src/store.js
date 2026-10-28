import { reactive } from 'vue'
import { getSynonyms, getTldList } from './apis.js'
import { buildWordList, parseTldList } from './domains.js'
import { hashForQuery, queryFromHash } from './share.js'

// Whichever domain the visitor came in on; suicid.al when running locally.
const host = location.hostname
export const siteName = host.includes('.') && !/^[\d.]+$/.test(host) ? host : 'suicid.al'

export const settings = {
    urlSeparator: '-',
}

// Set as CSS custom properties on :root (camelCase -> --kebab-case) by App.vue.
export const theme = {
    remMin: '16px',
    remMax: '24px',

    ambientAnimationSpeed: '20s',
    fastAnimationSpeed: '.3s',
    borderWidth: '.2em',
    borderRadius: 0,

    background: '#0c0e0f',
    backgroundHighlight: '#1e1d1e',

    textColor: '#feece9',
    textColorHighlight: '#fef6f6',

    successColor: '#d4c98d',
    warnColor: '#fcd59a',
    errorColor: '#f26e6a',
    highlightColor: '#f7a09e',

    textFont: '"Work Sans", sans-serif',
    textWeight: 400,

    headingFont: '"Space Mono", monospace',
    headingWeight: 400,
    headingStyle: 'italic',
}

export const state = reactive({
    query: '',
    words: [],
    tlds: [],
    loading: false,
    error: null,
})

let tldsLoaded = null

export function loadTlds() {
    tldsLoaded ??= getTldList()
        .then((text) => {
            state.tlds = parseTldList(text)
        })
        .catch((error) => {
            tldsLoaded = null // try again on the next search
            throw error
        })
    return tldsLoaded
}

let currentSearch = null

async function loadWords(query) {
    currentSearch?.abort() // a newer search replaces an older one still loading
    const search = (currentSearch = new AbortController())
    state.query = query
    state.error = null
    if (!query) {
        state.words = []
        state.loading = false
        return
    }
    state.loading = true

    try {
        const [results] = await Promise.all([getSynonyms(query, search.signal), loadTlds()])
        state.words = buildWordList(query, results, state.tlds, settings.urlSeparator)
    } catch (error) {
        if (error.name === 'AbortError') return
        console.error(error)
        state.error = "Couldn't reach the word list. Check your connection and try again."
    } finally {
        if (currentSearch === search) state.loading = false
    }
}

// The one way a search starts: on page load and on every hash change (the form, Back, Forward, a pasted link).
export function followHash() {
    const query = queryFromHash(location.hash)
    document.title = query ? `${query} · ${siteName}` : siteName
    // New results start at the top, not wherever the old list was. Instant: the CSS reset makes scrolling smooth.
    if (query !== state.query) window.scrollTo({ top: 0, behavior: 'instant' })
    loadWords(query)
}

// The form only changes the hash. Searching the same word again (say, after an error) has no hash change to wait for.
export function search(text) {
    const hash = hashForQuery(text)
    if (!hash) return
    if (hash === location.hash) followHash()
    else location.hash = hash
}
