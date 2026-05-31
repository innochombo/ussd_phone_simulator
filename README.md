# USSD Phone Simulator

A browser-based USSD session simulator built with Vue 3, TypeScript, and Monaco Editor.

**[Launch the simulator →](https://ussd-phone-simulator.vercel.app/)**

Test and debug USSD menu flows without a physical handset or carrier connection — run entirely offline with a mock engine, or point it at a real backend.

---

## Live Demo

**[https://ussd-phone-simulator.vercel.app/](https://ussd-phone-simulator.vercel.app/)**

The deployed version runs in full mock mode by default. To connect a real backend, open **Settings → Live mode**, enter your endpoint URL, and switch the mode toggle in the top bar to **Live**.

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

## Quick Start (local)

```bash
git clone https://github.com/innochombo/ussd_phone_simulator.git
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
│   │   ├── MonacoEditor.vue   # Monaco wrapper
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

## Connecting a PHP Backend

If you are using the [php-ussd-framework](https://github.com/innochombo/php-ussd-framework):

1. Set `'gateway' => JsonDriver::class` in `config/app.php`.
2. Ensure `CorsMiddleware` is registered in `app.php` with `allow_origins: ['https://ussd-phone-simulator.vercel.app']`.
3. In the simulator's **Live mode** tab, set the endpoint URL to your backend and select **JSON** format.

For local development, use the Vite dev proxy to avoid CORS. See [Live Mode Setup](docs/live-mode.md) for details.

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
