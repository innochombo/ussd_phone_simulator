# Changelog

All notable changes to USSD Phone Simulator are documented here.
Format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).

---

## [1.0.0] — 2026-05-31

First full release of the USSD Phone Simulator — a browser-based tool for
testing USSD flows without a physical handset or carrier connection.

**Live:** [https://ussd-phone-simulator.vercel.app/](https://ussd-phone-simulator.vercel.app/)

---

### Added

#### Phase 1 — Core simulator

The foundational state machine and handset UI.

- **`UssdEngine`** — core CON/END state machine. Processes menu navigation,
  option matching, `{{variable}}` interpolation, and invalid-input re-display.
- **`FlowParser`** — Zod-validated JSON → `FlowDefinition`. Catches broken
  `next` references by name so errors are visible at load time, not at runtime.
- **`MockAdapter`** — offline engine wrapper with configurable simulated network
  delay (0–3000 ms). Hot-swaps the flow definition without resetting the session.
- **`PhoneFrame`** — styled handset shell.
- **`UssdScreen`** — live screen display with status indicator (`IDLE`,
  `DIALING`, `ACTIVE`, `END`, `ERROR`) and in-flight loading cursor.
- **`InputBar`** — 3×4 keypad, text input, Dial/End buttons, MSISDN field.
- **`SessionLog`** — chat-bubble styled request/response history with timestamp
  and `CON`/`END` type badge per entry.
- **Pinia stores** — `sessionStore` (lifecycle, log, cumulative input),
  `flowStore` (definition, validation errors, default demo flow), `settingsStore`
  (MSISDN, mode, delay, theme, live-mode config).
- **`useSimulator`** composable — single orchestrator for `dial()`, `send()`,
  and `hangUp()` across mock and live adapters.
- **Default demo flow** — 9-menu banking flow (balance, send money, account
  settings) loaded on first run with no configuration.

#### Phase 2 — Flow Editor

In-browser JSON editor and live tree preview.

- **`MonacoEditor`** — thin Vue 3 wrapper around Monaco Editor. Exposes
  `format()` and `focus()`. Configured for JSON with syntax highlighting,
  word wrap, and `automaticLayout`.
- **`FlowEditor`** — Monaco panel with live Zod validation on every keystroke,
  unsaved indicator, and Format / Revert / Apply toolbar. Apply is disabled
  while validation errors are present.
- **`FlowNode`** — recursive tree node component. Traverses `next` links
  depth-first and renders `↺ menuKey` back-link markers to break cycles,
  preventing infinite recursion.
- **`FlowPreview`** — interactive flow graph starting from `startMenu`. Green
  nodes = CON, grey = END. Click any node to open a detail side panel showing
  the screen text, type badge, and clickable option list.
- **`EditorView`** — split-pane layout with Split / Editor / Preview switcher.
- Monaco chunk split — `vite.config.ts` configured with `manualChunks` to keep
  the Monaco bundle (~3.8 MB) separate from the 94 KB app chunk.

#### Phase 3 — Live mode

Full live backend integration with two wire formats.

- **`HttpAdapter`** — two wire formats selectable per session:
  - **JSON** — `POST application/json` with `{sessionId, serviceCode, msisdn, input}`;
    expects `{type, message, sessionId}` JSON response.
  - **Africa's Talking** — `POST application/x-www-form-urlencoded` with
    `{sessionId, phoneNumber, serviceCode, networkCode, text}`; parses
    `CON …` / `END …` plain-text response.
  - `AbortController` timeout with configurable `requestTimeoutMs`.
  - Custom HTTP headers passed on every request.
- **Cumulative input tracking** — `sessionStore` maintains `inputLog[]` and
  `cumulativeInput()` so the AT `text` field grows correctly with each step
  (`1`, `1*2`, `1*2*3`).
- **`useConnectionTest`** composable — probe request with `TestStatus`
  (`idle | testing | ok | error`). Distinguishes timeout, network/CORS error,
  and non-2xx HTTP status with specific messages.
- **`LiveModePanel`** — endpoint URL + Test button (with result badge), format
  selector (JSON / Africa's Talking), network code field, timeout slider
  (1–30 s), custom headers JSON textarea, and CORS proxy tip.
- **Vite dev proxy** — `server.proxy` in `vite.config.ts` forwards
  `/ussd-proxy/*` → `VITE_PROXY_TARGET` server-side, bypassing browser CORS.
  Configured via `.env.local`.
- **`.env.example`** — documents `VITE_PROXY_TARGET`.
- **Settings panel tabs** — General (mock settings, flow) and Live mode tabs
  with an inactive warning when not in live mode.

#### Phase 4 — Polish

- **Phone skins** — five selectable handset colour themes: Slate (default),
  Midnight, Rose, Forest, Sand. Colour swatches in Settings → General; skin
  persists in `settingsStore`. `PhoneFrame` binds skin class strings from
  `src/types/skins.ts` with smooth `transition-colors`.
- **Session replay** — `useSessionReplay` composable feeds log entries back
  one at a time (800 ms apart) into a reactive array. `SessionLog` shows
  ▶ Replay when the session is ended and ■ Stop during playback.
- **Export session log** — `useSessionExport` composable. Two formats:
  - **JSON** — full structured log array with metadata.
  - **Plain text** — human-readable conversation transcript.
  Download triggered via `Blob` + `URL.createObjectURL`. Export dropdown
  appears in the Session Log header once the log has entries.
- **Shareable flow URLs** — `useShareableUrl` composable encodes the active
  flow JSON as base64url in the URL hash (`#flow=…`). Copy link button in
  Settings → General and in the Flow Editor toolbar. On startup, `main.ts`
  calls `loadFromHash()` to silently restore a shared flow.
- **Dark mode fix** — Tailwind CSS v4 requires an explicit
  `@custom-variant dark (&:where(.dark, .dark *))` directive for class-based
  dark mode. Added to `src/style.css`. All `dark:` variants now respond
  correctly to the theme toggle.

#### Responsive layout (mobile)

- **Hamburger menu** — below `md` breakpoint the nav links and Switch button
  are hidden. A three-bar icon animates to ✕ when open. Tapping it opens a
  slide-down popover with nav links, mode badge, Switch button, and Close.
  A full-screen backdrop dismisses it on outside tap; route navigation closes
  it automatically.
- **Editor split direction** — in Split mode, panels stack vertically (`flex-col`)
  on mobile with a horizontal divider, and sit side-by-side (`md:flex-row`)
  on tablet and up.
- **Phone frame** — `w-[340px]` → `w-full max-w-[340px]` so the handset
  shrinks cleanly on screens narrower than 340 px.
- **Simulator layout** — reduced padding and gap on mobile; phone centres
  itself when stacked.

#### About page (`/about`)

- Creator section with photo (`public/creator.jpg`), name
  (**Innocent E Chombo**), role (Software Engineer), and project description.
- Simulator and Framework documentation grids — direct links to every
  doc file on GitHub.
- Repository buttons — Simulator repo, Framework repo, Launch simulator.
- Tech stack pills (Vue 3, TypeScript, Pinia, Tailwind CSS, Monaco Editor,
  Zod, Vite).
- Added to both desktop nav and mobile hamburger popover.

#### Documentation

- **README.md** — project overview, feature table, quick start, full directory
  tree, docs index, tech stack table, scripts, and deployed simulator link.
- **docs/architecture.md** — layered diagram, session state machine, CON/END
  contract, engine/adapter/store/composable layer explanations, key design
  decisions.
- **docs/flow-definition.md** — complete JSON schema reference, field tables,
  validation rules, full banking flow example, common patterns.
- **docs/usage-guide.md** — step-by-step walkthrough of simulator, flow editor,
  live mode; five concrete workflows.
- **docs/live-mode.md** — JSON and AT wire format specs, Vite proxy setup,
  CORS header config, auth headers, timeout, network code table,
  php-ussd-framework quickstart.
- **docs/contributing.md** — dual-audience guide: human section (conventions,
  how to add features, PR checklist) and AI section (layer contracts, state
  flow diagram, 10 coding rules, what-not-to-touch list, manual test
  checklists, task recipes).

---

### Technical notes

- **Zero runtime dependencies** beyond Vue 3 ecosystem packages.
- **TypeScript strict mode** throughout — no implicit `any`, no unsafe null
  access.
- Build output: ~94 KB app chunk + ~3.8 MB Monaco chunk (gzipped: ~30 KB
  + ~985 KB). Monaco is loaded lazily when the Flow Editor is first mounted.
- Tailwind CSS v4 with `@custom-variant dark` for class-based theming.
- Vite `manualChunks` and `chunkSizeWarningLimit: 4500` configured to
  silence expected Monaco size warnings.
