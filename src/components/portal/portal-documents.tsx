"use client";

import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Search,
  Download,
  FolderOpen,
  Loader2,
  FileCheck,
  Receipt,
  FileSignature,
  File as FileIcon,
} from "lucide-react";
import { fmtDate, fmtBytes } from "@/lib/utils/format";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import type { SharedDocument } from "@/lib/supabase/types";

type DocCategory = SharedDocument["category"];

const CATEGORY_META: Record<
  DocCategory,
  {
    label: string;
    badgeClass: string;
    iconBg: string;
    iconColor: string;
    icon: React.ComponentType<{ className?: string }>;
  }
> = {
  contract: {
    label: "Contract",
    badgeClass: "border-transparent bg-chart-1 text-white",
    iconBg: "bg-gradient-to-br from-primary/15 to-primary/5",
    iconColor: "text-primary",
    icon: FileSignature,
  },
  invoice: {
    label: "Invoice",
    badgeClass: "border-transparent bg-chart-4 text-white",
    iconBg: "bg-gradient-to-br from-rose-500/15 to-rose-500/5",
    iconColor: "text-rose-600 dark:text-rose-400",
    icon: Receipt,
  },
  spec: {
    label: "Specification",
    badgeClass: "border-transparent bg-chart-2 text-white",
    iconBg: "bg-gradient-to-br from-teal-500/15 to-teal-500/5",
    iconColor: "text-teal-600 dark:text-teal-400",
    icon: FileCheck,
  },
  other: {
    label: "Other",
    badgeClass: "bg-secondary text-secondary-foreground",
    iconBg: "bg-gradient-to-br from-muted to-muted/50",
    iconColor: "text-muted-foreground",
    icon: FileIcon,
  },
};

export function PortalDocuments() {
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");

  const docsQ = useQuery<{ items: SharedDocument[]; total: number }>({
    queryKey: ["portal-documents"],
    queryFn: async () => {
      const r = await fetch("/api/portal/documents");
      if (!r.ok) throw new Error("Failed to load documents");
      return r.json();
    },
  });

  const allItems = docsQ.data?.items || [];

  const categories = useMemo(() => {
    const set = new Set<DocCategory>();
    allItems.forEach((d) => set.add(d.category));
    return Array.from(set);
  }, [allItems]);

  const filtered = useMemo(() => {
    let items = allItems;
    if (categoryFilter !== "all") {
      items = items.filter((d) => d.category === categoryFilter);
    }
    if (search) {
      items = items.filter((d) =>
        d.filename.toLowerCase().includes(search.toLowerCase())
      );
    }
    return items;
  }, [allItems, categoryFilter, search]);

  function handleDownload(filename: string) {
    const link = document.createElement("a");
    link.href = `/api/documents/${filename}`;
    link.download = filename;
    link.click();
  }

  return (
    <div className="max-w-6xl mx-auto space-y-5">
      {/* Page header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            My <span className="text-gradient-emerald">Documents</span>
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            {docsQ.data
              ? `${filtered.length} document${filtered.length === 1 ? "" : "s"} shared with you`
              : "Loading documents…"}
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-56">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search files…"
              className="pl-10 h-10 smooth focus-visible:ring-primary/40 focus-visible:border-primary/40"
            />
          </div>
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="h-10 w-full sm:w-44">
              <SelectValue placeholder="All categories" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All categories</SelectItem>
              {categories.map((c) => (
                <SelectItem key={c} value={c}>
                  {CATEGORY_META[c].label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {docsQ.isLoading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="size-6 animate-spin text-muted-foreground" />
        </div>
      ) : filtered.length === 0 ? (
        <EmptyDocuments />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 max-h-[calc(100vh-280px)] overflow-y-auto custom-scroll pr-1">
          {filtered.map((doc) => {
            const meta = CATEGORY_META[doc.category];
            const Icon = meta.icon;
            return (
              <div
                key={doc.id}
                className="card-premium p-5 group cursor-default hover:-translate-y-0.5"
              >
                <div className="flex items-start gap-3">
                  <div
                    className={cn(
                      "size-12 rounded-xl flex items-center justify-center shrink-0 smooth group-hover:scale-105",
                      meta.iconBg
                    )}
                  >
                    <Icon className={cn("size-5", meta.iconColor)} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p
                      className="text-sm font-semibold truncate leading-snug"
                      title={doc.filename}
                    >
                      {doc.filename}
                    </p>
                    <div className="flex items-center gap-2 mt-1.5">
                      <Badge
                        className={cn("text-[10px] px-1.5 py-0", meta.badgeClass)}
                      >
                        {meta.label}
                      </Badge>
                      <span className="text-[11px] text-muted-foreground tabular">
                        {fmtBytes(doc.size)}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="mt-4 flex items-center justify-between">
                  <span className="text-[11px] text-muted-foreground tabular">
                    Uploaded {fmtDate(doc.created_at)}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDownload(doc.filename)}
                    className="h-8 smooth opacity-80 group-hover:opacity-100 hover:shadow-soft"
                  >
                    <Download className="size-3.5 mr-1" /> Download
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function EmptyDocuments() {
  return (
    <div className="card-premium p-12 flex flex-col items-center justify-center text-center">
      <div className="size-16 rounded-full bg-gradient-to-br from-primary/15 to-primary/5 flex items-center justify-center mb-4">
        <FolderOpen className="size-7 text-primary" />
      </div>
      <p className="text-base font-semibold">No documents available</p>
      <p className="text-sm text-muted-foreground mt-1 max-w-sm">
        Documents shared with you by your account manager will appear here.
      </p>
    </div>
  );
}
