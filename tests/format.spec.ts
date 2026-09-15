import { describe, expect, it } from 'vitest'
import { appendQuote, buildQuote, floatPosition, labelOf } from '../src/client/format.ts'

describe('buildQuote', () => {
  it('prefixes a single line with "> "', () => {
    expect(buildQuote('hello')).toBe('> hello')
  })

  it('prefixes every line of a multi-line selection', () => {
    expect(buildQuote('line one\nline two')).toBe('> line one\n> line two')
  })

  it('returns empty string for empty input', () => {
    expect(buildQuote('')).toBe('')
  })

  it('does not double-prefix lines that are already quotes', () => {
    expect(buildQuote('> already')).toBe('> already')
  })

  it('trims nothing — selection text is taken verbatim', () => {
    expect(buildQuote('  spaced  ')).toBe('>   spaced  ')
  })
})

describe('appendQuote', () => {
  it('returns the bare quote when the draft is empty', () => {
    expect(appendQuote('', '> hello')).toBe('> hello')
  })

  it('returns the bare quote when the draft is whitespace', () => {
    expect(appendQuote('   \n  ', '> hello')).toBe('> hello')
  })

  it('appends the quote after the user text with a blank line between', () => {
    expect(appendQuote('my question', '> hello')).toBe('my question\n\n> hello')
  })

  it('preserves user text verbatim (only outer whitespace trimmed)', () => {
    expect(appendQuote('  q1  ', '> a\n> b')).toBe('q1\n\n> a\n> b')
  })
})

describe('labelOf', () => {
  it('uses the Chinese label for the zh locale', () => {
    expect(labelOf('zh')).toBe('添加到会话')
  })

  it('falls back to English for any other locale', () => {
    expect(labelOf('en')).toBe('add to chat')
    expect(labelOf('ja')).toBe('add to chat')
    expect(labelOf(undefined)).toBe('add to chat')
  })
})

describe('floatPosition', () => {
  const rect = { left: 100, top: 500, width: 200, bottom: 520 }

  it('centers the button above the selection when there is headroom', () => {
    const pos = floatPosition(rect, 112, 30, 8, 0)
    expect(pos.top).toBe(500 - 8 - 30) // 462
    expect(pos.left).toBe(100 + 100 - 56) // 144
  })

  it('flips below the selection when there is no headroom', () => {
    const pos = floatPosition(rect, 112, 30, 8, 480)
    expect(pos.top).toBe(520 + 8) // below
  })

  it('clamps the left edge to the viewport', () => {
    const pos = floatPosition({ left: -50, top: 100, width: 20, bottom: 120 }, 112, 30, 8, 0)
    expect(pos.left).toBe(4)
  })
})
