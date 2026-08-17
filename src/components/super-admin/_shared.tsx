"use client";

import * as React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, Save, RotateCcw } from "lucide-react";

/* ───────────────────────────────────────────────────────────────────────
   Shared helpers for the super-admin settings tabs.

   Each tab is a self-contained Card with a header (title + description
   + "Save" / "Reset" actions) and a body. The save action becomes
   highlighted (copper accent) when the form is dirty.

   These helpers keep the per-tab files short — each tab only declares
   its own fields + a save handler; the dirty-tracking, loading spinners,
   and disabled-while-saving logic are centralized here.
   ─────────────────────────────────────────────────────────────────────── */

export function SettingsCardHeader({
  title,
  description,
  dirty,
  saving,
  onSave,
  onReset,
  resetLabel = "Reset to Defaults",
  saveLabel = "Save Changes",
}: {
  title: string;
  description: string;
  dirty: boolean;
  saving: boolean;
  onSave?: () => void;
  onReset?: () => void;
  resetLabel?: string;
  saveLabel?: string;
}) {
  return (
    <CardHeader className="pb-3">
      <div className="flex items-start justify-between flex-wrap gap-3">
        <div className="space-y-1">
          <CardTitle className="text-base flex items-center gap-2">
            {title}
            {dirty && (
              <Badge
                variant="outline"
                className="text-[10px] uppercase tracking-wider bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/30"
              >
                unsaved
              </Badge>
            )}
          </CardTitle>
          <CardDescription className="text-xs max-w-prose">{description}</CardDescription>
        </div>
        {(onSave || onReset) && (
          <div className="flex items-center gap-2 shrink-0">
            {onReset && (
              <Button variant="outline" size="sm" onClick={onReset} disabled={saving || !dirty}>
                <RotateCcw className="size-3.5 mr-1" /> {resetLabel}
              </Button>
            )}
            {onSave && (
              <Button
                size="sm"
                onClick={onSave}
                disabled={saving || !dirty}
                className={dirty ? "bg-gradient-emerald text-white" : ""}
              >
                {saving ? <Loader2 className="size-3.5 mr-1 animate-spin" /> : <Save className="size-3.5 mr-1" />}
                {saveLabel}
              </Button>
            )}
          </div>
        )}
      </div>
    </CardHeader>
  );
}

export function SectionLabel({ children, hint }: { children: React.ReactNode; hint?: string }) {
  return (
    <div className="flex items-center gap-2 mb-2 mt-4 first:mt-0">
      <h4 className="text-sm font-medium">{children}</h4>
      <div className="h-px flex-1 bg-border/60" />
      {hint && <span className="text-[11px] text-muted-foreground">{hint}</span>}
    </div>
  );
}

export function FieldRow({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-[1fr_auto] items-start gap-3 py-1.5">
      <div className="space-y-1">
        <label className="text-sm font-medium">{label}</label>
        {hint && <p className="text-[11px] text-muted-foreground leading-snug">{hint}</p>}
      </div>
      <div className="md:w-40 flex items-center gap-2">{children}</div>
    </div>
  );
}

export function LoadingCard({ title }: { title: string }) {
  return (
    <Card className="border-border/60 shadow-soft rounded-xl">
      <CardHeader className="pb-3">
        <CardTitle className="text-base">{title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-10 w-full rounded-md bg-muted/40 animate-pulse" />
        ))}
      </CardContent>
    </Card>
  );
}

export function ErrorCard({ title, message }: { title: string; message: string }) {
  return (
    <Card className="border-destructive/30 bg-destructive/5">
      <CardHeader className="pb-3">
        <CardTitle className="text-base text-destructive">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-destructive/90">{message}</p>
      </CardContent>
    </Card>
  );
}
