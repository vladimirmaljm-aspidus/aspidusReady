"use client";

/**
 * TemplateVisualEditor
 * --------------------
 * A drag-and-drop visual editor for designing the layout of a PDF document
 * template. Users see a scaled A4/Letter page, drag field blocks to position
 * them, snap to edges / center / other elements, and fine-tune via the
 * properties panel. A mm ruler is shown on the top and left edges.
 */

import * as React from "react";
import {
  Ruler,
  Move,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignVerticalJustifyStart,
  AlignVerticalJustifyCenter,
  AlignVerticalJustifyEnd,
  Lock,
  Unlock,
  Eye,
  EyeOff,
  RotateCcw,
  Maximize2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import type { DocumentTemplate } from "@/lib/supabase/types";

// ============================================================
// Types
// ============================================================

export type FieldType =
  | "header"
  | "logo"
  | "company_name"
  | "company_address"
  | "doc_title"
  | "doc_meta"
  | "from_box"
  | "to_box"
  | "trade_terms"
  | "line_items_table"
  | "specifications"
  | "totals"
  | "amount_in_words"
  | "offer_text"
  | "bank_details"
  | "signatures"
  | "seal"
  | "footer"
  | "custom_text";

export interface FieldElement {
  id: string;
  type: FieldType;
  label: string;
  x: number; // mm from left
  y: number; // mm from top
  width: number; // mm
  height: number; // mm
  visible: boolean;
  locked: boolean;
  props?: Record<string, unknown>; // field-specific props
}

interface SnapGuide {
  orientation: "horizontal" | "vertical";
  position: number; // mm
  type: "edge" | "center" | "element";
}

interface TemplateVisualEditorProps {
  template: Partial<DocumentTemplate>;
  onChange: (template: Partial<DocumentTemplate>) => void;
  /** Optional override; falls back to template.page_size, then A4. */
  pageSize?: "A4" | "Letter";
}

// ============================================================
// Constants
// ============================================================

const PAGE_DIMENSIONS = {
  A4: { width: 210, height: 297 }, // mm
  Letter: { width: 216, height: 279 },
} as const;

// 2x zoom for editing: 1 mm → 2 px on screen.
const SCALE = 2;

// Snap threshold in mm.
const SNAP_THRESHOLD = 3;

// Default field layout (positions in mm on A4).
const DEFAULT_FIELDS: FieldElement[] = [
  { id: "header", type: "header", label: "Header (Memorandum)", x: 15, y: 8, width: 180, height: 25, visible: true, locked: false },
  { id: "doc_title", type: "doc_title", label: "Document Title", x: 15, y: 40, width: 180, height: 12, visible: true, locked: false },
  { id: "doc_meta", type: "doc_meta", label: "Doc # + Date", x: 15, y: 54, width: 180, height: 14, visible: true, locked: false },
  { id: "from_box", type: "from_box", label: "FROM (Seller)", x: 15, y: 74, width: 87, height: 40, visible: true, locked: false },
  { id: "to_box", type: "to_box", label: "TO (Buyer)", x: 108, y: 74, width: 87, height: 40, visible: true, locked: false },
  { id: "trade_terms", type: "trade_terms", label: "Trade Terms", x: 15, y: 118, width: 180, height: 22, visible: true, locked: false },
  { id: "line_items_table", type: "line_items_table", label: "Line Items Table", x: 15, y: 145, width: 180, height: 50, visible: true, locked: false },
  { id: "specifications", type: "specifications", label: "Specifications", x: 15, y: 200, width: 180, height: 30, visible: true, locked: false },
  { id: "totals", type: "totals", label: "Totals", x: 120, y: 235, width: 75, height: 25, visible: true, locked: false },
  { id: "amount_in_words", type: "amount_in_words", label: "Amount in Words", x: 15, y: 235, width: 100, height: 20, visible: true, locked: false },
  { id: "offer_text", type: "offer_text", label: "Offer Text / Terms", x: 15, y: 255, width: 180, height: 18, visible: true, locked: false },
  { id: "bank_details", type: "bank_details", label: "Bank Details", x: 15, y: 263, width: 180, height: 12, visible: true, locked: false },
  { id: "signatures", type: "signatures", label: "Signatures", x: 15, y: 277, width: 180, height: 14, visible: true, locked: false },
  { id: "footer", type: "footer", label: "Footer", x: 15, y: 286, width: 180, height: 8, visible: true, locked: false },
];

// ============================================================
// Ruler Component
// ============================================================

/**
 * RulerBar renders a tick-marked ruler in mm units.
 * Renamed from `Ruler` to avoid clashing with the lucide-react icon of the same name.
 */
function RulerBar({
  orientation,
  length,
  scale,
}: {
  orientation: "horizontal" | "vertical";
  length: number;
  scale: number;
}) {
  const ticks: React.ReactNode[] = [];
  for (let i = 0; i <= length; i += 10) {
    const isMajor = i % 50 === 0;
    const tickLength = isMajor ? 8 : 4;
    const pos = i * scale;
    if (pos < 0) continue;
    ticks.push(
      <div
        key={i}
        className="absolute"
        style={
          orientation === "horizontal"
            ? { left: pos, top: 0, width: 1, height: tickLength }
            : { top: pos, left: 0, width: tickLength, height: 1 }
        }
      >
        <div className="h-full w-full bg-muted-foreground/40" />
        {isMajor && (
          <span
            className="absolute text-[8px] leading-none text-muted-foreground"
            style={
              orientation === "horizontal"
                ? { top: 10, left: 2 }
                : { left: 10, top: -2 }
            }
          >
            {i}
          </span>
        )}
      </div>
    );
  }
  return (
    <div
      className={cn(
        "relative overflow-hidden border-border bg-muted/20",
        orientation === "horizontal" ? "h-6 border-b" : "w-6 border-r"
      )}
    >
      {ticks}
    </div>
  );
}

// ============================================================
// Snap Engine
// ============================================================

function calculateSnapGuides(
  dragging: FieldElement,
  fields: FieldElement[],
  pageWidth: number,
  pageHeight: number
): SnapGuide[] {
  const guides: SnapGuide[] = [];

  // Page edge + center guides
  guides.push({ orientation: "vertical", position: 0, type: "edge" });
  guides.push({ orientation: "vertical", position: pageWidth, type: "edge" });
  guides.push({ orientation: "vertical", position: pageWidth / 2, type: "center" });
  guides.push({ orientation: "horizontal", position: 0, type: "edge" });
  guides.push({ orientation: "horizontal", position: pageHeight, type: "edge" });
  guides.push({ orientation: "horizontal", position: pageHeight / 2, type: "center" });

  // Other element edges + centers (the dragging element is excluded).
  for (const f of fields) {
    if (f.id === dragging.id || !f.visible) continue;
    guides.push({ orientation: "vertical", position: f.x, type: "element" });
    guides.push({ orientation: "vertical", position: f.x + f.width, type: "element" });
    guides.push({ orientation: "vertical", position: f.x + f.width / 2, type: "element" });
    guides.push({ orientation: "horizontal", position: f.y, type: "element" });
    guides.push({ orientation: "horizontal", position: f.y + f.height, type: "element" });
    guides.push({ orientation: "horizontal", position: f.y + f.height / 2, type: "element" });
  }

  return guides;
}

function findSnap(
  dragging: FieldElement,
  guides: SnapGuide[],
  threshold: number = SNAP_THRESHOLD
): { x?: number; y?: number; guides: SnapGuide[] } {
  const activeGuides: SnapGuide[] = [];
  let snapX: number | undefined;
  let snapY: number | undefined;

  const dragLeft = dragging.x;
  const dragRight = dragging.x + dragging.width;
  const dragCenterX = dragging.x + dragging.width / 2;

  for (const g of guides) {
    if (g.orientation !== "vertical") continue;
    if (snapX === undefined && Math.abs(g.position - dragLeft) < threshold) {
      snapX = g.position;
      activeGuides.push(g);
      continue;
    }
    if (snapX === undefined && Math.abs(g.position - dragRight) < threshold) {
      snapX = g.position - dragging.width;
      activeGuides.push(g);
      continue;
    }
    if (snapX === undefined && Math.abs(g.position - dragCenterX) < threshold) {
      snapX = g.position - dragging.width / 2;
      activeGuides.push(g);
      continue;
    }
  }

  const dragTop = dragging.y;
  const dragBottom = dragging.y + dragging.height;
  const dragCenterY = dragging.y + dragging.height / 2;

  for (const g of guides) {
    if (g.orientation !== "horizontal") continue;
    if (snapY === undefined && Math.abs(g.position - dragTop) < threshold) {
      snapY = g.position;
      activeGuides.push(g);
      continue;
    }
    if (snapY === undefined && Math.abs(g.position - dragBottom) < threshold) {
      snapY = g.position - dragging.height;
      activeGuides.push(g);
      continue;
    }
    if (snapY === undefined && Math.abs(g.position - dragCenterY) < threshold) {
      snapY = g.position - dragging.height / 2;
      activeGuides.push(g);
      continue;
    }
  }

  return { x: snapX, y: snapY, guides: activeGuides };
}

// ============================================================
// Main Component
// ============================================================

type DragState = {
  id: string;
  startX: number; // client px
  startY: number; // client px
  origX: number; // mm
  origY: number; // mm
  origW: number; // mm
  origH: number; // mm
  mode: "move" | "resize";
};

export function TemplateVisualEditor({
  template,
  onChange,
  pageSize,
}: TemplateVisualEditorProps) {
  const [fields, setFields] = React.useState<FieldElement[]>(
    DEFAULT_FIELDS.map((f) => ({ ...f }))
  );
  const [selectedId, setSelectedId] = React.useState<string | null>(null);
  const [dragging, setDragging] = React.useState<DragState | null>(null);
  const [activeGuides, setActiveGuides] = React.useState<SnapGuide[]>([]);
  const [showRuler, setShowRuler] = React.useState(true);
  const [snapEnabled, setSnapEnabled] = React.useState(true);

  // Effective page size: explicit prop wins, then template.page_size, then A4.
  const effectivePageSize: "A4" | "Letter" =
    pageSize ?? (template.page_size === "Letter" ? "Letter" : "A4");
  const page = PAGE_DIMENSIONS[effectivePageSize];
  const pageWidthPx = page.width * SCALE;
  const pageHeightPx = page.height * SCALE;

  const selected = fields.find((f) => f.id === selectedId) ?? null;

  // ---------------------------------------------------------
  // Drag / resize handlers
  // ---------------------------------------------------------

  const startDrag = (
    e: React.MouseEvent,
    field: FieldElement,
    mode: "move" | "resize"
  ) => {
    if (field.locked) return;
    e.preventDefault();
    e.stopPropagation();
    setSelectedId(field.id);
    setDragging({
      id: field.id,
      startX: e.clientX,
      startY: e.clientY,
      origX: field.x,
      origY: field.y,
      origW: field.width,
      origH: field.height,
      mode,
    });
  };

  React.useEffect(() => {
    if (!dragging) return;

    const handleMouseMove = (e: MouseEvent) => {
      const dx = (e.clientX - dragging.startX) / SCALE;
      const dy = (e.clientY - dragging.startY) / SCALE;

      setFields((prev) =>
        prev.map((f) => {
          if (f.id !== dragging.id) return f;

          if (dragging.mode === "resize") {
            // Resize: update width/height based on drag delta, keep x/y clamped
            // to original so the field's top-left stays fixed.
            const newWidth = Math.max(
              10,
              Math.min(page.width - dragging.origX, dragging.origW + dx)
            );
            const newHeight = Math.max(
              6,
              Math.min(page.height - dragging.origY, dragging.origH + dy)
            );
            return { ...f, width: newWidth, height: newHeight };
          }

          // Move mode.
          let newX = Math.max(
            0,
            Math.min(page.width - f.width, dragging.origX + dx)
          );
          let newY = Math.max(
            0,
            Math.min(page.height - f.height, dragging.origY + dy)
          );

          if (snapEnabled) {
            const candidate: FieldElement = { ...f, x: newX, y: newY };
            const guides = calculateSnapGuides(
              candidate,
              prev,
              page.width,
              page.height
            );
            const snap = findSnap(candidate, guides);
            if (snap.x !== undefined) newX = snap.x;
            if (snap.y !== undefined) newY = snap.y;
            setActiveGuides(snap.guides);
          }

          return { ...f, x: newX, y: newY };
        })
      );
    };

    const handleMouseUp = () => {
      setDragging(null);
      setActiveGuides([]);
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [dragging, snapEnabled, page.width, page.height]);

  // ---------------------------------------------------------
  // Template / field mutations
  // ---------------------------------------------------------

  const updateTemplate = (updates: Partial<DocumentTemplate>) => {
    onChange({ ...template, ...updates });
  };

  const updateField = (id: string, updates: Partial<FieldElement>) => {
    setFields((prev) =>
      prev.map((f) => (f.id === id ? { ...f, ...updates } : f))
    );
  };

  const alignField = (id: string, alignment: string) => {
    setFields((prev) =>
      prev.map((f) => {
        if (f.id !== id) return f;
        switch (alignment) {
          case "left":
            return { ...f, x: 0 };
          case "center-h":
            return { ...f, x: (page.width - f.width) / 2 };
          case "right":
            return { ...f, x: page.width - f.width };
          case "top":
            return { ...f, y: 0 };
          case "middle":
            return { ...f, y: (page.height - f.height) / 2 };
          case "bottom":
            return { ...f, y: page.height - f.height };
          default:
            return f;
        }
      })
    );
  };

  const resetLayout = () => {
    setFields(DEFAULT_FIELDS.map((f) => ({ ...f })));
    setSelectedId(null);
    setActiveGuides([]);
  };

  // ---------------------------------------------------------
  // Margins (with safe fallbacks)
  // ---------------------------------------------------------
  const marginTop = template.page_margin_top ?? 20;
  const marginBottom = template.page_margin_bottom ?? 20;
  const marginLeft = template.page_margin_left ?? 18;
  const marginRight = template.page_margin_right ?? 18;

  return (
    <div className="flex h-full min-h-0 flex-col">
      {/* ─── Toolbar ─── */}
      <div className="flex flex-wrap items-center gap-2 border-b bg-background p-2">
        <Button
          size="sm"
          variant={showRuler ? "default" : "outline"}
          onClick={() => setShowRuler(!showRuler)}
        >
          <Ruler className="size-4" /> Ruler
        </Button>
        <Button
          size="sm"
          variant={snapEnabled ? "default" : "outline"}
          onClick={() => setSnapEnabled(!snapEnabled)}
        >
          <Move className="size-4" /> Snap {snapEnabled ? "On" : "Off"}
        </Button>
        <div className="h-6 w-px bg-border" />
        <Button size="sm" variant="outline" onClick={resetLayout}>
          <RotateCcw className="size-4" /> Reset Layout
        </Button>
        <div className="ml-auto flex items-center gap-3 text-xs text-muted-foreground">
          <span>
            Page:{" "}
            <strong className="text-foreground">{effectivePageSize}</strong>
          </span>
          <span>
            {page.width} × {page.height} mm
          </span>
        </div>
      </div>

      {/* ─── Body: 3 panels ─── */}
      <div className="flex min-h-0 flex-1">
        {/* LEFT — Fields list */}
        <ScrollArea className="w-48 shrink-0 border-r">
          <div className="space-y-1 p-3">
            <h3 className="mb-2 text-xs font-semibold uppercase text-muted-foreground">
              Fields ({fields.length})
            </h3>
            {fields.map((f) => (
              <div
                key={f.id}
                className={cn(
                  "flex cursor-pointer items-center gap-2 rounded p-2 text-sm",
                  selectedId === f.id
                    ? "border border-primary/30 bg-primary/10"
                    : "hover:bg-muted/50"
                )}
                onClick={() => setSelectedId(f.id)}
              >
                <button
                  className="shrink-0"
                  title={f.visible ? "Hide field" : "Show field"}
                  onClick={(e) => {
                    e.stopPropagation();
                    updateField(f.id, { visible: !f.visible });
                  }}
                >
                  {f.visible ? (
                    <Eye className="size-3.5" />
                  ) : (
                    <EyeOff className="size-3.5 text-muted-foreground" />
                  )}
                </button>
                <span
                  className={cn(
                    "flex-1 truncate",
                    !f.visible && "text-muted-foreground line-through"
                  )}
                >
                  {f.label}
                </span>
                {f.locked && <Lock className="size-3 text-muted-foreground" />}
              </div>
            ))}
          </div>
        </ScrollArea>

        {/* CENTER — Canvas */}
        <div className="flex-1 overflow-auto bg-muted/20 p-4">
          <div className="inline-block">
            {showRuler && (
              <div className="flex">
                {/* Top-left corner square */}
                <div className="size-6 shrink-0 bg-muted/20" />
                {/* Top ruler */}
                <RulerBar
                  orientation="horizontal"
                  length={page.width}
                  scale={SCALE}
                />
              </div>
            )}

            <div className="flex">
              {/* Left ruler */}
              {showRuler && (
                <RulerBar
                  orientation="vertical"
                  length={page.height}
                  scale={SCALE}
                />
              )}

              {/* Page */}
              <div
                className="relative bg-white shadow-lg"
                style={{ width: pageWidthPx, height: pageHeightPx }}
                onClick={(e) => {
                  if (e.target === e.currentTarget) setSelectedId(null);
                }}
              >
                {/* Page margin guides (dashed blue) */}
                <div
                  className="absolute border-l border-dashed border-blue-300/50"
                  style={{ left: marginLeft * SCALE, top: 0, bottom: 0 }}
                />
                <div
                  className="absolute border-r border-dashed border-blue-300/50"
                  style={{ right: marginRight * SCALE, top: 0, bottom: 0 }}
                />
                <div
                  className="absolute border-t border-dashed border-blue-300/50"
                  style={{ top: marginTop * SCALE, left: 0, right: 0 }}
                />
                <div
                  className="absolute border-b border-dashed border-blue-300/50"
                  style={{ bottom: marginBottom * SCALE, left: 0, right: 0 }}
                />

                {/* Active snap guides (red) */}
                {activeGuides.map((g, i) =>
                  g.orientation === "vertical" ? (
                    <div
                      key={`snap-v-${i}`}
                      className="absolute bg-red-500/60"
                      style={{
                        left: g.position * SCALE,
                        top: 0,
                        width: 1,
                        height: pageHeightPx,
                      }}
                    />
                  ) : (
                    <div
                      key={`snap-h-${i}`}
                      className="absolute bg-red-500/60"
                      style={{
                        top: g.position * SCALE,
                        left: 0,
                        height: 1,
                        width: pageWidthPx,
                      }}
                    />
                  )
                )}

                {/* Fields */}
                {fields
                  .filter((f) => f.visible)
                  .map((f) => {
                    const isSelected = selectedId === f.id;
                    return (
                      <div
                        key={f.id}
                        onMouseDown={(e) => startDrag(e, f, "move")}
                        className={cn(
                          "absolute flex select-none items-center justify-center border text-[9px] font-medium leading-tight",
                          isSelected
                            ? "z-10 cursor-move border-primary bg-primary/10"
                            : "cursor-move border-blue-300 bg-blue-50/50 hover:bg-blue-50",
                          f.locked && "cursor-default opacity-60"
                        )}
                        style={{
                          left: f.x * SCALE,
                          top: f.y * SCALE,
                          width: f.width * SCALE,
                          height: f.height * SCALE,
                        }}
                        title={`${f.label} — (${Math.round(f.x)}, ${Math.round(
                          f.y
                        )}) mm`}
                      >
                        <span className="px-1 text-center text-slate-700">
                          {f.label}
                        </span>

                        {/* Coordinates badge */}
                        {isSelected && (
                          <span className="absolute -top-5 left-0 rounded bg-primary px-1.5 py-0.5 text-[8px] font-medium text-primary-foreground">
                            {Math.round(f.x)}, {Math.round(f.y)}
                          </span>
                        )}

                        {/* Resize handle (bottom-right) */}
                        {isSelected && !f.locked && (
                          <div
                            onMouseDown={(e) => startDrag(e, f, "resize")}
                            className="absolute -bottom-1 -right-1 flex size-3 cursor-nwse-resize items-center justify-center rounded-sm border border-primary bg-white"
                            title="Drag to resize"
                          >
                            <Maximize2 className="size-2 text-primary" />
                          </div>
                        )}
                      </div>
                    );
                  })}
              </div>
            </div>

            {/* Legend */}
            <div className="mt-3 flex flex-wrap items-center gap-3 text-[10px] text-muted-foreground">
              <span className="flex items-center gap-1">
                <span className="inline-block size-2.5 rounded-sm border border-primary bg-primary/10" />
                Selected
              </span>
              <span className="flex items-center gap-1">
                <span className="inline-block size-2.5 rounded-sm border border-blue-300 bg-blue-50/50" />
                Field
              </span>
              <span className="flex items-center gap-1">
                <span className="inline-block h-2 w-3 border-t border-dashed border-blue-300" />
                Page margin
              </span>
              <span className="flex items-center gap-1">
                <span className="inline-block h-2 w-3 bg-red-500/60" />
                Active snap guide
              </span>
            </div>
          </div>
        </div>

        {/* RIGHT — Properties */}
        <ScrollArea className="w-64 shrink-0 border-l">
          <div className="space-y-4 p-3">
            {selected ? (
              <>
                <div className="flex items-center justify-between gap-2">
                  <h3 className="text-xs font-semibold uppercase text-muted-foreground">
                    Properties
                  </h3>
                  <Badge variant="outline" className="text-[10px]">
                    {selected.type}
                  </Badge>
                </div>
                <p className="text-xs font-medium">{selected.label}</p>

                {/* Position & size */}
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <Label className="text-xs">X (mm)</Label>
                    <Input
                      type="number"
                      value={Math.round(selected.x)}
                      onChange={(e) =>
                        updateField(selected.id, {
                          x: Number(e.target.value) || 0,
                        })
                      }
                    />
                  </div>
                  <div>
                    <Label className="text-xs">Y (mm)</Label>
                    <Input
                      type="number"
                      value={Math.round(selected.y)}
                      onChange={(e) =>
                        updateField(selected.id, {
                          y: Number(e.target.value) || 0,
                        })
                      }
                    />
                  </div>
                  <div>
                    <Label className="text-xs">Width (mm)</Label>
                    <Input
                      type="number"
                      value={Math.round(selected.width)}
                      onChange={(e) =>
                        updateField(selected.id, {
                          width: Math.max(10, Number(e.target.value) || 10),
                        })
                      }
                    />
                  </div>
                  <div>
                    <Label className="text-xs">Height (mm)</Label>
                    <Input
                      type="number"
                      value={Math.round(selected.height)}
                      onChange={(e) =>
                        updateField(selected.id, {
                          height: Math.max(6, Number(e.target.value) || 6),
                        })
                      }
                    />
                  </div>
                </div>

                {/* Toggles */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label className="flex items-center gap-1 text-xs">
                      <Eye className="size-3" /> Visible
                    </Label>
                    <Switch
                      checked={selected.visible}
                      onCheckedChange={(v) =>
                        updateField(selected.id, { visible: v })
                      }
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label className="flex items-center gap-1 text-xs">
                      {selected.locked ? (
                        <Lock className="size-3" />
                      ) : (
                        <Unlock className="size-3" />
                      )}{" "}
                      Locked
                    </Label>
                    <Switch
                      checked={selected.locked}
                      onCheckedChange={(v) =>
                        updateField(selected.id, { locked: v })
                      }
                    />
                  </div>
                </div>

                <Separator />

                {/* Alignment buttons */}
                <div>
                  <Label className="mb-2 block text-xs">Align to page</Label>
                  <div className="grid grid-cols-3 gap-1">
                    <Button
                      size="sm"
                      variant="outline"
                      title="Align left"
                      onClick={() => alignField(selected.id, "left")}
                    >
                      <AlignLeft className="size-3" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      title="Center horizontally"
                      onClick={() => alignField(selected.id, "center-h")}
                    >
                      <AlignCenter className="size-3" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      title="Align right"
                      onClick={() => alignField(selected.id, "right")}
                    >
                      <AlignRight className="size-3" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      title="Align top"
                      onClick={() => alignField(selected.id, "top")}
                    >
                      <AlignVerticalJustifyStart className="size-3" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      title="Center vertically"
                      onClick={() => alignField(selected.id, "middle")}
                    >
                      <AlignVerticalJustifyCenter className="size-3" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      title="Align bottom"
                      onClick={() => alignField(selected.id, "bottom")}
                    >
                      <AlignVerticalJustifyEnd className="size-3" />
                    </Button>
                  </div>
                </div>

                <Separator />

                {/* Quick geometry info */}
                <div className="rounded border bg-muted/30 p-2 text-[10px] text-muted-foreground">
                  <div className="flex justify-between">
                    <span>Right edge:</span>
                    <span className="font-mono">
                      {Math.round(selected.x + selected.width)} mm
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Bottom edge:</span>
                    <span className="font-mono">
                      {Math.round(selected.y + selected.height)} mm
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Center:</span>
                    <span className="font-mono">
                      ({Math.round(selected.x + selected.width / 2)},{" "}
                      {Math.round(selected.y + selected.height / 2)})
                    </span>
                  </div>
                </div>
              </>
            ) : (
              <div className="py-8 text-center text-sm text-muted-foreground">
                <Move className="mx-auto mb-2 size-6 opacity-40" />
                Select a field on the canvas or from the list to edit its
                properties.
              </div>
            )}

            <Separator />

            {/* Page settings */}
            <h3 className="text-xs font-semibold uppercase text-muted-foreground">
              Page
            </h3>
            <div>
              <Label className="text-xs">Size</Label>
              <Select
                value={template.page_size ?? "A4"}
                onValueChange={(v) =>
                  updateTemplate({ page_size: v as "A4" | "Letter" })
                }
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Page size" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="A4">A4 (210 × 297 mm)</SelectItem>
                  <SelectItem value="Letter">
                    Letter (216 × 279 mm)
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="mb-1 block text-xs">Margins (mm)</Label>
              <div className="grid grid-cols-2 gap-2">
                {(["top", "bottom", "left", "right"] as const).map((m) => (
                  <div key={m}>
                    <Label className="text-[10px] capitalize text-muted-foreground">
                      {m}
                    </Label>
                    <Input
                      type="number"
                      value={template[`page_margin_${m}`] ?? 20}
                      onChange={(e) =>
                        updateTemplate({
                          [`page_margin_${m}`]: Number(e.target.value) || 0,
                        } as Partial<DocumentTemplate>)
                      }
                    />
                  </div>
                ))}
              </div>
            </div>

            <p className="text-[10px] text-muted-foreground">
              Snap threshold: {SNAP_THRESHOLD} mm · Scale: 1mm = {SCALE}px
            </p>
          </div>
        </ScrollArea>
      </div>
    </div>
  );
}
