"use client";
import * as React from "react";
import dynamic from "next/dynamic";
import { useQuery } from "@tanstack/react-query";
import { useApiUrl, useTenantKey } from "@/lib/hooks/use-api-url";
import {
  findMaritimeRoute,
  geocodePort,
  haversineNm,
  type RouteResult,
  type Waypoint,
} from "@/lib/logistics/maritime-router";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Ship,
  Navigation,
  Loader2,
  Globe as GlobeIcon,
  MapPin,
  Anchor,
  Info,
} from "lucide-react";

/* -------------------------------------------------------------------------- */
/*  Dynamic globe import (WebGL — needs window, SSR off)                      */
/* -------------------------------------------------------------------------- */

const Globe = dynamic(() => import("react-globe.gl"), {
  ssr: false,
  loading: () => (
    <div className="absolute inset-0 flex items-center justify-center">
      <Loader2 className="size-8 animate-spin text-slate-400" />
    </div>
  ),
}) as React.ComponentType<any>;

/* -------------------------------------------------------------------------- */
/*  Types                                                                      */
/* -------------------------------------------------------------------------- */

interface RouteArc {
  startLat: number;
  startLng: number;
  endLat: number;
  endLng: number;
  color: string;
  label: string;
  data: any;
}

interface PortPoint {
  lat: number;
  lng: number;
  label: string;
  color: string;
  size: number;
  data: any;
}

interface LogisticsRequest {
  id: string;
  number: string;
  status: string;
  mode?: string;
  origin_port?: string | null;
  origin_city?: string | null;
  destination_port?: string | null;
  destination_city?: string | null;
  cargo_description?: string | null;
  [key: string]: any;
}

/** Pick a route arc color based on the logistics request status. */
function arcColorFor(status: string): string {
  const s = (status || "").toLowerCase();
  if (s === "delivered" || s === "completed") return "#10b981";
  if (
    s === "in_transit" ||
    s === "in_progress" ||
    s === "accepted" ||
    s === "shipped"
  )
    return "#3b82f6";
  if (s === "pending" || s === "quoted") return "#f59e0b";
  return "#64748b";
}

/* -------------------------------------------------------------------------- */
/*  Component                                                                  */
/* -------------------------------------------------------------------------- */

