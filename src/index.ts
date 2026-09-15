/**
 * dsh-addtochat host half: placeholder only.
 *
 * All behavior lives in the browser half (src/client) — selection capture
 * inside conversation messages, a floating "add to chat" button above the
 * selection, and writing the selected text into the main composer as a
 * markdown quote through the official `inputActions.setDraft` face injected
 * by the `conversation.input.dock` slot. The host needs no routes, no
 * persistence, and no custom API endpoints.
 */

export const name = 'dsh-addtochat'

export function apply(): void {}

export default { name, apply }
