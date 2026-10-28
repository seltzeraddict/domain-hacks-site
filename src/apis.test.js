import { afterEach, describe, expect, it, vi } from 'vitest'
import { lookupDomain } from './apis.js'

afterEach(() => vi.unstubAllGlobals())

describe('lookupDomain', () => {
    it('runs at most 6 lookups at once and remembers answers', async () => {
        let active = 0
        let peak = 0
        const fetchMock = vi.fn(async () => {
            peak = Math.max(peak, ++active)
            await new Promise((resolve) => setTimeout(resolve, 5))
            active--
            return { ok: true, json: async () => ({ Status: 3 }) }
        })
        vi.stubGlobal('fetch', fetchMock)

        const names = Array.from({ length: 40 }, (_, i) => `name${i}.al`)
        await Promise.all(names.map((name) => lookupDomain(name)))
        expect(peak).toBe(6)
        expect(fetchMock).toHaveBeenCalledTimes(40)

        await lookupDomain('name0.al')
        expect(fetchMock).toHaveBeenCalledTimes(40)
    })

    it('skips lookups cancelled while waiting', async () => {
        const fetchMock = vi.fn(async () => {
            await new Promise((resolve) => setTimeout(resolve, 5))
            return { ok: true, json: async () => ({ Status: 0 }) }
        })
        vi.stubGlobal('fetch', fetchMock)

        const search = new AbortController()
        const lookups = Array.from({ length: 10 }, (_, i) => lookupDomain(`gone${i}.al`, search.signal).catch((e) => e.name))
        search.abort()
        const results = await Promise.all(lookups)
        expect(results.filter((r) => r === 'AbortError')).toHaveLength(4)
        expect(fetchMock).toHaveBeenCalledTimes(6)
    })

    it('asks again after a failed answer (SERVFAIL), but not after a definite one', async () => {
        const fetchMock = vi.fn(async (url) => ({ ok: true, json: async () => ({ Status: url.includes('flaky') ? 2 : 0 }) }))
        vi.stubGlobal('fetch', fetchMock)

        await lookupDomain('flaky.al')
        await lookupDomain('flaky.al')
        await lookupDomain('steady.al')
        await lookupDomain('steady.al')
        expect(fetchMock).toHaveBeenCalledTimes(3)
    })
})
