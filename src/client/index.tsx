/**
 * dsh-addtochat client half: select text inside a conversation reply, a small
 * floating button appears above the selection ("添加到会话" / "add to chat"),
 * one click appends the selection into the main composer as a markdown quote
 * block (existing user text is preserved below it) — the user then types
 * their question and hits Enter as usual.
 *
 * Zero-hack contract: no renderer replacement, no session.prompt usage, no
 * composer DOM interception, no persistence. Selection capture uses the
 * browser's native Selection API; the composer write goes through the
 * OFFICIAL `inputActions.setDraft` face injected into the
 * `conversation.input.dock` slot (ui-conversation), bridged to the overlay
 * host. The plugin never submits anything itself — the user's normal Enter
 * does, with the quote block riding along.
 */

import { createRoot, type Root } from 'react-dom/client'
import { useEffect, useRef, type ReactNode } from 'react'
import type {
  AddToChatInputActions, AddToChatUseInput, Context,
} from '../types.ts'
import { createSelectionController } from './selection.ts'
import { appendQuote, buildQuote, labelOf } from './format.ts'
import { registerComposer, composerApi } from './bridge.ts'
import { AddToChatFloat } from './AddToChatFloat.tsx'
import './addtochat.css'

/** Services required before mounting. The composer faces (inputActions /
 *  useInput) reach the dock entry through slot standard-props injection
 *  (ui-conversation), not cordis services — no extra inject entries. */
export const inject = ['slots']

/** Faces the slot framework injects into `conversation.input.dock` entries. */
interface DockSlotProps {
  readonly inputActions?: AddToChatInputActions
  readonly useInput?: AddToChatUseInput
}

/**
 * Dock slot entry: invisible (returns null). It exists to receive the
 * official composer faces through slot standard-props and publish them to
 * the floating button via the module bridge. Hooks must never run
 * conditionally, so the hook-using full variant mounts only when both faces
 * are present.
 */
function DockSlot(props: object): ReactNode {
  const p = props as Partial<DockSlotProps>
  if (p.inputActions === undefined || p.useInput === undefined) return null
  return <DockSlotFull inputActions={p.inputActions} useInput={p.useInput} />
}

function DockSlotFull({ inputActions, useInput }: {
  readonly inputActions: AddToChatInputActions
  readonly useInput: AddToChatUseInput
}) {
  // Track the live draft in a ref so a click appends onto the freshest text
  // (the closure value would go stale between renders).
  const draft = useInput((s) => s.draft)
  const draftRef = useRef(draft)
  useEffect(() => { draftRef.current = draft }, [draft])

  useEffect(() => (
    registerComposer({
      setDraft: (text) => inputActions.setDraft(text),
      appendQuote: (quote) => inputActions.setDraft(appendQuote(draftRef.current, quote)),
    })
  ), [inputActions])

  return null
}

export function apply(ctx: Context): void {
  // Observable load marker: if this element appears in the DOM, the client
  // bundle loaded and apply() ran.
  console.log('[dsh-addtochat] apply() running')
  document.body.setAttribute('data-dsh-addtochat', 'loaded')

  // Active dsh locale ('zh' → Chinese label, anything else → English).
  // Written inside the optional 'locale' injection; the float re-renders so
  // an open button switches its label live.
  let activeLocale: string | undefined

  const selectionController = createSelectionController()

  // Overlay host: fixed-position portal owned by the plugin (body-level, dsh
  // DOM is never touched).
  const host = document.createElement('div')
  host.setAttribute('data-dsh-addtochat-float', '')
  document.body.appendChild(host)
  const root: Root = createRoot(host)

  const render = (): void => {
    const selection = selectionController.getSnapshot().selection
    // No float while the composer faces are unavailable (dock slot not yet
    // mounted): the button would have nothing to write to.
    root.render(
      selection !== null && composerApi() !== null
        ? (
          <AddToChatFloat
            selection={selection}
            label={labelOf(activeLocale)}
            onAdd={(sel) => {
              const api = composerApi()
              if (api !== null) api.appendQuote(buildQuote(sel.text))
              // Drop the DOM selection too, so a later selectionchange cannot
              // resurrect the float for the same (now stale) selection.
              window.getSelection()?.removeAllRanges()
              selectionController.clear()
            }}
          />
        )
        : null,
    )
  }

  // Scroll/resize anywhere → the float disappears (simplest predictable
  // behavior; the user can re-select).
  const hide = (): void => selectionController.clear()
  window.addEventListener('scroll', hide, true)
  window.addEventListener('resize', hide)

  // Click anywhere outside the float → dismiss. (The float itself stops
  // propagation on mousedown so the click that adds the quote is not eaten.)
  const onMouseDown = (e: MouseEvent): void => {
    if (host.contains(e.target as Node)) return
    hide()
  }
  document.addEventListener('mousedown', onMouseDown)

  const offSelection = selectionController.subscribe(render)

  // Language: attach zh/en label when the locale service is present.
  ctx.inject?.(['locale'], (lctx: Context) => {
    const applyLocale = (): void => {
      activeLocale = lctx.locale?.getSnapshot().active
      render()
    }
    applyLocale()
    lctx.effect(() => () => { activeLocale = undefined }, 'dsh-addtochat: locale reset')
  })

  // Dock slot: receives the official composer faces and hands them to the
  // float. The slot frameworks declare their specs after plugin apply() runs,
  // so slots.inject waits for the declaration — never a hard gate: without
  // the injected faces the float simply stays hidden (no broken writes).
  const offDock = ctx.slots.inject('conversation.input.dock', () =>
    ctx.slots.register(
      {
        name: 'conversation.input.dock',
        id: 'dsh-addtochat',
        order: 10000,
      },
      (props: object) => <DockSlot {...props} />,
    ),
  )

  // Disposal.
  ctx.effect(() => () => {
    offDock()
    offSelection()
    window.removeEventListener('scroll', hide, true)
    window.removeEventListener('resize', hide)
    document.removeEventListener('mousedown', onMouseDown)
    selectionController.dispose()
    root.unmount()
    host.remove()
  }, 'dsh-addtochat: cleanup')
}
