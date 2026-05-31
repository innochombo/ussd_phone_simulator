# Architecture

## Overview

The simulator is built around a strict separation between the **engine** (how USSD logic works), the **adapters** (who handles the request), the **stores** (what state is held), and the **components** (how that state is rendered). None of these layers know about each other's internals — they communicate only through well-typed interfaces.

```
┌─────────────────────────────────────────────────┐
│                   Vue Components                 │
│   PhoneFrame  UssdScreen  InputBar  SessionLog   │
└────────────────────┬────────────────────────────┘
                     │ calls
┌────────────────────▼────────────────────────────┐
│              useSimulator (composable)            │
│  dial()  send()  hangUp()  inputValue  canSend   │
└────────────────────┬────────────────────────────┘
                     │ reads/writes
         ┌───────────▼───────────┐
         │     Pinia Stores      │
         │  session  flow  settings│
         └───────────┬───────────┘
                     │ dispatches to
         ┌───────────▼───────────┐
         │    UssdAdapter        │
         │  MockAdapter          │  ←─ UssdEngine (offline)
         │  HttpAdapter          │  ←─ fetch() (live)
         └───────────────────────┘
```

---

## USSD Session State Machine

A USSD session follows a strict linear lifecycle. The `sessionStore` owns this state:

```
IDLE ──dial()──► DIALING ──response──► ACTIVE ──CON──► ACTIVE
                                              │
                                              └──END──► END
                                              └──error─► ERROR
```

| State | Meaning |
|---|---|
| `IDLE` | No session. Dial button is enabled. |
| `DIALING` | Initial request in-flight; screen shows "Connecting…" |
| `ACTIVE` | Session live; input bar and keypad are enabled. |
| `END` | Backend returned `END` response; session is closed. |
| `ERROR` | Network or protocol error; message shown on screen. |

Only `IDLE` and `END`/`ERROR` allow a new dial. Any other transition from these states is a no-op in `useSimulator`.

---

## The `CON` / `END` Contract

Every response from either adapter carries exactly one of two types:

- **`CON`** — the session continues; display the message and wait for input.
- **`END`** — the session is terminated; display the final message. No further input is accepted.

The `UssdScreen` component renders purely from `session.currentText` and `session.status`. It knows nothing about flow logic. This means the same screen component works identically in mock and live mode.

---

## Engine Layer (`src/engine/`)

### `UssdEngine`

A simple class that holds a `FlowDefinition` and a pointer to the current menu key. On each `process(req)` call it:

1. Looks up the current menu.
2. If input is empty (initial dial), returns the menu text as a `CON` response (or `END` if `type: 'END'`).
3. Looks up the option matching `req.input`.
4. If no match, returns the current menu text again with an "Invalid selection" prefix.
5. If the option has `action: 'end'`, returns an `END` response.
6. If the option has `next`, advances `currentMenu` and returns the next menu's text.

The engine interpolates `{{variableName}}` placeholders against a variables map (settable via `setVariable()`). This supports dynamic values injected by custom action handlers in future phases.

### `FlowParser`

Wraps `UssdEngine` initialization in a Zod schema parse so invalid JSON is caught at load time rather than at runtime. It:

1. Validates the raw object against the `FlowDefinitionSchema`.
2. Checks that `startMenu` refers to an existing menu key.
3. Checks that every `next` pointer refers to an existing menu key.

Returns a `ParseResult: { ok, flow?, errors[] }`. The `flowStore` uses this to set `validationErrors`.

---

## Adapter Layer (`src/adapters/`)

Both adapters implement the same interface:

```ts
interface UssdAdapter {
  send(req: UssdRequest): Promise<UssdResponse>
  reset(): void
}
```

### `MockAdapter`

Wraps `UssdEngine`. The only addition is a configurable `delayMs` artificial pause (via `setTimeout`) to simulate real network latency. Call `updateFlow(flow)` to hot-swap the flow definition without resetting the session.

### `HttpAdapter`

Supports two wire formats (selected by `settings.requestFormat`):

**JSON format** — sends a JSON body, expects a JSON response:

```
POST /ussd
Content-Type: application/json

{ "sessionId": "...", "serviceCode": "*123#", "msisdn": "265888000001", "input": "1" }

→ { "type": "CON", "message": "...", "sessionId": "..." }
```

**Africa's Talking format** — sends form-encoded body, expects plain-text response:

```
POST /ussd
Content-Type: application/x-www-form-urlencoded

sessionId=...&serviceCode=*123%23&phoneNumber=%2B265888000001&networkCode=63902&text=1

→ CON Choose an option:
   1. Balance
   2. Send money
```

