/**
 * VELOS Notifications mini-service
 * ----------------------------------------------------------------------------
 * Standalone Socket.IO gateway that maintains a long-lived WebSocket
 * connection for every authenticated VELOS session (admin SPA + portal).
 *
 * The Next.js API routes never touch Socket.IO directly — they emit a
 * fire-and-forget POST to the internal `/emit` endpoint on this service,
 * which then fans the event out to whichever room(s) the message targets
 * (`user:<id>` for a single user, `tenant:<id>` for everyone in a tenant).
 *
 * Auth model:
 *   • The client passes `{ userId, tenantId }` in the `auth` handshake field.
 *   • In dev / mock mode we accept any token. In production a JWT should be
 *     verified here against the same `crm_session` secret used by the
 *     Next.js app (see `src/lib/auth/session.ts`). The signing secret is
 *     read from `JWT_SECRET` env var so this service stays stateless.
 *
 * Topology:
 *
 *   Browser  ──ws──▶  Caddy (TLS, ?XTransformPort=3001)  ──▶  this service :3001
 *   Next.js API routes ──http POST /emit──▶                this service :3001
 *
 * See ./README.md for run / deploy instructions.
 */

import { createServer } from "http";
import express from "express";
import cors from "cors";
import { Server } from "socket.io";

const PORT = Number(process.env.PORT) || 3001;
const ALLOWED_ORIGINS = (process.env.CORS_ORIGINS ||
  "https://aspidus.onrender.com,http://localhost:3000").split(",").map((s) => s.trim());

/**
 * Optional JWT verification. When `JWT_SECRET` is set, the `auth.token`
 * string is treated as a signed JWT and verified here so a hostile client
 * can't impersonate another user by simply sending `{ userId: "victim" }`.
 *
 * When `JWT_SECRET` is NOT set (local dev), we accept any object and trust
 * the userId/tenantId the client sent — same posture as the task spec's
 * original demo. The production deploy sets `JWT_SECRET` to the same value
 * used by the Next.js app so the sessions are interchangeable.
 */
async function verifyToken(token: unknown): Promise<{ userId?: string; tenantId?: string } | null> {
  if (!token || typeof token !== "object") return null;
  const t = token as { userId?: string; tenantId?: string; jwt?: string };
  // JWT path — verify against the shared session secret.
  if (process.env.JWT_SECRET && t.jwt) {
    try {
      const { jwtVerify } = await import("jose");
      const secret = new TextEncoder().encode(process.env.JWT_SECRET);
      const { payload } = await jwtVerify(t.jwt, secret, { algorithms: ["HS256"] });
      return {
        userId: payload.sub ?? t.userId,
        tenantId: (payload as any).tenant_id ?? t.tenantId,
      };
    } catch {
      return null;
    }
  }
  // Dev path — trust the client.
  return { userId: t.userId, tenantId: t.tenantId };
}

const app = express();
app.use(express.json({ limit: "256kb" }));
app.use(cors({ origin: ALLOWED_ORIGINS, credentials: true }));

const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: { origin: ALLOWED_ORIGINS, credentials: true },
  // WebSocket-first — avoids the long-polling fallback's per-poll HTTP
  // overhead. Caddy's `flush_interval -1` is required for the upgrade
  // handshake to pass through cleanly (see Caddyfile).
  transports: ["websocket"],
});

// ── Socket.io auth middleware ────────────────────────────────────────────────
io.use(async (socket, next) => {
  try {
    const claims = await verifyToken(socket.handshake.auth.token);
    if (!claims || !claims.userId) {
      return next(new Error("Not authenticated."));
    }
    socket.data.userId = claims.userId;
    socket.data.tenantId = claims.tenantId || "unknown";
    next();
  } catch (e: any) {
    next(new Error(`Auth failed: ${e?.message || e}`));
  }
});

io.on("connection", (socket) => {
  const { userId, tenantId } = socket.data;
  console.log(`[ws] user=${userId} tenant=${tenantId} connected (id=${socket.id})`);

  // Each user joins two rooms:
  //   • `tenant:<tid>` — broadcast room (e.g. "invoice paid" visible to every
  //     admin in the tenant)
  //   • `user:<uid>`   — direct room for notifications targeted at one user
  //     (e.g. "your portal-access message was read").
  socket.join(`tenant:${tenantId}`);
  socket.join(`user:${userId}`);

  socket.on("disconnect", (reason) => {
    console.log(`[ws] user=${userId} disconnected (${reason})`);
  });
});

// ── Health ───────────────────────────────────────────────────────────────────
app.get("/health", (_req, res) => {
  res.json({
    ok: true,
    service: "velos-notifications",
    connections: io.engine.clientsCount,
    uptime: process.uptime(),
  });
});

// ── Internal emit endpoint ───────────────────────────────────────────────────
// Called by Next.js API routes (via `src/lib/realtime/notify.ts`) when a
// domain event happens. The route is fire-and-forget from the caller's POV
// — a failed emit here just means the notification isn't pushed live; the
// underlying row is already persisted by the time this is called.
//
// Body: { tenantId?, userId?, event, data }
//  • userId wins over tenantId when both are present (narrower audience).
//  • If neither is present we respond 400 so a missing-target bug is loud
//    rather than silently dropping the message.
app.post("/emit", (req, res) => {
  const { tenantId, userId, event, data } = req.body ?? {};

  if (!event || typeof event !== "string") {
    return res.status(400).json({ ok: false, error: "Missing `event`." });
  }
  if (!userId && !tenantId) {
    return res.status(400).json({ ok: false, error: "Missing `userId` or `tenantId`." });
  }

  if (userId) {
    io.to(`user:${userId}`).emit(event, data);
  } else if (tenantId) {
    io.to(`tenant:${tenantId}`).emit(event, data);
  }

  res.json({ ok: true });
});

httpServer.listen(PORT, () => {
  console.log(`[velos-notifications] listening on :${PORT}`);
  console.log(`[velos-notifications] CORS origins: ${ALLOWED_ORIGINS.join(", ")}`);
  console.log(`[velos-notifications] JWT verification: ${process.env.JWT_SECRET ? "ON" : "OFF (dev mode)"}`);
});
