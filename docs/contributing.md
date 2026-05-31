# Contributing

This guide covers contributing to the USSD Phone Simulator — for humans writing code directly, and for AI assistants working through tools like Claude Code.

---

## Table of Contents

- [For Human Contributors](#for-human-contributors)
  - [Getting Started](#getting-started)
  - [Project Conventions](#project-conventions)
  - [Making Changes](#making-changes)
  - [Submitting a Pull Request](#submitting-a-pull-request)
- [For AI Contributors](#for-ai-contributors)
  - [Orientation](#orientation)
  - [Layer Contracts](#layer-contracts)
  - [How State Flows](#how-state-flows)
  - [Coding Rules](#coding-rules)
  - [What Not to Touch](#what-not-to-touch)
  - [Testing Your Changes](#testing-your-changes)
  - [Common Tasks](#common-tasks)

---

## For Human Contributors

### Getting Started

```bash
git clone https://github.com/your-org/ussd_phone_simulator.git
cd ussd_phone_simulator
npm install
npm run dev
```

Read [Architecture](architecture.md) before touching `src/engine/` or `src/adapters/`. Read [Flow Definition Reference](flow-definition.md) before modifying the parser or default flow.

### Project Conventions

**TypeScript:**
- All new files must be `.ts` or `.vue`. No `.js`.
- `strict: true` is enforced — no implicit `any`, no unsafe null access.
- Prefer `interface` over `type` for object shapes; use `type` for unions.

**Vue components:**
- All components use `<script setup lang="ts">`.
- Props are declared with `defineProps<{...}>()` — no runtime object syntax.
- Emits use `defineEmits<{...}>()`.
- No component-level business logic. Business logic lives in composables or stores.

**Pinia stores:**
- Use the composable (setup) syntax, not the options API syntax.
- Store actions are plain functions returned from the setup function.
- Never import one store into another store — use composables to coordinate.

**Styling:**
- Tailwind CSS utility classes only. No `<style>` blocks unless unavoidable.
- Dark mode via the `dark:` variant — every new element needs a dark-mode colour.
- No hardcoded colour values outside Tailwind's palette.

**Comments:**
- Write no comments by default.
- Add a comment only when the *why* is non-obvious (a hidden constraint, a subtle invariant, a workaround for a specific bug).

### Making Changes

**Adding a new menu option type:**
1. Add the field to `FlowMenuOption` in `src/types/ussd.ts`.
2. Update the Zod schema in `src/engine/FlowParser.ts`.
3. Handle the new option in `UssdEngine.process()`.
4. Update `docs/flow-definition.md`.

**Adding a new setting:**
1. Add the ref and setter to `src/stores/settings.ts`.
2. Wire it into the relevant component (`LiveModePanel.vue` for live settings, `SimulatorView.vue` → General tab for mock settings).
3. Use it in the adapter or composable where it applies.

**Adding a new adapter:**
1. Implement `UssdAdapter` from `src/types/ussd.ts`.
2. Add a branch in `buildAdapter()` in `src/composables/useSimulator.ts`.
3. Add a mode value to the `SimulatorMode` union in `src/stores/settings.ts`.

### Submitting a Pull Request

1. Branch from `main`: `git checkout -b feat/your-feature`.
2. Run `npm run build` and ensure it exits 0 before pushing.
3. Describe what changed and why in the PR body.
4. Link to the relevant doc file if your change affects user-facing behaviour.

---

## For AI Contributors

This section is written for AI coding assistants (Claude Code, Copilot, Cursor, etc.) working on this codebase. It gives you the orientation you need to make correct, minimal changes without breaking the invariants that the architecture depends on.

### Orientation

Read the full [Architecture](architecture.md) document first. The key points:

- **The engine is stateful; everything else is stateless.** `UssdEngine` holds `currentMenu`. Everything above it (stores, composables, components) is reactive state derived from engine output.
- **Adapters are the only code that talks to the network.** Do not add `fetch()` or `XMLHttpRequest` anywhere else.
- **Stores hold state; composables hold logic.** Components call composables. Components do not call stores directly for mutations (they call composable functions that mutate stores).
- **`useSimulator` is the single orchestrator.** It is the only place that builds adapters, drives the session lifecycle, and calls `session.*` mutation methods.

### Layer Contracts

These contracts must not be broken. Verify them before and after any change.

| Contract | Location |
|---|---|
| `UssdAdapter.send()` always returns `Promise<UssdResponse>` or throws | `src/types/ussd.ts` |
| `UssdResponse.type` is always `"CON"` or `"END"` | `src/types/ussd.ts` |
| `sessionStore.status` only advances through the defined state machine | `src/stores/session.ts` |
| `flowStore.flow` is always a valid `FlowDefinition` (post-parse) | `src/stores/flow.ts` → `FlowParser` |
| `FlowParser.parseFlowJson()` never throws — it returns `ParseResult` | `src/engine/FlowParser.ts` |
| `UssdEngine.process()` never throws — it returns a `UssdResponse` for all inputs | `src/engine/UssdEngine.ts` |

### How State Flows

Understanding this prevents the most common mistakes.

```
User presses a key
  → inputValue (ref in useSimulator)

User clicks Send
  → useSimulator.send(inputValue)
    → session.pushInput(trimmed)       ← updates inputLog[]
    → session.addLogEntry(OUT)         ← adds to log[]
    → session.setLoading(true)
    → adapter.send(request)            ← network or engine
      → returns UssdResponse
    → session.addLogEntry(IN)          ← adds to log[]
    → session.setActive(text)          ← or endSession / errorSession
    → session.setLoading(false)
```

The components react to store changes automatically via Vue's reactivity. They do not need to be notified explicitly.

### Coding Rules

Follow these strictly when generating code for this project:

1. **No implicit `any`.** TypeScript strict mode is on. Use explicit types for all function parameters and return values.

2. **No `!` non-null assertions unless the value was just created on the same line.** Use optional chaining (`?.`) or explicit null checks.

3. **No `v-html`.** All user-visible text is plain text. XSS is not a concern in this app but the rule prevents the habit.

4. **No side effects in computed properties.** `computed()` must be pure — read reactive state, return a value. Side effects go in `watch()` or functions.

5. **No store cross-imports.** Stores do not `import` other stores. If coordination is needed, do it in a composable.

6. **Tailwind only.** Do not write `<style>` blocks or inline `style=` attributes. If a utility class doesn't exist, use an arbitrary value (`w-[340px]`) or compose multiple classes.

7. **Dark mode for every new visual element.** Every class that sets a colour needs a `dark:` counterpart. Test with the theme toggle.

8. **Keep components presentational.** A component should not contain decision logic. Move conditionals and transformations to a `computed()` in `<script setup>` or into a composable.

9. **`watch` dependencies must be explicit.** Do not use `watchEffect` unless you have a clear reason — it makes dependency tracking implicit and harder to audit.

10. **Do not modify `UssdEngine.ts` for adapter concerns.** If you need different request/response handling, do it in the adapter. The engine only knows about flow definitions.

### What Not to Touch

These files are stable. Modify them only if the task explicitly requires it, and read the full file before editing.

| File | Why it's sensitive |
|---|---|
| `src/engine/UssdEngine.ts` | Core state machine. A bug here breaks all mock sessions. |
| `src/engine/FlowParser.ts` | Zod schema is the single source of truth for what a valid flow looks like. |
| `src/types/ussd.ts` | Changing these interfaces ripples through every file that imports them. |
| `src/stores/session.ts` | State machine transitions. Adding a new status requires updating `useSimulator` and all components that check `session.status`. |
| `vite.config.ts` | Chunk splitting and proxy config. Build failures here block everyone. |

### Testing Your Changes

There is no automated test suite yet (planned for Phase 4). Test manually:

**After any engine change:**
1. Run `npm run build` — must exit 0.
2. Run `npm run dev`, dial a session in mock mode.
3. Navigate through at least 3 menu levels.
4. Verify `END` sessions close correctly.
5. Verify invalid input shows "Invalid selection" and re-displays the menu.

**After any adapter change:**
1. Test mock mode (MockAdapter path).
2. If you changed HttpAdapter: switch to Live mode, configure a test endpoint, click **Test**, verify the probe result.
3. Test AT format with a backend that speaks the AT protocol.

**After any store change:**
1. Check the Vue DevTools Pinia panel — state should update correctly.
2. Verify the reactive components re-render as expected.

**After any component change:**
1. Toggle dark mode — all new elements must look correct in both themes.
2. Resize the window — check behaviour at `lg` breakpoint (1024px) and below.

**After any `FlowParser` or type change:**
1. Load a valid flow via file upload — it must succeed.
2. Load an intentionally broken flow — errors must appear in the error panel.
3. Load a flow with a broken `next` reference — the specific error must name the offending menu key.

### Common Tasks

#### Add a new field to the flow definition

1. Add the TypeScript field to the relevant interface in `src/types/ussd.ts`.
2. Add the Zod field to the matching schema in `src/engine/FlowParser.ts`.
3. Use the field in `UssdEngine.process()` if it affects routing; use it in a component if it only affects display.
4. Update `docs/flow-definition.md` — add a row to the relevant table and an example.

#### Add a new live-mode setting

1. Add a `ref` and setter function to `src/stores/settings.ts`.
2. Add the UI control to `src/components/simulator/LiveModePanel.vue`.
3. Pass the value to `HttpAdapter` via `buildAdapter()` in `src/composables/useSimulator.ts`.
4. If the setting is relevant to the connection test, add it to `src/composables/useConnectionTest.ts`.

#### Add a new route/view

1. Create the view component in `src/views/`.
2. Add the route to `src/router/index.ts`.
3. Add the nav link to `AppShell.vue`'s nav array (the same pattern as the existing two links).

#### Fix a TypeScript error in a `.vue` file

Vue's template type-checking runs through `vue-tsc` (not just the IDE). If the IDE shows no error but `npm run build` does:
- The error is in the compiled template output.
- Inline arrow functions in templates often cause this — move the function to `<script setup>`.
- Casting with `as HTMLInputElement` inside `@input` handlers is correct and expected.

#### Understand why a session isn't advancing

1. Add a temporary `console.log` in `useSimulator.send()` to log `wireInput` and the response.
2. Check `session.inputLog` in Vue DevTools to verify the cumulative input is correct.
3. Check `adapter` is not `null` at the point of `send()`.
4. Verify `session.status === 'ACTIVE'` — if it's `'END'` or `'ERROR'`, the `canSend` guard blocks the send.
