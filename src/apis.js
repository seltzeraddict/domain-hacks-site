// The three outside services the site talks to. All allow browser calls (CORS).

async function get(url, signal, as = 'json') {
    const response = await fetch(url, { signal })
    if (!response.ok) {
        throw new Error(`${url} answered ${response.status}`)
    }
    return as === 'text' ? response.text() : response.json()
}

// Datamuse: words with a similar meaning ("ml" = means like).
export function getSynonyms(query, signal) {
    const params = new URLSearchParams({ ml: query })
    return get(`https://api.datamuse.com/words?${params}`, signal)
}

// IANA: every top-level domain, one per line, uppercase.
export function getTldList(signal) {
    return get('https://data.iana.org/TLD/tlds-alpha-by-domain.txt', signal, 'text')
}

// A search can show 100+ domains. Ask Google about at most this many at once, and remember the answers.
const MAX_LOOKUPS = 6
let activeLookups = 0
const waitingLookups = []
const dnsAnswers = new Map()

async function inLookupSlot(task) {
    if (activeLookups < MAX_LOOKUPS) activeLookups++
    else await new Promise((resolve) => waitingLookups.push(resolve)) // a finishing lookup hands over its slot
    try {
        return await task()
    } finally {
        const next = waitingLookups.shift()
        if (next) next()
        else activeLookups--
    }
}

// Google Public DNS: does the name have nameservers? Registered domains nearly always do.
export async function lookupDomain(name, signal) {
    if (dnsAnswers.has(name)) return dnsAnswers.get(name)
    const answer = await inLookupSlot(() => {
        signal?.throwIfAborted() // gone while waiting in line: don't spend a request on it
        const params = new URLSearchParams({ name, type: 'NS' })
        return get(`https://dns.google/resolve?${params}`, signal)
    })
    if (answer.Status === 0 || answer.Status === 3) dnsAnswers.set(name, answer) // a passing failure gets another try
    return answer
}
