import { describe, expect, it } from 'vitest'
import {
  appendBlock, buildBlock, floatPosition, labelOf, primarySubtag,
} from '../src/client/format.ts'

describe('buildBlock', () => {
  it('wraps a single line in a fenced code block', () => {
    expect(buildBlock('hello')).toBe('```\nhello\n```')
  })

  it('wraps a multi-line selection verbatim', () => {
    expect(buildBlock('line one\nline two')).toBe('```\nline one\nline two\n```')
  })

  it('returns empty string for empty input', () => {
    expect(buildBlock('')).toBe('')
  })

  it('does not trim the selection text', () => {
    expect(buildBlock('  spaced  ')).toBe('```\n  spaced  \n```')
  })
})

describe('appendBlock', () => {
  it('returns the bare block (plus trailing newline) when the draft is empty', () => {
    expect(appendBlock('', '```\nhello\n```')).toBe('```\nhello\n```\n')
  })

  it('returns the bare block when the draft is whitespace', () => {
    expect(appendBlock('   \n  ', '```\nhello\n```')).toBe('```\nhello\n```\n')
  })

  it('appends the block after the user text with a blank line between', () => {
    expect(appendBlock('my question', '```\nhello\n```')).toBe('my question\n\n```\nhello\n```\n')
  })

  it('preserves user text verbatim (only outer whitespace trimmed)', () => {
    expect(appendBlock('  q1  ', '```\na\nb\n```')).toBe('q1\n\n```\na\nb\n```\n')
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

describe('primarySubtag', () => {
  it('extracts the primary subtag of a regional tag', () => {
    expect(primarySubtag('zh-CN')).toBe('zh')
    expect(primarySubtag('en-US')).toBe('en')
  })

  it('passes bare tags through lowercased', () => {
    expect(primarySubtag('ZH')).toBe('zh')
    expect(primarySubtag('en')).toBe('en')
  })

  it('returns empty string for empty input', () => {
    expect(primarySubtag('')).toBe('')
    expect(primarySubtag('   ')).toBe('')
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