The AT `text` field is the full cumulative input joined by `*` (e.g., after three selections: `1*2*3`). The `sessionStore` maintains this via `inputLog[]` and `cumulativeInput()`.

Timeouts are implemented with `AbortController` — the fetch is aborted after `settings.requestTimeoutMs` milliseconds. Custom request headers are passed through on every request.

---

## Store Layer (`src/stores/`)

### `sessionStore`

Owns the runtime state of the active USSD session:

| Field | Type | Purpose |
|---|---|---|
| `sessionId` | `string \| null` | Current session identifier |
| `status` | `SessionStatus` | State machine state |
| `currentText` | `string` | What's shown on the screen |
| `log` | `SessionLogEntry[]` | Full request/response history |
| `inputLog` | `string[]` | Raw inputs (for AT cumulative text) |
| `isLoading` | `boolean` | True while a request is in-flight |

### `flowStore`

Owns the loaded flow definition:

| Field | Type | Purpose |
|---|---|---|
| `flow` | `FlowDefinition` | Parsed, validated flow graph |
| `rawJson` | `string` | Source JSON for the Monaco editor |
| `validationErrors` | `string[]` | Errors from the last `loadFromJson()` call |
| `flowName` | `string` | Display name (file name or "Default Demo Flow") |

### `settingsStore`

Owns simulator configuration:

| Field | Type | Purpose |
|---|---|---|
| `msisdn` | `string` | Simulated phone number |
| `serviceCode` | `string` | USSD code being dialed |
| `mode` | `'mock' \| 'live'` | Which adapter to use |
| `delayMs` | `number` | Artificial latency for mock mode |
| `requestFormat` | `'json' \| 'africas-talking'` | Wire format for live mode |
| `networkCode` | `string` | Carrier code sent in AT format |
| `requestTimeoutMs` | `number` | Fetch abort timeout |
| `customHeadersRaw` | `string` | JSON string of extra HTTP headers |
| `theme` | `'light' \| 'dark'` | UI theme |

---

## Composable Layer (`src/composables/`)

### `useSimulator`

The only composable that touches the adapter. It:

- Builds the adapter (`MockAdapter` or `HttpAdapter`) based on current settings at dial time.
- Manages the `dial()` / `send()` / `hangUp()` operations.
- Updates `sessionStore` after each response.
- Calls `session.pushInput(trimmed)` before sending so `cumulativeInput()` is available.
- Passes `cumulativeInput()` as the wire input for AT requests, and the bare trimmed input for JSON/mock requests.
- Watches `flow.flow` to hot-swap `MockAdapter.updateFlow()` when the editor applies a change.
- Watches live settings to null out `adapter` when settings change while idle, ensuring the next dial picks up the new configuration.

### `useConnectionTest`

A one-shot probe composable. It sends a minimal initial request (empty `text`/`input`) to the configured endpoint and reports `TestStatus` back to `LiveModePanel`. It distinguishes three error categories:

- `AbortError` → timeout message
- `TypeError` with "fetch" → network/CORS error
- Non-2xx HTTP → status code message

---

## Editor Layer (`src/components/editor/`)

The editor is fully independent of the simulator — it reads from and writes to `flowStore` only. The simulator then reacts to `flow.flow` changes via the `useSimulator` watcher.

### `FlowNode` (recursive)

`FlowPreview` renders the flow graph by recursively mounting `FlowNode` components. A `visited: Set<string>` prop is passed down at each level to detect cycles — a back-link is rendered as an `↺ menuKey` label instead of recursing again, preventing infinite depth.

---

## Key Design Decisions

### Flow-as-data, not flow-as-code

Menu logic lives entirely in a JSON object. Components and the engine never contain business logic. This makes the flow portable, editable at runtime, and validatable with a schema without modifying any Vue code.

### Adapters are stateless from the component's perspective

`useSimulator` builds a fresh adapter on each `dial()` call (or reuses the existing one if settings haven't changed). Components never hold adapter references — they only call composable functions. This makes it trivial to switch between mock and live in the middle of a test session.

### `CON`/`END` is the rendering boundary

`UssdScreen` only ever needs `session.status` and `session.currentText`. All business logic — option routing, cumulative input, format negotiation — stays below the composable boundary. The component is purely presentational.

### Session history as a stack

`session.history` is maintained as a push/pop stack for future "Back" button support. In the current engine the stack isn't used for routing (the engine handles state internally), but it will be used for a UI-level back button in Phase 4.
