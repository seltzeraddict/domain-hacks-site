import { describe, expect, it } from 'vitest'
import { MAX_QUERY_LENGTH, cleanQuery, hashForQuery, queryFromHash } from './share.js'

describe('cleanQuery', () => {
    it('lowercases, trims and collapses spaces', () => {
        expect(cleanQuery('  Ice   Cream ')).toBe('ice cream')
    })
    it('turns control characters into spaces', () => {
        expect(cleanQuery('ice\ncream\u0000')).toBe('ice cream')
    })
    it('caps the length', () => {
        expect(cleanQuery('a'.repeat(500))).toHaveLength(MAX_QUERY_LENGTH)
    })
})

describe('queryFromHash', () => {
    it('decodes the hash', () => {
        expect(queryFromHash('#ice%20cream')).toBe('ice cream')
        expect(queryFromHash('#suicidal')).toBe('suicidal')
        expect(queryFromHash('#caf%C3%A9')).toBe('café')
    })
    it('reads an empty or missing hash as no search', () => {
        expect(queryFromHash('')).toBe('')
        expect(queryFromHash('#')).toBe('')
        expect(queryFromHash('#%20%20')).toBe('')
    })
    it('reads a hash that does not decode as no search', () => {
        expect(queryFromHash('#100%')).toBe('')
        expect(queryFromHash('#%E0%A4%A')).toBe('')
    })
    it('caps the length', () => {
        expect(queryFromHash('#' + 'a'.repeat(5000))).toHaveLength(MAX_QUERY_LENGTH)
    })
    it('leaves markup as plain text', () => {
        expect(queryFromHash('#%3Cscript%3E')).toBe('<script>')
    })
})

describe('hashForQuery', () => {
    it('encodes the cleaned query', () => {
        expect(hashForQuery(' Ice Cream ')).toBe('#ice%20cream')
        expect(hashForQuery('rock&roll#1')).toBe('#rock%26roll%231')
    })
    it('gives no hash for an empty query', () => {
        expect(hashForQuery('   ')).toBe('')
    })
    it('round-trips through queryFromHash', () => {
        for (const query of ['ice cream', 'café', '100%', 'a/b?c=d']) {
            expect(queryFromHash(hashForQuery(query))).toBe(query)
        }
    })
})
