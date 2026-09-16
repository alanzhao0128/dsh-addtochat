/**
 * Pure text/layout helpers — the only unit-testable surface of the plugin.
 * No DOM, no React.
 */

/**
 * Turn selected text into a fenced code block (` ``` ` on its own lines),
 * which renders distinctly from prose in the composer and in the sent
 * message. Empty input yields an empty string (nothing to wrap).
 */
export function buildBlock(text: string): string {
  if (text === '') return ''
  return '```\n' + text + '\n```'
}

/**
 * Append a fenced block to the existing composer draft, preserving whatever
 * the user already typed. An empty draft yields the bare block; otherwise
 * the two are separated by a blank line. The block is always followed by a
 * trailing newline, so the user's next keystroke starts on a fresh line
 * right below the fence.
 */
export function appendBlock(draft: string, block: string): string {
  const trimmed = draft.trim()
  const base = trimmed === '' ? block : `${trimmed}\n\n${block}`
  return `${base}\n`
}

/**
 * Floating-button label from the active dsh locale: Chinese UI shows the
 * Chinese label, everything else the English one.
 */
export function labelOf(active: string | undefined): string {
  return active === 'zh' ? '添加到会话' : 'add to chat'
}

/**
 * Primary language subtag of a BCP 47-style tag, lowercased ('zh-CN' → 'zh',
 * 'en-US' → 'en', '' → ''). The dsh locale service writes the active locale
 * into `<html lang>` as 'zh-CN' for Chinese and the bare id otherwise, so the
 * primary subtag is the locale signal this plugin compares.
 */
export function primarySubtag(tag: string): string {
  return tag.trim().split('-')[0]?.toLowerCase() ?? ''
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
