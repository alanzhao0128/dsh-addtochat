/**
 * Pure text/layout helpers — the only unit-testable surface of the plugin.
 * No DOM, no React.
 */

/**
 * Turn selected text into a markdown quote block: every line prefixed with
 * "> ". Multi-line selections stay inside one quoted block (GFM requires a
 * "> " per line).
 */
export function buildQuote(text: string): string {
  if (text === '') return ''
  return text
    .split('\n')
    .map((line) => (line.startsWith('> ') ? line : `> ${line}`))
    .join('\n')
}

/**
 * Append a quote block to the existing composer draft, preserving whatever the
 * user already typed. An empty draft yields the bare quote; otherwise the two
 * are separated by a blank line so the quote reads as its own block.
 */
export function appendQuote(draft: string, quote: string): string {
  const trimmed = draft.trim()
  if (trimmed === '') return quote
  return `${trimmed}\n\n${quote}`
}

/**
 * Floating-button label from the active dsh locale: Chinese UI shows the
 * Chinese label, everything else the English one.
 */
export function labelOf(active: string | undefined): string {
  return active === 'zh' ? '添加到会话' : 'add to chat'
}

export interface FloatRect {
  readonly left: number
  readonly top: number
  readonly width: number
  readonly bottom: number
}

/**
 * Place the floating button above the selection (centered on it), flipping
 * below when there is not enough viewport headroom. Returns fixed-position
 * coordinates. Pure math so it can be unit-tested.
 */
export function floatPosition(
  rect: FloatRect,
  btnWidth: number,
  btnHeight = 30,
  gap = 8,
  viewportTop = 0,
): { readonly top: number; readonly left: number } {
  const left = Math.max(4, rect.left + rect.width / 2 - btnWidth / 2)
  const above = rect.top - gap - btnHeight
  const top = above >= viewportTop + 4 ? above : rect.bottom + gap
  return { top, left }
}
