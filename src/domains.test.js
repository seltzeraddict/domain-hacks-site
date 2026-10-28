import { describe, expect, it } from 'vitest'
import { Status, buildWordList, domainsFor, parseTldList, splitDomain, statusFromDns } from './domains.js'

describe('parseTldList', () => {
    it('drops the comment line and blank lines', () => {
        expect(parseTldList('# Version 2026102700\nAAA\r\nAT\n\nCOM\n')).toEqual(['AAA', 'AT', 'COM'])
    })
})

describe('splitDomain', () => {
    it('splits a word into label and tld', () => {
        expect(splitDomain('like that', 'AT')).toEqual({ label: 'like-th', tld: 'at' })
    })
    it('gives an empty label when the word is the tld', () => {
        expect(splitDomain('com', 'COM')).toEqual({ label: '', tld: 'com' })
    })
    it('rejects labels that cannot be domains', () => {
        expect(splitDomain("o'clock", 'CK')).toBeNull()
        expect(splitDomain('-us', 'US')).toBeNull()
    })
})

describe('domainsFor', () => {
    it('finds every tld the word ends with', () => {
        expect(domainsFor('suicidal', ['AL', 'COM', 'DAL'])).toEqual([
            { label: 'suicid', tld: 'al' },
            { label: 'suici', tld: 'dal' },
        ])
    })
})

describe('buildWordList', () => {
    const tlds = ['AL', 'ES', 'AT']
    it('puts the searched word first, then by score, and drops words without domains', () => {
        const results = [
            { word: 'chat', score: 10 },
            { word: 'dog', score: 50 },
            { word: 'final', score: 30 },
        ]
        expect(buildWordList('flat', results, tlds).map((w) => w.word)).toEqual(['flat', 'final', 'chat'])
    })
    it('does not list the searched word twice', () => {
        expect(buildWordList('flat', [{ word: 'flat', score: 5 }], tlds)).toHaveLength(1)
    })
})

describe('statusFromDns', () => {
    it('reads NXDOMAIN as free, NOERROR as taken, anything else as unknown', () => {
        expect(statusFromDns({ Status: 3 })).toBe(Status.FREE)
        expect(statusFromDns({ Status: 0, Answer: [] })).toBe(Status.TAKEN)
        expect(statusFromDns({ Status: 0 })).toBe(Status.TAKEN)
        expect(statusFromDns({ Status: 2 })).toBe(Status.UNKNOWN)
    })
})
