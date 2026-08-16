"use client";

/**
 * useRealtime — React hook for subscribing to the VELOS notifications gateway.
 * ----------------------------------------------------------------------------
 * Replaces the 30-second polling that previously lived in the Topbar with a
 * single long-lived Socket.IO connection per browser tab.
 *
 * Usage:
 *
 *   useRealtime({
 *     "message:new":    (data) => addNotification(data),
 *     "offer:updated":  (data) => invalidateOffersQuery(),
 *     "invoice:paid":   (data) => toast.success("Invoice paid"),
 *     "portal:activity":(data) => addNotification(data),
 *   });
 *
 * Connection lifecycle:
 *   • One singleton socket per tab (module-level `socket` variable) so the
 *     hook can be mounted in multiple components without spawning multiple
 *     connections.
 *   • The socket is created lazily on first `useRealtime` call after we know
 *     who the user is (auth handshake). If `userId` is null (logged out),
 *     the hook is a no-op.
 *   • Handlers are stored in a ref so changing them doesn't trigger a
 *     resubscribe — only the SET of event names does. This avoids the
 *     "re-subscribe on every render" bug the naive implementation has.
 *
 * Env:
 *   NEXT_PUBLIC_WS_URL — base URL of the WebSocket gateway.
 *     • Dev default: `http://localhost:3001` (the mini-service running locally).
 *     • Prod: the same-origin URL with `?XTransformPort=3001` so Caddy
 *       routes the upgrade to the service (see Caddyfile). Example:
 *       `https://aspidus.onrender.com/?XTransformPort=3001`.
 *
 * Auth:
 *   The admin SPA's `user` from `useAppStore` is passed in the `auth`
 *   handshake so the gateway can join `user:<id>` and `tenant:<tid>` rooms.
 *   The JWT is NOT yet forwarded (the gateway trusts the handshake in dev);
 *   a follow-up will pass the `crm_session` cookie's payload as `auth.jwt`
 *   so the gateway can verify with `JWT_SECRET`.
 */

import { useEffect, useRef } from "react";
import { io, type Socket } from "socket.io-client";
import { useAppStore } from "@/lib/store/app-store";

// Module-level singleton — one connection per browser tab regardless of how
// many components mount `useRealtime`.
let socket: Socket | null = null;
let connectedUserId: string | null = null;

function getWsUrl(): string {
  if (process.env.NEXT_PUBLIC_WS_URL) return process.env.NEXT_PUBLIC_WS_URL;
  // Dev default: same-origin bypassed to the local mini-service. In prod
  // the env var is always set, so this branch only fires on a developer's
  // machine.
  if (typeof window !== "undefined" && window.location.hostname === "localhost") {
    return "http://localhost:3001";
  }
  // Same-origin with the Caddy XTransformPort query param so the upgrade
  // goes through the same TLS cert as the SPA. Caddyfile maps this to
  // the mini-service port 3001.
  return typeof window !== "undefined" ? `${window.location.origin}/?XTransformPort=3001` : "";
}

type EventHandler = (data: any) => void;
type EventMap = Record<string, EventHandler>;

export function useRealtime(events: EventMap): void {
  const user = useAppStore((s) => s.user);
  // Latest handlers kept in a ref so we never need to resubscribe when a
  // caller passes a fresh object literal (which happens on every render).
  // Updated inside a passive effect (NOT in the render body) per the
  // react-hooks/refs rule — refs must not be mutated during render.
  const handlersRef = useRef<EventMap>(events);
  useEffect(() => {
    handlersRef.current = events;
  });

  // Stable event-name list — only when the SET of subscribed events changes
  // do we touch the socket's listener registry.
  const eventKey = Object.keys(events).sort().join("|");

  useEffect(() => {
    if (!user?.id) return; // logged out — nothing to subscribe to

    // Lazy-init the singleton socket the first time we have a user. If the
    // user CHANGES (super-admin impersonation, login-as, etc.) tear down
    // and reconnect so the rooms are correct.
    if (!socket || connectedUserId !== user.id) {
      socket?.disconnect();
      socket = io(getWsUrl(), {
        transports: ["websocket"],
        auth: {
          token: {
            userId: user.id,
            tenantId: user.tenant_id ?? undefined,
          },
        },
        // Auto-reconnect with exponential backoff. Socket.IO's defaults
        // are reasonable; we just cap the retry to avoid hammering the
        // gateway during an outage.
        reconnection: true,
        reconnectionAttempts: Infinity,
        reconnectionDelay: 1_000,
        reconnectionDelayMax: 15_000,
      });
      connectedUserId = user.id;

      socket.on("connect", () => {
        console.debug("[realtime] connected");
      });
      socket.on("disconnect", (reason) => {
        console.debug("[realtime] disconnected:", reason);
      });
      socket.on("connect_error", (err) => {
        // Likely the gateway is down or the auth handshake was rejected.
        // Logged at debug so prod doesn't get spammed during an outage.
        console.debug("[realtime] connect_error:", err.message);
      });
    }

    const names = eventKey ? eventKey.split("|") : [];
    // Each event name maps to a stable wrapper that reads the latest handler
    // from the ref. This is what lets callers pass new handler closures on
    // every render without us churning the socket's listener registry.
    const wrappers: Record<string, EventHandler> = {};
    for (const name of names) {
      const wrapper: EventHandler = (data) => handlersRef.current[name]?.(data);
      wrappers[name] = wrapper;
      socket!.on(name, wrapper);
    }

    return () => {
      for (const name of Object.keys(wrappers)) {
        socket?.off(name, wrappers[name]);
      }
      // NOTE: we intentionally do NOT disconnect the socket here — the
      // singleton survives unmount so a re-mount (e.g. route change in the
      // SPA) doesn't pay the reconnect cost. The socket is torn down only
      // when the user changes (handled above) or the tab closes.
    };
    // `eventKey` is the only dep — when the SET of subscribed event names
    // changes we re-register. `user.id` is captured but the only user-driven
    // trigger for re-running is the lazy-init branch above (which compares
    // connectedUserId against user.id).
  }, [eventKey, user?.id]);
}

/**
 * Manually disconnect the realtime socket — useful for the logout flow so a
 * logged-out tab doesn't keep an open connection under a stale identity.
 * Called from the Topbar's logout handler.
 */
export function disconnectRealtime(): void {
  if (socket) {
    socket.disconnect();
    socket = null;
    connectedUserId = null;
  }
}
