/**
 * The floating "add to chat" button: rendered in the plugin's own body-level
 * overlay host, positioned above (or below) the validated selection. Pure
 * presentation — all behavior lives in the click handler passed in.
 */

import type { SelectionSnapshot } from '../types.ts'
import { floatPosition } from './format.ts'

export interface AddToChatFloatProps {
  readonly selection: SelectionSnapshot
  /** Localized button label (decided by the caller from the dsh locale). */
  readonly label: string
  /** Invoked on click; the caller appends the quote and clears the selection. */
  readonly onAdd: (selection: SelectionSnapshot) => void
}

/** Approximate button width (px) used for horizontal centering. */
export const FLOAT_BTN_WIDTH = 112

export function AddToChatFloat({ selection, label, onAdd }: AddToChatFloatProps) {
  const pos = floatPosition(selection.rect, FLOAT_BTN_WIDTH)
  return (
    <button
      type="button"
      className="dsat-float"
      style={{ top: pos.top, left: pos.left }}
      onMouseDown={(e) => e.stopPropagation()}
      onClick={(e) => {
        e.preventDefault()
        e.stopPropagation()
        onAdd(selection)
      }}
    >
      {label}
    </button>
  )
}
