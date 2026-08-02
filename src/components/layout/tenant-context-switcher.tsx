"use client";

import * as React from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useAppStore, isSuperAdmin } from "@/lib/store/app-store";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import { Badge } from "@/components/ui/badge";
import { Building2, ChevronsUpDown, Check, Search, Globe, ShieldCheck } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface Tenant {
  id: string;
  name: string;
  country?: string | null;
  plan?: string | null;
  status?: string | null;
  currency?: string | null;
}

export function TenantContextSwitcher() {
  const user = useAppStore((s) => s.user);
  const activeTenantId = useAppStore((s) => s.activeTenantId);
  const activeTenantName = useAppStore((s) => s.activeTenantName);
  const setActiveTenant = useAppStore((s) => s.setActiveTenant);
  const qc = useQueryClient();
  const [open, setOpen] = React.useState(false);

  // Fetch tenants list (super-admin only)
  const tenantsQ = useQuery({
    queryKey: ["tenants"],
    queryFn: async () => {
      const r = await fetch("/api/tenants");
      if (!r.ok) throw new Error("Failed to load tenants");
      const data = await r.json();
      return (data.items || []) as Tenant[];
    },
    enabled: isSuperAdmin(user),
  });

  // For regular users, fetch their own tenant info
  const myTenantQ = useQuery({
    queryKey: ["my-tenant", user?.tenant_id],
    queryFn: async () => {
      if (!user?.tenant_id) return null;
      const r = await fetch(`/api/tenants`);
      if (!r.ok) return null;
      const data = await r.json();
      const items = (data.items || []) as Tenant[];
      return items.find((t) => t.id === user.tenant_id) || null;
    },
    enabled: !isSuperAdmin(user) && !!user?.tenant_id,
  });

  // ── Regular user: show read-only tenant badge ──
  if (!isSuperAdmin(user)) {
    const t = myTenantQ.data;
    return (
      <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-muted/50 border border-border/60">
        <Building2 className="size-3.5 text-muted-foreground" />
        <span className="text-sm font-medium truncate max-w-[140px]">
          {t?.name || "My Company"}
        </span>
        {t?.plan && (
          <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-4 capitalize">
            {t.plan}
          </Badge>
        )}
      </div>
    );
  }

  // ── Super-admin: show tenant switcher ──
  const tenants = tenantsQ.data || [];
  const activeTenant = tenants.find((t) => t.id === activeTenantId);

  function handleSelect(t: Tenant) {
    setActiveTenant(t.id, t.name);
    setOpen(false);
    // Invalidate ALL queries so every view refetches with the new tenant context
    qc.clear();
    toast.success(`Tenant context: ${t.name}`, {
      description: "All data is now scoped to this tenant.",
    });
  }

  function handleClear() {
    setActiveTenant(null, null);
    setOpen(false);
    qc.clear();
    toast.info("Showing platform-wide view");
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="h-9 gap-2 px-3 bg-card border-border/60 hover:bg-accent/50 max-w-[260px]"
        >
          <div className="flex items-center gap-2 min-w-0">
            {activeTenant ? (
              <>
                <div className="size-6 rounded-md bg-gradient-to-br from-primary/80 to-accent/80 flex items-center justify-center text-white shrink-0">
                  <Building2 className="size-3.5" />
                </div>
                <div className="min-w-0 text-left">
                  <div className="text-xs text-muted-foreground leading-tight">Tenant context</div>
                  <div className="text-sm font-semibold truncate leading-tight">
                    {activeTenant.name}
                  </div>
                </div>
              </>
            ) : (
              <>
                <div className="size-6 rounded-md bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center text-white shrink-0">
                  <Globe className="size-3.5" />
                </div>
                <div className="min-w-0 text-left">
                  <div className="text-xs text-muted-foreground leading-tight">Viewing</div>
                  <div className="text-sm font-semibold truncate leading-tight">All tenants</div>
                </div>
              </>
            )}
            <ChevronsUpDown className="size-3.5 text-muted-foreground shrink-0 ml-1" />
          </div>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[360px] p-0" align="start">
        <Command>
          <CommandInput placeholder="Search tenants..." />
          <CommandList>
            <CommandEmpty>No tenant found.</CommandEmpty>
            <CommandGroup heading="Platform">
              <CommandItem
                onSelect={() => handleClear()}
                className="cursor-pointer"
              >
                <div className="flex items-center gap-2 w-full">
                  <div className="size-7 rounded-md bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center text-white shrink-0">
                    <Globe className="size-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium">All tenants</div>
                    <div className="text-xs text-muted-foreground">Platform-wide view (super-admin)</div>
                  </div>
                  {!activeTenantId && <Check className="size-4 text-primary" />}
                </div>
              </CommandItem>
            </CommandGroup>
            <CommandSeparator />
            <CommandGroup heading="Tenants">
              {tenants.map((t) => (
                <CommandItem
                  key={t.id}
                  onSelect={() => handleSelect(t)}
                  className="cursor-pointer"
                >
                  <div className="flex items-center gap-2 w-full">
                    <div className="size-7 rounded-md bg-gradient-to-br from-primary/80 to-accent/80 flex items-center justify-center text-white shrink-0">
                      <Building2 className="size-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium truncate">{t.name}</div>
                      <div className="text-xs text-muted-foreground flex items-center gap-1.5">
                        {t.country && <span>{t.country}</span>}
                        {t.currency && <span>· {t.currency}</span>}
                        {t.plan && <span>· <span className="capitalize">{t.plan}</span></span>}
                      </div>
                    </div>
                    {activeTenantId === t.id && <Check className="size-4 text-primary shrink-0" />}
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
        <div className="border-t border-border/60 px-3 py-2 bg-muted/30">
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <ShieldCheck className="size-3.5 text-primary" />
            <span>Super-admin mode — data scoped per selection</span>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
