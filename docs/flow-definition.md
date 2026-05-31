# Flow Definition Reference

A **flow definition** is a JSON document that describes a complete USSD menu tree. The simulator's `FlowParser` validates it with Zod at load time, so structural errors are caught before any session starts.

---

## Top-level Structure

```json
{
  "startMenu": "main",
  "menus": {
    "menuKey": { ... },
    "anotherMenuKey": { ... }
  }
}
```

| Field | Type | Required | Description |
|---|---|---|---|
| `startMenu` | `string` | Yes | Key of the first menu shown when a session is dialed. Must exist in `menus`. |
| `menus` | `Record<string, FlowMenu>` | Yes | Map of all menus. Keys are arbitrary identifiers. |

---

## Menu Object (`FlowMenu`)

```json
{
  "text": "Welcome\n1. Check balance\n2. Send money\n0. Exit",
  "type": "CON",
  "action": "fetchBalance",
  "options": {
    "1": { "next": "balance" },
    "2": { "next": "send_prompt" },
    "0": { "action": "end", "message": "Goodbye." }
  }
}
```

| Field | Type | Required | Description |
|---|---|---|---|
| `text` | `string` | Yes | Text shown on the USSD screen. Use `\n` for line breaks. Supports `{{variableName}}` interpolation. |
| `type` | `"CON" \| "END"` | No | If `"END"`, the session closes after displaying this menu (no further input expected). Defaults to `"CON"`. |
| `action` | `string` | No | Reserved for future dynamic action handlers (e.g., `"fetchBalance"`). Currently stored but not dispatched. |
| `options` | `Record<string, FlowMenuOption>` | No | Maps user input strings to destinations. Omit for terminal menus (`type: "END"`). |

---

## Option Object (`FlowMenuOption`)

```json
{ "next": "balance" }
{ "action": "end", "message": "Thank you. Goodbye." }
{ "next": "confirm", "message": "Proceeding…" }
```

| Field | Type | Required | Description |
|---|---|---|---|
| `next` | `string` | No | Key of the menu to navigate to when this option is selected. Must exist in `menus`. |
| `action` | `string` | No | Set to `"end"` to terminate the session without navigating. |
| `message` | `string` | No | Message to display when `action: "end"`. Defaults to `"Goodbye."`. |

**Rules:**
- An option should have either `next` **or** `action: "end"`, not both.
- If an option has neither, the session ends silently.

---

## Text Interpolation

Menu `text` values support `{{variableName}}` placeholders. Values are injected through `UssdEngine.setVariable(key, value)`.

```json
{
  "text": "Your balance is MWK {{balance}}.\n\n0. Back"
}
```

If a placeholder has no matching variable, it renders as-is: `{{balance}}`. This makes it safe to author flows with dynamic fields before the action handler is wired up.

---

## Validation Rules

The `FlowParser` enforces these rules beyond basic schema validation:

1. `startMenu` must be a key in `menus`.
2. Every `options[key].next` must be a key in `menus`.
3. All fields must match their declared types (Zod enforces this).

Validation errors are displayed in the **Flow Editor** error panel and in the **Settings → General** tab in the simulator.

---

## Complete Example: Mobile Banking Flow

```json
{
  "startMenu": "main",
  "menus": {
    "main": {
      "text": "MyBank USSD\n1. Check balance\n2. Send money\n3. Buy airtime\n0. Exit",
      "options": {
        "1": { "next": "balance" },
        "2": { "next": "send_enter_number" },
        "3": { "next": "airtime_amount" },
        "0": { "action": "end", "message": "Thank you for using MyBank." }
      }
    },

    "balance": {
      "text": "Account Balance\nCurrent: MWK {{balance}}\nAvailable: MWK {{available}}\n\n0. Main menu",
      "options": {
        "0": { "next": "main" }
      }
    },

    "send_enter_number": {
      "text": "Send Money\nEnter recipient phone number:",
      "options": {
        "default": { "next": "send_enter_amount" }
      }
    },

    "send_enter_amount": {
      "text": "Enter amount to send (MWK):",
      "options": {
        "default": { "next": "send_confirm" }
      }
    },

    "send_confirm": {
      "text": "Confirm Transfer\nTo: {{recipient}}\nAmount: MWK {{amount}}\n\n1. Confirm\n2. Cancel",
      "options": {
        "1": { "next": "send_success" },
        "2": { "next": "main" }
      }
    },

    "send_success": {
      "text": "Transfer successful!\nMWK {{amount}} sent to {{recipient}}.\nRef: {{reference}}",
      "type": "END"
    },

    "airtime_amount": {
      "text": "Buy Airtime\nEnter amount (MWK 50 - 5000):",
      "options": {
        "default": { "next": "airtime_confirm" }
      }
    },

    "airtime_confirm": {
      "text": "Buy MWK {{amount}} airtime?\n\n1. Confirm\n2. Cancel",
      "options": {
        "1": { "next": "airtime_success" },
        "2": { "next": "main" }
      }
    },

    "airtime_success": {
      "text": "MWK {{amount}} airtime purchased successfully.",
      "type": "END"
    }
  }
}
```

---

## Common Patterns

### Terminal menu (no input expected)

```json
"goodbye": {
  "text": "Thank you. Goodbye.",
  "type": "END"
}
```

### Back navigation

Link the `0` option back to a parent menu. The engine navigates freely between any menu keys, so circular links work correctly.

```json
"submenu": {
  "text": "Sub Menu\n1. Option A\n0. Back",
  "options": {
    "1": { "next": "option_a" },
    "0": { "next": "main" }
  }
}
```

### Exit from an option directly

Use `action: "end"` on an option to terminate the session without navigating to another menu:

```json
"0": { "action": "end", "message": "Session ended. Dial *123# to restart." }
```

### Multi-step data collection

Collect multiple inputs by chaining menus. In the mock engine, the selections are not stored — use `{{variableName}}` with `setVariable()` in a real backend. In mock mode placeholders simply render unfilled.

```json
"step1": {
  "text": "Enter your PIN:",
  "options": { "default": { "next": "step2" } }
},
"step2": {
  "text": "Enter amount:",
  "options": { "default": { "next": "step3" } }
}
```

> **Note on `default`:** The current mock engine matches options by exact string. A key named `"default"` is treated literally — users must type the word "default" to trigger it. In practice, multi-step collection is best tested in live mode where the real backend interprets free-text input. A future engine version will support wildcard matching.

---

## Loading a Flow

### Via file upload (Simulator view)

Settings → General → **Load JSON** → Choose file.

### Via the Flow Editor

Navigate to **Flow Editor**, paste or edit JSON in the Monaco editor, then click **Apply**. Changes take effect on the next session dial.

### Via the URL (Phase 4 — planned)

Shareable flow URLs will be added in Phase 4.

---

## Schema (TypeScript)

```ts
interface FlowDefinition {
  startMenu: string
  menus: Record<string, FlowMenu>
}

interface FlowMenu {
  text: string
  type?: 'CON' | 'END'
  action?: string
  options?: Record<string, FlowMenuOption>
}

interface FlowMenuOption {
  next?: string
  action?: string
  message?: string
}
```
