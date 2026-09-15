/**
 * dsh-addtochat shared types: the selection snapshot, the service faces the
 * plugin reads, and the Context augmentation. Third-party plugins resolve
 * outside the DSH monorepo's single cordis instance, so the upstream
 * `declare module 'cordis'` augmentations do not reach this Context — drift
 * from upstream is contained to this file; only the leaf fields read are
 * declared.
 */

import type { Context } from 'cordis'

// ────────────────────────────────────────────────────────────────────────────
// Domain types
// ────────────────────────────────────────────────────────────────────────────

/** A validated selection inside one conversation message. */
export interface SelectionSnapshot {
  /** The selected text (already validated: non-empty, bounded). */
  readonly text: string
  /** Viewport rect of the selection (for floating-button placement). */
  readonly rect: {
    readonly left: number
    readonly top: number
    readonly width: number
    readonly bottom: number
  }
}

// ────────────────────────────────────────────────────────────────────────────
// Service faces (structural mirrors of what dsh provides at runtime)
// ────────────────────────────────────────────────────────────────────────────

/** The slots service (`ctx.slots`), ui-slots' registry. */
export interface AddToChatSlotsService {
  /** Register one slot contribution; returns the disposer. */
  register(spec: unknown, component?: unknown): () => void
  /** Wait for `key` to be declared, then register; returns the disposer. */
  inject(key: string, factory: () => unknown): () => void
}

/** The client locale service face (mirror of dsh-client-locale). */
export interface AddToChatLocaleService {
  getSnapshot(): { active: string }
  subscribe(fn: () => void): () => void
}

/** Official composer input actions (mirror of ui-conversation InputActions). */
export interface AddToChatInputActions {
  /** Replace the whole draft (persisted-draft seed and programmatic writes). */
  setDraft(text: string): void
}

/** Minimal editor state projection (mirror of ui-conversation InputState). */
export interface AddToChatInputState {
  readonly draft: string
  readonly draftRev: number
}

/** Official input-state selector hook (ui-conversation `useInput`). */
export type AddToChatUseInput = <Selected>(
  selector: (state: AddToChatInputState) => Selected,
) => Selected

// ────────────────────────────────────────────────────────────────────────────
// Context augmentation
// ────────────────────────────────────────────────────────────────────────────

declare module 'cordis' {
  interface Context {
    /** The official slot registry (ui-slots). */
    slots: AddToChatSlotsService
    /** The DSH client locale service (dsh-client-locale); optional. */
    locale: AddToChatLocaleService
    /**
     * Register a lifecycle callback (DSH-vendored cordis): runs at plugin
     * activation; its returned cleanup runs at disposal.
     */
    effect(fn: () => void | (() => void), label?: string): void
  }
}

export type { Context }
