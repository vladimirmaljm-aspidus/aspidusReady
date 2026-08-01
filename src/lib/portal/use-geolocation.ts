"use client";

import { useEffect, useRef, useState } from "react";
import type { PortalAccess } from "@/lib/supabase/types";
import { getTierMeta } from "@/lib/portal/tiers";

/**
 * Captures the browser geolocation of the signed-in portal client and POSTs
 * it to /api/portal/log-location for audit logging.
 *
 * Behavior is driven by the portal tier:
 *  - Premium: location sharing is OPTIONAL — we still ask once, but if the
 *    user denies or the browser doesn't support it, we don't block.
 *  - All other tiers (Business / Standard / Basic): location is REQUIRED.
 *    The hook exposes `required` = true and `shared` = false until the
 *    browser grants permission. The portal shell can gate content behind
 *    this state.
 *
 * The hook also fires on a 5-minute interval so long sessions stay logged.
 */
export function usePortalGeolocation(access: PortalAccess | null) {
  const [state, setState] = useState<{
    loading: boolean;
    shared: boolean;
    required: boolean;
    error: string | null;
    coords: { latitude: number; longitude: number; accuracy?: number } | null;
  }>({
    loading: false,
    shared: false,
    required: false,
    error: null,
    coords: null,
  });

  const sentRef = useRef(false);

  useEffect(() => {
    if (!access) return;
    const meta = getTierMeta(access.tier);
    const required = meta.requiresLocation;

    setState((s) => ({ ...s, required }));

    const sendLocation = (
      coords: { latitude: number; longitude: number; accuracy?: number },
      source: string
    ) => {
      fetch("/api/portal/log-location", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...coords, source }),
        keepalive: true,
      }).catch(() => {});
    };

    const onSuccess = (pos: GeolocationPosition) => {
      const coords = {
        latitude: pos.coords.latitude,
        longitude: pos.coords.longitude,
        accuracy: pos.coords.accuracy,
      };
      setState((s) => ({
        ...s,
        loading: false,
        shared: true,
        error: null,
        coords,
      }));
      sendLocation(coords, "browser");
      sentRef.current = true;
    };

    const onError = (err: GeolocationPositionError) => {
      // Always log an IP-only entry so the audit trail has a record even if
      // the browser denied geolocation.
      sendLocation({ latitude: 0, longitude: 0, accuracy: 0 }, "ip");
      setState((s) => ({
        ...s,
        loading: false,
        shared: !required, // premium: still "ok" — required tiers stay blocked
        error: err.message || "Geolocation denied",
      }));
      sentRef.current = true;
    };

    const request = () => {
      if (!navigator.geolocation) {
        onError({ message: "Geolocation not supported" } as GeolocationPositionError);
        return;
      }
      setState((s) => ({ ...s, loading: true }));
      navigator.geolocation.getCurrentPosition(onSuccess, onError, {
        enableHighAccuracy: true,
        timeout: 10_000,
        maximumAge: 5 * 60 * 1000,
      });
    };

    // Fire immediately
    request();

    // Re-log every 5 minutes so long sessions stay fresh in the audit log
    const interval = setInterval(() => {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(onSuccess, onError, {
          enableHighAccuracy: true,
          timeout: 10_000,
          maximumAge: 60_000,
        });
      }
    }, 5 * 60 * 1000);

    return () => clearInterval(interval);
  }, [access?.id, access?.tier]);

  return state;
}
