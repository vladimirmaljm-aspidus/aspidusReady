"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Bell, Clock, Receipt, FileText, MessageSquare, FolderOpen, KanbanSquare, Sparkles } from "lucide-react";
import { PageHeader } from "@/components/common/page-header";

const PLANNED = [
  { icon: Bell, label: "Reminders", desc: "Personal to-do reminders with due dates and priority." },
  { icon: Clock, label: "Time Tracker", desc: "Start/stop timers against deals and tasks; weekly reports." },
  { icon: Receipt, label: "Expenses", desc: "Log expenses, attach receipts, export for accounting." },
  { icon: FileText, label: "Meeting Notes", desc: "Structured notes linked to partners and deals." },
  { icon: MessageSquare, label: "Team Chat", desc: "Internal chat with @mentions and per-channel history." },
  { icon: FolderOpen, label: "File Manager", desc: "Shared file drive with folder tagging." },
  { icon: KanbanSquare, label: "Project Tasks", desc: "Kanban board for cross-team project delivery." },
];

export function WorkspaceView() {
  return (
    <div>
      <PageHeader
        title="Workspace"
        description="Team collaboration surface — under active development."
      />
      <Card className="border-dashed">
        <CardContent className="p-8 space-y-6">
          <div className="flex items-start gap-4">
            <div className="size-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
              <Sparkles className="size-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-semibold">Coming soon</h2>
                <Badge variant="outline" className="text-[10px]">In development</Badge>
              </div>
              <p className="text-sm text-muted-foreground mt-1 max-w-2xl">
                The Workspace module bundles the day-to-day tools your team uses alongside CRM data.
                We&apos;re rolling it out one tab at a time so nothing lands half-finished.
                In the meantime, use <strong>Tasks</strong> for to-dos and <strong>Quick Notes</strong> for personal notes.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 pt-2">
            {PLANNED.map((p) => {
              const Icon = p.icon;
              return (
                <div key={p.label} className="flex items-start gap-3 p-3 rounded-lg border border-border/60 bg-muted/20">
                  <div className="size-9 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
                    <Icon className="size-4" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium">{p.label}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{p.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
