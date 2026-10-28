// Pure logic: no network, no Vue. Tested in domains.test.js.

export const Status = {
    CHECKING: 'checking',
    FREE: 'free',
    TLD_ONLY: 'tld-only',
    TAKEN: 'taken',
    UNKNOWN: 'unknown',
}

// IANA's list starts with a "# Version ..." comment line.
export function parseTldList(text) {
    return text
        .split(/\r\n|\r|\n/)
        .map((line) => line.trim())
        .filter((line) => line && !line.startsWith('#'))
}

// A domain label: letters, digits and hyphens, not starting or ending with a hyphen.
export function isValidLabel(label) {
    return /^[a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?$/.test(label)
}

// "ice cream" + "AM" -> { label: "ice-cre", tld: "am" }, or null if the rest can't be a domain.
// An empty label means the word is the TLD itself.
export function splitDomain(word, tld, separator = '-') {
    const rest = word.slice(0, word.length - tld.length)
    const label = rest.trim().replace(/\s+/g, separator).toLowerCase()
    if (label && !isValidLabel(label)) {
        return null
    }
    return { label, tld: tld.toLowerCase() }
}

export function domainsFor(word, tlds, separator) {
    const upper = word.toUpperCase()
    return tlds
        .filter((tld) => upper.endsWith(tld.toUpperCase()))
        .map((tld) => splitDomain(word, tld, separator))
        .filter(Boolean)
}

// The searched word first, then Datamuse's results by score. Only words that make at least one domain.
export function buildWordList(query, results, tlds, separator) {
    const seen = new Set()
    return [{ word: query, score: Infinity }, ...results]
        .filter(({ word }) => !seen.has(word) && seen.add(word))
        .map(({ word, score = 0 }) => ({ word, score, domains: domainsFor(word, tlds, separator) }))
        .filter((entry) => entry.domains.length > 0)
        .sort((a, b) => b.score - a.score)
}

// Google DNS answer -> status. 3 is NXDOMAIN (no such name), 0 is NOERROR (the name exists).
export function statusFromDns(answer) {
    if (answer.Status === 3) return Status.FREE
    if (answer.Status === 0) return Status.TAKEN
    return Status.UNKNOWN
}
