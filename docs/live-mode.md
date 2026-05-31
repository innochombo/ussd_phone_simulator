# Live Mode Setup

Live mode forwards every USSD session request to a real HTTP endpoint instead of the local mock engine. This lets you test your actual backend code with realistic session flow and timing.

---

## Enabling Live Mode

Click **Switch to Live** in the top-right of the app header. The mode badge changes from green (Mock) to orange (Live). From this point, pressing **Dial** sends real HTTP requests.

---

## Request Formats

The simulator supports two wire formats. Choose the one your backend expects.

### JSON Format

Use this for custom backends or for backends that speak the simulator's native protocol.

**Request** — `POST` with `Content-Type: application/json`:

```json
{
  "sessionId": "3f7a1c2e-...",
  "serviceCode": "*123#",
  "msisdn": "265888000001",
  "input": "1"
}
```

| Field | Description |
|---|---|
| `sessionId` | UUID generated at session start; same value for all requests in a session |
| `serviceCode` | The USSD code being dialed |
| `msisdn` | The simulated phone number (no `+` prefix) |
| `input` | The user's input for this step (`""` for the initial dial) |

**Response** — `200 OK` with `Content-Type: application/json`:

```json
{
  "type": "CON",
  "message": "Welcome\n1. Balance\n2. Send money",
  "sessionId": "3f7a1c2e-..."
}
```

| Field | Description |
|---|---|
| `type` | `"CON"` to continue the session, `"END"` to close it |
| `message` | The text to display on the USSD screen |
| `sessionId` | Echo back the same session ID |

### Africa's Talking Format

Use this when your backend is built for Africa's Talking or any gateway that uses the same wire protocol (Safaricom, NALO, JamboPay, etc.).

**Request** — `POST` with `Content-Type: application/x-www-form-urlencoded`:

```
sessionId=3f7a1c2e-...&serviceCode=*123%23&phoneNumber=%2B265888000001&networkCode=63902&text=1
```

| Field | Description |
|---|---|
| `sessionId` | UUID generated at session start |
| `serviceCode` | The USSD code |
| `phoneNumber` | The MSISDN with `+` prefix (e.g., `+265888000001`) |
| `networkCode` | Carrier MNC (set in the **Network code** field) |
| `text` | **Cumulative** user input, each step joined by `*` |

**The `text` field** is the key difference from JSON format. For each step in the session it grows:

| Step | User presses | `text` sent |
|---|---|---|
| 1 (dial) | — | `""` (empty) |
| 2 | `1` | `"1"` |
| 3 | `2` | `"1*2"` |
| 4 | `0` | `"1*2*0"` |

Your backend receives the full history in every request, which is the standard AT session pattern.

**Response** — `200 OK` with `Content-Type: text/plain`:

```
CON Welcome to MyBank
1. Check balance
2. Send money
0. Exit
```

or

```
END Thank you. Goodbye.
```

The response must start with `CON ` (including a trailing space) or `END ` (including a trailing space). Everything after the prefix is the message text, which may contain `\n` newlines.

---

## CORS and the Dev Proxy

Browsers block cross-origin requests to backends that don't send CORS headers. This is a common problem when your USSD backend runs on a different port or domain.

### Using the Vite Dev Proxy (Recommended)

The dev server has a built-in reverse proxy that forwards requests server-side, bypassing browser CORS restrictions entirely.

**Step 1** — Create `.env.local` (gitignored):

```bash
cp .env.example .env.local
```

**Step 2** — Set `VITE_PROXY_TARGET` to your backend's base URL:

```env
VITE_PROXY_TARGET=http://localhost:8000
```

**Step 3** — Restart the dev server:

```bash
npm run dev
```

**Step 4** — In the **Live mode** settings panel, set the endpoint URL to:

```
http://localhost:5173/ussd-proxy/ussd
```

Replace `/ussd` with your backend's actual path. The Vite proxy strips `/ussd-proxy` and forwards to `http://localhost:8000/ussd`.

**How it works:**

```
Browser → /ussd-proxy/ussd → Vite dev server → http://localhost:8000/ussd → Backend
```

The request arrives at your backend from the same machine, with no CORS issues.

### Adding CORS Headers to Your Backend (Alternative)

If you prefer to configure CORS on the backend directly, add these response headers:

```
Access-Control-Allow-Origin: http://localhost:5173
Access-Control-Allow-Methods: POST, OPTIONS
Access-Control-Allow-Headers: Content-Type, Authorization
```

For PHP (using the php-ussd-framework):

```php
header('Access-Control-Allow-Origin: http://localhost:5173');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}
```

---

## Authentication and Custom Headers

If your backend requires authentication tokens, API keys, or other custom headers, set them in the **Custom headers** field in the Live mode panel.

The field accepts a JSON object:

```json
{
  "Authorization": "Bearer eyJhbGci...",
  "X-Api-Key": "sk-live-abc123",
  "X-Tenant-Id": "malawi-bank"
}
```

These headers are merged into every request (both the probe and session requests). They are stored in memory only — they are not persisted across page reloads.

---

## Connection Testing

Before dialing a live session, click **Test** next to the endpoint URL. The probe:

1. Sends an initial-dial request (empty `text`/`input`) with your current settings.
2. Reports the HTTP status code if the server responds.
3. Reports the specific error if not:
   - **Timeout** — server didn't respond within the configured timeout
   - **Network error / CORS** — the request couldn't reach the server (check the proxy setup)
   - **HTTP 4xx / 5xx** — server responded but with an error status

A green ✓ OK badge means the endpoint is reachable. Your backend may still return a valid USSD response (CON or END) on the probe — this is expected and harmless.

---

## Timeout Configuration

The **Timeout** slider in the Live mode panel sets how long the simulator waits for a response before aborting with an error. Range: 1–30 seconds. Default: 10 seconds.

For production backends with database queries, set this to at least 5 seconds. For very slow networks or complex queries, 15–20 seconds is reasonable.

When a request times out, the session enters the `ERROR` state and the screen shows the timeout message. Press **End** and then **Dial** to start a new session.

---

## Network Code Reference

Common MNC codes for the Africa's Talking format:

| Country | Carrier | Network Code |
|---|---|---|
| Malawi | Airtel | `63902` |
| Malawi | TNM | `63901` |
| Kenya | Safaricom | `63310` |
| Kenya | Airtel | `63303` |
| Uganda | MTN | `64110` |
| Tanzania | Vodacom | `64004` |
| Ghana | MTN | `62001` |
| Nigeria | MTN | `62130` |

Check your gateway provider's documentation for the exact code your backend expects. The value is passed as-is — the simulator doesn't validate it.

---

## Connecting the php-ussd-framework Backend

If you are using the companion [php-ussd-framework](https://github.com/your-org/php-ussd-framework), the default endpoint accepts JSON format POST requests.

**Minimum setup:**

1. Start your PHP dev server:
   ```bash
   cd path/to/php-ussd-framework
   php -S localhost:8000
   ```

2. In `.env.local`:
   ```env
   VITE_PROXY_TARGET=http://localhost:8000
   ```

3. In the simulator Live mode panel:
   - **Endpoint URL**: `http://localhost:5173/ussd-proxy/index.php`
   - **Request format**: JSON
   - **Timeout**: 10s

4. Click **Test**, then **Dial**.

The simulator sends requests in the php-ussd-framework's expected JSON shape and displays the CON/END responses on the virtual handset screen.
