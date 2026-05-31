# USSD Phone Simulator

A browser-based USSD session simulator built with Vue 3, TypeScript, and Monaco Editor. Test and debug USSD menu flows without a physical handset or carrier connection — entirely offline with a mock engine, or against a real backend.

---

## Features

| Feature | Description |
|---|---|
| **Mock engine** | Full offline simulation driven by a JSON flow definition |
| **Live mode** | Forward requests to a real USSD backend endpoint |
| **Africa's Talking format** | First-class support for the AT wire protocol (form-encoded, cumulative text field) |
| **JSON format** | Generic JSON request/response for custom backends |
| **Flow Editor** | Monaco-powered JSON editor with live Zod schema validation |
| **Flow Preview** | Interactive tree visualization of your menu graph with click-to-inspect |
| **Session log** | Chat-bubble styled request/response history per session |
| **CORS proxy** | Built-in Vite dev-server proxy for CORS-restricted backends |
| **Dark mode** | Full light/dark theme toggle |
| **Connection tester** | One-click probe to verify the live endpoint is reachable |

---

## Quick Start

```bash
git clone https://github.com/your-org/ussd_phone_simulator.git
cd ussd_phone_simulator
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173). The simulator loads with a built-in demo flow — press **Dial** to start a session immediately.

---

## Project Structure

```
src/
├── types/ussd.ts              # Shared TypeScript interfaces
├── engine/
│   ├── UssdEngine.ts          # Core CON/END state machine
│   └── FlowParser.ts          # Zod-validated JSON → FlowDefinition
├── adapters/
│   ├── MockAdapter.ts         # Offline engine wrapper (configurable delay)
│   └── HttpAdapter.ts         # Live backend proxy (JSON + AT formats)
├── stores/
│   ├── session.ts             # Session lifecycle, log, cumulative input
│   ├── flow.ts                # Loaded flow definition + validation errors
│   └── settings.ts            # MSISDN, mode, theme, live-mode config
├── composables/
│   ├── useSimulator.ts        # Orchestrates dial / send / hangUp
│   └── useConnectionTest.ts   # One-shot endpoint probe
├── components/
│   ├── simulator/
│   │   ├── PhoneFrame.vue     # Handset shell skin
│   │   ├── UssdScreen.vue     # Live screen display
│   │   ├── InputBar.vue       # Keypad + text input + dial/end
│   │   ├── SessionLog.vue     # Chat-bubble log
│   │   └── LiveModePanel.vue  # Live mode settings panel
│   ├── editor/
│   │   ├── MonacoEditor.vue   # Monaco wrapper (exposes format/focus)
│   │   ├── FlowEditor.vue     # JSON editor with toolbar + error panel
│   │   ├── FlowPreview.vue    # Tree + detail side panel
│   │   └── FlowNode.vue       # Recursive tree node component
│   └── layout/
│       └── AppShell.vue       # Topbar + router nav
├── views/
│   ├── SimulatorView.vue      # Main simulator layout
│   └── EditorView.vue         # Split editor/preview layout
└── router/index.ts
```

---

## Documentation

| Document | Description |
|---|---|
| [Architecture](docs/architecture.md) | System design, state machine, adapter pattern, design decisions |
| [Flow Definition Reference](docs/flow-definition.md) | JSON schema, all fields, examples, best practices |
| [Usage Guide](docs/usage-guide.md) | Step-by-step walkthrough: simulator, editor, live mode |
| [Live Mode Setup](docs/live-mode.md) | Backends, wire formats, CORS proxy, auth headers |
| [Contributing](docs/contributing.md) | How to contribute — guides for humans and AI assistants |

---

## Tech Stack

| Concern | Library | Version |
|---|---|---|
| Framework | Vue 3 + Composition API | ^3.5 |
| State | Pinia | ^2.3 |
| Routing | Vue Router | ^4.5 |
| Styling | Tailwind CSS | ^4.1 |
| Validation | Zod | ^3.24 |
| Editor | Monaco Editor | ^0.52 |
| Build | Vite | ^6.3 |

---

## Scripts

```bash
npm run dev      # Start dev server with HMR
npm run build    # Type-check + production build
npm run preview  # Preview the production build locally
```

---

## License

See [LICENSE](LICENSE).