export function TradeGlobeView() {
  const api = useApiUrl();
  const tenantKey = useTenantKey();
  const [selectedArc, setSelectedArc] = React.useState<RouteArc | null>(null);
  const [globeReady, setGlobeReady] = React.useState(false);
  const globeRef = React.useRef<any>(null);
  const containerRef = React.useRef<HTMLDivElement>(null);
  const [size, setSize] = React.useState({ width: 800, height: 600 });

  // Auto-rotate once the globe is ready
  React.useEffect(() => {
    if (!globeReady) return;
    const controls = globeRef.current?.controls?.();
    if (controls) {
      controls.autoRotate = true;
      controls.autoRotateSpeed = 0.35;
      controls.enableDamping = true;
    }
  }, [globeReady]);

  // Responsive sizing
  React.useEffect(() => {
    if (!containerRef.current) return;
    const el = containerRef.current;
    const update = () => {
      const w = el.clientWidth;
      const h = el.clientHeight;
      if (w > 0 && h > 0) setSize({ width: w, height: h });
    };
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // Fetch logistics requests
  const { data, isLoading } = useQuery({
    queryKey: ["logistics-globe", tenantKey],
    queryFn: async () => {
      const r = await fetch(api("/api/logistics-requests", { limit: 100 }));
      if (!r.ok) throw new Error("Failed");
      return r.json();
    },
  });

  // Build arcs + points from logistics requests
  const { arcs, points } = React.useMemo(() => {
    const arcList: RouteArc[] = [];
    const pointList: PortPoint[] = [];
    const seenWaypointIds = new Set<string>();

    const requests: LogisticsRequest[] = data?.items || data || [];

    for (const req of requests) {
      const origin = req.origin_port || req.origin_city || "";
      const dest = req.destination_port || req.destination_city || "";

      const originCoords = geocodePort(origin);
      const destCoords = geocodePort(dest);

      if (!originCoords || !destCoords) continue;

      // Find maritime route (avoids land by routing through waypoints)
      const route: RouteResult = findMaritimeRoute(
        originCoords.lat,
        originCoords.lng,
        destCoords.lat,
        destCoords.lng,
      );

      const color = arcColorFor(req.status);

      // One arc per route segment so routes bend through canals/straits
      // (a single great-circle arc would cut straight across land).
      for (const segment of route.segments) {
        arcList.push({
          startLat: segment.from.lat,
          startLng: segment.from.lng,
          endLat: segment.to.lat,
          endLng: segment.to.lng,
          color,
          label: `${req.number}: ${segment.from.name} → ${segment.to.name}`,
          data: { ...req, route, segment },
        });
      }

      // Origin / destination markers
      pointList.push({
        lat: originCoords.lat,
        lng: originCoords.lng,
        label: `${origin} (Origin)`,
        color: "#10b981",
        size: 0.7,
        data: req,
      });
      pointList.push({
        lat: destCoords.lat,
        lng: destCoords.lng,
        label: `${dest} (Destination)`,
        color: "#ef4444",
        size: 0.7,
        data: req,
      });

      // Waypoint markers (canals / straits / capes) — dedupe per render
      for (const wp of route.waypoints) {
        if (
          (wp.type === "canal" || wp.type === "strait" || wp.type === "cape") &&
          !seenWaypointIds.has(wp.id)
        ) {
          seenWaypointIds.add(wp.id);
          pointList.push({
            lat: wp.lat,
            lng: wp.lng,
            label: wp.name,
            color: "#8b5cf6",
            size: 0.35,
            data: wp,
          });
        }
      }
    }

    return { arcs: arcList, points: pointList };
  }, [data]);

  // ── Selected route summary (computed from the selected arc's route) ──────
  const routeSummary = React.useMemo(() => {
    if (!selectedArc) return null;
    const r: RouteResult = selectedArc.data.route;
    const waypoints: Waypoint[] = r.waypoints;
    const intermediate = waypoints.filter(
      (w) => w.type === "canal" || w.type === "strait" || w.type === "cape",
    );
    return {
      totalDistance: r.totalDistance,
      transitDays: r.transitDays,
      segmentCount: r.segments.length,
      intermediate,
    };
  }, [selectedArc]);

  return (
    <div className="space-y-4">
      {/* ── Header ─────────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <GlobeIcon className="size-5" /> Trade Globe
          </h2>
          <p className="text-sm text-muted-foreground">
            Interactive 3D map of your global trade routes. Routes follow real
            maritime paths through canals and straits — no land crossings.
          </p>
        </div>
        <Badge variant="outline">{arcs.length} routes</Badge>
      </div>

      {/* ── Main grid ──────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Globe */}
        <div
          ref={containerRef}
          className="lg:col-span-2 relative rounded-2xl overflow-hidden bg-slate-950 border border-white/5"
          style={{ height: 600 }}
        >
          {!globeReady && (
            <div className="absolute inset-0 flex items-center justify-center z-10 pointer-events-none">
              <Loader2 className="size-8 animate-spin text-slate-400" />
            </div>
          )}
          {isLoading && (
            <div className="absolute top-3 left-3 z-10">
              <Badge variant="secondary" className="bg-slate-900/80 text-slate-300 border-white/5">
                <Loader2 className="size-3 mr-1 animate-spin" /> Loading routes…
              </Badge>
            </div>
          )}
          <Globe
            ref={globeRef}
            globeImageUrl="//unpkg.com/three-globe/example/img/earth-night.jpg"
            bumpImageUrl="//unpkg.com/three-globe/example/img/earth-topology.png"
            backgroundColor="#0a0e1a"
            width={size.width}
            height={size.height}
            arcsData={arcs}
            arcColor={(d: any) => d.color}
            arcDashLength={0.4}
            arcDashGap={0.2}
            arcDashAnimateTime={2000}
            arcDashInitialGap={() => Math.random()}
            arcStroke={0.5}
            arcAltitudeAutoScale={0.4}
            arcLabel={(d: any) => d.label}
            onArcClick={(d: any) => setSelectedArc(d)}
            pointsData={points}
            pointColor={(d: any) => d.color}
            pointAltitude={0.01}
            pointRadius={(d: any) => d.size}
            pointLabel={(d: any) => d.label}
            onGlobeReady={() => setGlobeReady(true)}
            atmosphereColor="#1e293b"
            atmosphereAltitude={0.15}
          />
        </div>

        {/* Side panel */}
        <div className="space-y-4">
          {selectedArc && routeSummary ? (
            <Card>
              <CardHeader>
                <CardTitle className="text-sm flex items-center gap-2">
                  <Ship className="size-4" /> Route Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Request:</span>
                  <span className="font-mono">
                    {selectedArc.data.number}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Status:</span>
                  <Badge
                    variant={
                      selectedArc.data.status === "delivered" ||
                      selectedArc.data.status === "completed"
                        ? "default"
                        : "secondary"
                    }
                  >
                    {selectedArc.data.status}
                  </Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Origin:</span>
                  <span className="text-right truncate ml-2">
                    {selectedArc.data.origin_port ||
                      selectedArc.data.origin_city}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Destination:</span>
                  <span className="text-right truncate ml-2">
                    {selectedArc.data.destination_port ||
                      selectedArc.data.destination_city}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">
                    Total Distance:
                  </span>
                  <span className="font-mono">
                    {routeSummary.totalDistance.toLocaleString()} nm
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Transit Time:</span>
                  <span className="font-mono">
                    {routeSummary.transitDays} days
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Mode:</span>
                  <span className="capitalize">
                    {selectedArc.data.mode || "sea"}
                  </span>
                </div>
                {selectedArc.data.cargo_description && (
                  <div className="pt-2 border-t">
                    <span className="text-muted-foreground">Cargo:</span>
                    <p className="text-sm mt-1">
                      {selectedArc.data.cargo_description}
                    </p>
                  </div>
                )}
                {routeSummary.intermediate.length > 0 && (
                  <div className="pt-2 border-t">
                    <span className="text-muted-foreground">
                      Via waypoints:
                    </span>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {routeSummary.intermediate.map((w, i) => (
                        <Badge
                          key={i}
                          variant="outline"
                          className="text-xs"
                        >
                          {w.name}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="p-6 text-center text-muted-foreground">
                <Navigation className="size-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">Click on a route arc to see details</p>
                <p className="text-xs mt-1">
                  Routes follow real maritime paths through canals and straits
                </p>
              </CardContent>
            </Card>
          )}

          {/* Legend */}
          <Card>
            <CardContent className="p-4 space-y-2">
              <p className="text-xs font-semibold uppercase text-muted-foreground flex items-center gap-1">
                <Info className="size-3" /> Legend
              </p>
              <div className="flex items-center gap-2 text-xs">
                <div className="w-3 h-0.5 bg-green-500" /> Delivered
              </div>
              <div className="flex items-center gap-2 text-xs">
                <div className="w-3 h-0.5 bg-blue-500" /> In Transit
              </div>
              <div className="flex items-center gap-2 text-xs">
                <div className="w-3 h-0.5 bg-amber-500" /> Pending
              </div>
              <div className="flex items-center gap-2 text-xs">
                <div className="w-2 h-2 rounded-full bg-green-500" /> Origin Port
              </div>
              <div className="flex items-center gap-2 text-xs">
                <div className="w-2 h-2 rounded-full bg-red-500" /> Destination Port
              </div>
              <div className="flex items-center gap-2 text-xs">
                <div className="w-2 h-2 rounded-full bg-purple-500" /> Canal / Strait / Cape
              </div>
            </CardContent>
          </Card>

          {/* Empty state */}
          {arcs.length === 0 && !isLoading && (
            <Card>
              <CardContent className="p-6 text-center text-muted-foreground space-y-2">
                <Anchor className="size-8 mx-auto opacity-50" />
                <p className="text-sm font-medium text-foreground">
                  No routes yet
                </p>
                <p className="text-xs">
                  Create logistics requests with origin and destination ports
                  to see them visualised on the globe.
                </p>
              </CardContent>
            </Card>
          )}

          {/* Stats */}
          {arcs.length > 0 && (
            <Card>
              <CardContent className="p-4 space-y-2">
                <p className="text-xs font-semibold uppercase text-muted-foreground flex items-center gap-1">
                  <MapPin className="size-3" /> Network
                </p>
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">Total routes</span>
                  <span className="font-mono">{arcs.length}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">Ports shown</span>
                  <span className="font-mono">{points.length}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">Avg. distance</span>
                  <span className="font-mono">
                    {arcs.length > 0
                      ? Math.round(
                          arcs.reduce(
                            (acc, a) =>
                              acc +
                              haversineNm(
                                a.startLat,
                                a.startLng,
                                a.endLat,
                                a.endLng,
                              ),
                            0,
                          ) / arcs.length,
                        ).toLocaleString()
                      : 0}{" "}
                    nm
                  </span>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
