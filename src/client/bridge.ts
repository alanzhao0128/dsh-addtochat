/**
 * Tiny bridge between the dock slot component (which receives the official
 * injected `inputActions`/`useInput` faces through slot standard-props) and
 * the floating button (rendered in the plugin's own body overlay host).
 *
 * The slot framework injects the composer faces into components registered in
 * `conversation.input.dock`; the overlay host has no such injection, so the
 * dock component publishes a small API here and the floating button consumes
 * it on click. Module-level singleton — one activation per page.
 */

export interface ComposerApi {
  /** Replace the whole draft (official inputActions.setDraft). */
  setDraft(text: string): void
  /** Append a fenced block to the current draft, preserving user text. */
  appendBlock(block: string): void
}

let current: ComposerApi | null = null

/** The dock component calls this on mount; returns the disposer. */
export function registerComposer(api: ComposerApi): () => void {
  current = api
  return () => {
    if (current === api) current = null
  }
}

/** The floating button reads this; null until the dock slot is mounted. */
export function composerApi(): ComposerApi | null {
  return current
}
