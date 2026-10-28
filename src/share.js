// Searches live in the URL hash (suicid.al/#ice%20cream), so they can be shared and Back works. The hash never
// reaches the server, so searches stay out of its logs. Pure logic, tested in share.test.js.

export const MAX_QUERY_LENGTH = 100

// Lowercase, single spaces, no control characters, at most MAX_QUERY_LENGTH long.
export function cleanQuery(text) {
    return text
        .replace(/[\u0000-\u001f\u007f]/g, ' ')
        .replace(/\s+/g, ' ')
        .trim()
        .toLowerCase()
        .slice(0, MAX_QUERY_LENGTH)
        .trim()
}

// "#ice%20cream" -> "ice cream". A hash that doesn't decode (a stray "%") reads as no search.
export function queryFromHash(hash) {
    try {
        return cleanQuery(decodeURIComponent(hash.replace(/^#/, '')))
    } catch {
        return ''
    }
}

export function hashForQuery(query) {
    const clean = cleanQuery(query)
    return clean ? '#' + encodeURIComponent(clean) : ''
}
