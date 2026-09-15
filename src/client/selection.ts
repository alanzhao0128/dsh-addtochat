/**
 * Selection capture layer: listen for pointer/keyboard selections inside the
 * conversation, validate them (single message node, not streaming, bounded),
 * and expose the latest valid selection through a small external-store
 * controller the floating button renders from. Pure DOM — no React here.
 * Same contract as dsh-sidebar-qa's selection layer (stable DOM attributes:
 * `data-chat-anchor-key` on each message, `data-streaming` while streaming).
 */

import type { SelectionSnapshot } from '../types.ts'

/** Maximum selected-text length admitted. */
export const MAX_SELECTION_CHARS = 2000

/** Popover-ready controller state. */
export interface SelectionState {
  readonly selection: SelectionSnapshot | null
}

export interface SelectionController {
  getSnapshot(): SelectionState
  subscribe(fn: () => void): () => void
  clear(): void
  /** Re-run capture now and notify if changed (e.g. after a locale switch). */
  refresh(): void
  dispose(): void
}

/** Resolve the chat-anchor element owning a DOM node (text nodes → parent). */
function chatAnchorOf(node: Node): HTMLElement | null {
  const element = node.nodeType === Node.TEXT_NODE ? node.parentElement : (node as Element | null)
  if (element === null || typeof element.closest !== 'function') return null
  return element.closest<HTMLElement>('[data-chat-anchor-key]')
}

/** Whether the owning message is still streaming (unfinished). */
function isStreaming(anchor: HTMLElement): boolean {
  return anchor.hasAttribute('data-streaming') || anchor.querySelector('[data-streaming]') !== null
}

/**
 * Capture and validate the current window selection, or null when invalid.
 * Valid: non-empty, ≤ MAX_SELECTION_CHARS, inside exactly one chat message,
 * and that message is not streaming.
 */
export function captureSelection(): SelectionSnapshot | null {
  const sel = window.getSelection()
  if (sel === null || sel.isCollapsed || sel.rangeCount === 0) return null
  const text = sel.toString()
  if (text.trim() === '' || text.length > MAX_SELECTION_CHARS) return null
  const range = sel.getRangeAt(0)
  const startAnchor = chatAnchorOf(range.startContainer)
  const endAnchor = chatAnchorOf(range.endContainer)
  if (startAnchor === null || startAnchor !== endAnchor) return null
  if (isStreaming(startAnchor)) return null
  const rect = range.getBoundingClientRect()
  return {
    text,
    rect: { left: rect.left, top: rect.top, width: rect.width, bottom: rect.bottom },
  }
}

/** Debounce for selectionchange (ms). */
const DEBOUNCE_MS = 150

/** Create one selection controller (call once per plugin activation). */
export function createSelectionController(): SelectionController {
  let selection: SelectionSnapshot | null = null
  const listeners = new Set<() => void>()
  let debounceTimer: number | undefined

  // useSyncExternalStore requires a STABLE snapshot reference between
  // notifications — a fresh object each call would loop React.
  let state: SelectionState = { selection: null }

  const notify = (): void => {
    state = { selection }
    for (const fn of [...listeners]) fn()
  }

  const recompute = (): void => {
    const next = captureSelection()
    const changed = (selection === null) !== (next === null)
      || (selection !== null && next !== null && (
        selection.text !== next.text
        || selection.rect.left !== next.rect.left
        || selection.rect.top !== next.rect.top
        || selection.rect.width !== next.rect.width
        || selection.rect.bottom !== next.rect.bottom
      ))
    if (!changed) return
    selection = next
    notify()
  }

  const onSelectionChange = (): void => {
    if (debounceTimer !== undefined) window.clearTimeout(debounceTimer)
    debounceTimer = window.setTimeout(recompute, DEBOUNCE_MS)
  }

  document.addEventListener('selectionchange', onSelectionChange)
  document.addEventListener('mouseup', recompute)
  document.addEventListener('keyup', onSelectionChange)

  return {
    getSnapshot: () => state,
    subscribe(fn: () => void): () => void {
      listeners.add(fn)
      return () => { listeners.delete(fn) }
    },
    clear(): void {
      selection = null
      notify()
    },
    refresh(): void {
      recompute()
    },
    dispose(): void {
      document.removeEventListener('selectionchange', onSelectionChange)
      document.removeEventListener('mouseup', recompute)
      document.removeEventListener('keyup', onSelectionChange)
      if (debounceTimer !== undefined) window.clearTimeout(debounceTimer)
    },
  }
}
