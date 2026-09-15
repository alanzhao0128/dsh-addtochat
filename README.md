# dsh-addtochat

Select text inside a conversation reply and add it to the composer input as a
fenced code block — one button replaces select → copy → paste.

![interaction: select a reply → floating button "添加到会话" / "add to chat"
appears above the selection → click → the selection is appended to the main
input as a ``` ``` ``` block → type your question → Enter]

## What it does

1. Select any text inside a conversation message (not streaming).
2. A small floating button appears above the selection:
   - Chinese UI: `添加到会话`
   - anything else: `add to chat`
3. Click it: the selected text lands in the main composer wrapped in a
   fenced code block (```` ``` ```` on its own lines), followed by a blank
   line — anything you already typed stays above it, and your next keystroke
   starts right below the fence.
4. Type your question and hit Enter — the block rides along with your
   normal submission.

That is the whole feature. No badges, no bubbles, no persistence, no reply
tracking. The plugin does exactly what the button says: moves the selected
text into your input so you can ask about it.

## Zero-hack contract

- Selection capture: browser-native `selectionchange` / `getSelection()`.
- Composer write: the OFFICIAL `inputActions.setDraft` face that
  ui-conversation injects into `conversation.input.dock` slot entries
  (standard-props), bridged to the plugin's own overlay host.
- No renderer replacement, no `session.prompt` monkey-patching, no composer
  DOM interception, no localStorage, no sending logic — the plugin never
  submits anything; your Enter does.

## Install

```
dsh plugin --profile web add dsh-addtochat
```

or, from a local checkout, link it into the profile package:

```json
"dependencies": { "dsh-addtochat": "link:/path/to/dsh-addtochat" },
"dsh": { "profile": { "bundles": [ ..., "dsh-addtochat" ] } }
```

then restart the web app.

## Build & test

```
pnpm install
pnpm test     # unit tests (pure text/layout helpers)
pnpm build    # host ESM + browser client bundle (lib/)
```

## Layout

- `src/index.ts` — host half (placeholder).
- `src/client/index.tsx` — apply(): selection controller, overlay host,
  floating button, `conversation.input.dock` slot entry.
- `src/client/selection.ts` — selection capture + validation.
- `src/client/format.ts` — pure helpers (block building, draft append, label,
  button placement).
- `src/client/bridge.ts` — dock-slot → overlay bridge for the official
  composer faces.

MIT
