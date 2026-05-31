# Usage Guide

This guide walks through every part of the simulator from first run to connecting a real backend.

---

## Starting the App

```bash
npm install   # first time only
npm run dev
```

Open [http://localhost:5173](http://localhost:5173). You'll land on the **Simulator** view.

---

## The Simulator View

The view is split into two columns:

- **Left** — the phone handset
- **Right** — session log and settings panels

### The Phone Handset

The handset is a styled shell that wraps three functional areas:

#### Screen (`UssdScreen`)

Displays the current session state:

| State | What you see |
|---|---|
| `IDLE` | "Dial a USSD code to begin" |
| `DIALING` | "Connecting…" (pulsing) |
| `ACTIVE` | The menu text from the backend or engine |
| `END` | The final message; session is closed |
| `ERROR` | The error message |

A small blinking cursor appears while a request is in-flight.

#### Keypad + Input Bar (`InputBar`)

- **Service code field** — edit the USSD code (e.g., `*123#`) before dialing. Locked during an active session.
- **Dial / End button** — green when idle, red when active.
- **Text input** — type or paste your selection. Press Enter or click **Send**.
- **3×4 keypad** — tap keys to append digits to the text input.
- **⌫ Clear last** — removes the last character from the text input.
- **MSISDN field** — the simulated phone number sent with every request. Editable when idle.

### Session Log

Chat-bubble style log. User input appears on the right in blue; server responses appear on the left in grey. Each bubble shows the timestamp and (for responses) the `CON`/`END` type badge.

---

## Running Your First Mock Session

The app ships with a built-in demo flow. No configuration is needed.

1. Check that the **Mock** badge is visible in the top bar (if it says **Live**, click **Switch to Mock**).
2. Press **Dial** on the phone.
3. The screen shows the main menu.
4. Press a keypad digit (e.g., `1`) or type it in the text input, then press **Send** or **Enter**.
5. Navigate through the flow. When a menu has `type: "END"`, the session closes automatically.
6. Press **End** at any point to hang up and reset to idle.

---

## Settings — General Tab

Open the **General** tab in the right panel's settings card.

| Setting | What it does |
|---|---|
| **Mock delay** | Artificial latency added to every mock response. Drag the slider between 0 and 3000ms. Use a realistic value (300–800ms) to surface timing-sensitive UX issues. |
| **Flow** | Shows the name of the currently loaded flow. Click **Reset** to restore the built-in demo. |
| **Load JSON** | Upload a `.json` flow file. See [Flow Definition Reference](flow-definition.md) for the format. |

---

## Loading a Custom Flow

You can load a custom flow in two ways:

### Option A — File upload (Simulator view)

1. Settings → General → **Load JSON** → choose a `.json` file.
2. The flow name updates to the filename.
3. The next session uses the new flow. Active sessions are not affected.

### Option B — Flow Editor

1. Click **Flow Editor** in the top nav.
2. Paste or type your JSON in the Monaco editor on the left.
3. Errors appear in the red panel below the editor as you type.
4. When the JSON is valid, click **Apply** in the toolbar.
5. Return to **Simulator** and dial.

---

## The Flow Editor View

The editor is split into two panes with a toggle at the top: **Split** (default), **Editor** (editor only), **Preview** (preview only).

### Flow Editor Pane

- Full Monaco editor with JSON syntax highlighting.
- Live Zod validation on every keystroke — errors shown below.
- **Format** — auto-formats the JSON (equivalent to Prettier).
- **Revert** — discards your edits and restores the last applied version.
- **Apply** — validates and loads the edited JSON as the active flow. The button is disabled if there are validation errors.
- An **unsaved** badge appears in the toolbar when your edits differ from the applied flow.

### Flow Preview Pane

An interactive tree of your flow starting from `startMenu`.

- **Green nodes** — `CON` menus (session continues).
- **Grey nodes** — `END` menus (session terminates).
- **Option labels** — the input string that triggers each branch (e.g., `1`, `0`).
- **↺ menuKey** — a back-link to an already-visited menu (cycle detection).

**Click any node** to open the detail panel on the right:
- Screen text preview (exactly what the user sees)
- Type badge (`CON` / `END`)
- Clickable option list — click a destination to jump to that node

---

## Switching Between Mock and Live Mode

The mode badge in the top bar shows the current mode. Click **Switch to Live** / **Switch to Mock** to toggle.

- **Mock** — all sessions run through the local `UssdEngine` using the loaded flow. No network requests are made.
- **Live** — all sessions send real HTTP requests to the configured endpoint. The loaded flow is ignored.

When you switch to Live, the **Live mode** tab in the settings panel becomes relevant.

---

## Settings — Live Mode Tab

See [Live Mode Setup](live-mode.md) for the complete guide. Quick summary:

| Setting | Description |
|---|---|
| **Endpoint URL** | The HTTP URL your USSD backend listens on |
| **Test** | Sends a probe request and shows the HTTP status or error |
| **Request format** | `JSON` or `Africa's Talking` |
| **Network code** | Carrier code sent in AT requests (e.g., `63902` for Airtel Malawi) |
| **Timeout** | How long to wait before aborting a request (1–30s) |
| **Custom headers** | JSON object of additional HTTP headers (e.g., `Authorization`) |

---

## Common Workflows

### Workflow: Author a flow from scratch

1. Open **Flow Editor**.
2. In the **Editor** pane, clear the existing JSON and start with the minimal template:
   ```json
   {
     "startMenu": "main",
     "menus": {
       "main": {
         "text": "Welcome\n1. Option A\n0. Exit",
         "options": {
           "1": { "next": "option_a" },
           "0": { "action": "end", "message": "Bye." }
         }
       },
       "option_a": {
         "text": "You chose Option A.",
         "type": "END"
       }
     }
   }
   ```
3. Watch the **Preview** pane update in real time.
4. Click **Apply**, switch to **Simulator**, dial.

### Workflow: Test a flow against a real backend

1. Ensure your backend is running locally.
2. Switch to **Live** mode.
3. Open **Settings → Live mode**.
4. Set the **Endpoint URL** to your backend.
5. Select the correct **Request format** (Africa's Talking or JSON).
6. Click **Test** — verify it returns HTTP 200.
7. Press **Dial** in the simulator.

### Workflow: Reproduce a bug

1. Note the exact sequence of inputs a user reported.
2. Load the relevant flow version.
3. Dial and replay the inputs one by one.
4. Check the **Session log** for the full request/response trail.
5. If the bug only appears against the live backend, switch to **Live** mode.

### Workflow: Demo a flow to a stakeholder

1. Open the simulator on a large screen.
2. Load the production flow JSON.
3. Walk through the flow using the keypad for a realistic handset feel.
4. The Session log acts as a live transcript.

---

## Keyboard Shortcuts

| Key | Action |
|---|---|
| `Enter` | Send the current input value |
| Type digits | Appear directly in the text input when focused |

The text input is automatically focused after each send.
