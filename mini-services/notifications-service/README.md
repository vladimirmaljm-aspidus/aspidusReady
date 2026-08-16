# velos-notifications-service

Standalone Socket.IO gateway that powers real-time notifications for the
VELOS Trade Platform. Replaces the previous 30-second polling in the admin
topbar with a single long-lived WebSocket connection per browser tab.

## Why a separate service?

Next.js App-Router route handlers are HTTP-only — they can't host a
WebSocket `upgrade` handler. A standalone Node/Bun process can hold
thousands of idle WS connections cheaply, survives Next.js hot reloads
during dev, and decouples the push channel from the request/response cycle
so an emit failure can never fail the originating API call.

## Events

| Event             | Emitted by                       | Audience        | Payload                                            |
|-------------------|----------------------------------|-----------------|----------------------------------------------------|
| `message:new`     | `POST /api/portal-access/[id]/message` | `user:<portal_access_id>` | `{ messageId, partnerId, direction, preview, sender }` |
| `offer:updated`   | `PUT /api/offers/[id]`           | `tenant:<tid>`  | `{ offerId, offerNumber, oldStatus, newStatus, partnerId, total }` |
| `invoice:paid`    | `POST /api/invoices/[id]/record-payment` | `tenant:<tid>` | `{ invoiceId, invoiceNumber, amount, method, reference, status, isFullPayment, partnerId, paidAt }` |
| `portal:activity` | `POST /api/portal/rfqs`          | `tenant:<tid>`  | `{ type, rfqId, rfqNumber, partnerId, partnerName, productName, quantity }` |

## Run locally (dev)

```bash
cd mini-services/notifications-service
bun install
bun run dev          # hot reload on :3001
```

Or with Node (no Bun):

```bash
npm install
npx tsx index.ts
```

The service logs `[velos-notifications] listening on :3001` when ready.

## Environment variables

| Variable         | Default                                                            | Description                                                                                       |
|------------------|--------------------------------------------------------------------|---------------------------------------------------------------------------------------------------|
| `PORT`           | `3001`                                                             | HTTP port the gateway listens on.                                                                 |
| `CORS_ORIGINS`   | `https://aspidus.onrender.com,http://localhost:3000`               | Comma-separated list of allowed browser origins for the WS handshake.                             |
| `JWT_SECRET`     | (unset)                                                            | When set, the `auth.jwt` field on the handshake is verified against this secret. Unset = dev mode (trust client). |

## Auth model

The browser's Socket.IO client passes `{ userId, tenantId }` (and optionally
`{ jwt }`) in the `auth` handshake field. The gateway's `io.use()` middleware
verifies the claims:

1. **Dev mode** (`JWT_SECRET` unset) — trusts the client-supplied
   `userId`/`tenantId`. Acceptable for local development.
2. **Production** (`JWT_SECRET` set, matching the Next.js app's session
   secret) — verifies the JWT and extracts `sub` (userId) and
   `tenant_id` from the payload. The client should forward its `crm_session`
   cookie's JWT in `auth.jwt`.

After auth, the socket joins two rooms:

- `tenant:<tid>` — broadcast room (e.g. "invoice paid" visible to every
  admin in the tenant)
- `user:<uid>` — direct room for notifications targeted at one user (e.g.
  "your portal-access message was read")

## Internal `/emit` endpoint

`POST /emit` is called by the Next.js API routes (via
`src/lib/realtime/notify.ts`) when a domain event happens. It's
fire-and-forget from the caller's POV — a failed emit just means the
notification isn't pushed live; the underlying row is already persisted by
the time this is called.

```bash
curl -X POST http://localhost:3001/emit \
  -H 'Content-Type: application/json' \
  -d '{
    "tenantId": "abc-123",
    "event": "invoice:paid",
    "data": { "invoiceId": "inv-1", "amount": 1500, "status": "paid" }
  }'
```

Body shape: `{ tenantId?, userId?, event, data }`. `userId` wins over
`tenantId` when both are present (narrower audience).

## Topology

```
   Browser  ──ws──▶  Caddy (TLS, ?XTransformPort=3001)  ──▶  this service :3001
   Next.js API routes ──http POST /emit──▶                this service :3001
```

In production behind Caddy (see project root `Caddyfile`), the browser
connects to the same origin as the SPA (`https://aspidus.example.com`)
with `?XTransformPort=3001`, and Caddy routes the WS upgrade to this
service's port 3001.

On Render.com (the default deploy target — see project root
`render.yaml`), this service runs as a separate web service on its own
internal URL. Set `NOTIFICATIONS_SERVICE_URL` on the Next.js app to point
at it (e.g. `https://velos-notifications.onrender.com`).

## Health check

`GET /health` returns:

```json
{
  "ok": true,
  "service": "velos-notifications",
  "connections": 3,
  "uptime": 1234.5
}
```

Use this as the Render/Docker health check path.

## Frontend integration

The admin SPA connects via `src/hooks/use-realtime.ts` (singleton socket
per tab). The portal shell does not yet have a realtime hook — see the
"Follow-ups" section in the worklog entry for task D-4.
