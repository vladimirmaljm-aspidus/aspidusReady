"use client";

import { create } from "zustand";
import React from "react";

export type ViewKey =
  // Core CRM
  | "dashboard"
  | "partners"
  | "partner-360"
  | "products"
  | "deals"
  | "commissions"
  | "offers"
  | "demands"
  | "documents"
  | "tasks"
  | "audit"
  // Trade
  | "product-catalog"
  | "supplier-offers"
  | "trade-calculator"
  // Finance
  | "invoices"
  | "proformas"
  | "document-register"
  // Inventory
  | "inventory"
  // Admin
  | "users"
  | "settings"
  | "security"
  | "vault"
  | "api-keys"
  | "webhooks"
  | "mail-queue"
  // Platform (super-admin only)
  | "tenants"
  | "super-admin-overview"
  | "document-templates"
  | "document-verification"
  | "kyc-review"
  | "portal-rfqs"
  | "feature-flags"
  // ERP / Accounting
  | "erp"
  // New features
  | "custom-dashboard"
  | "email-templates"
  | "api-integrations"
  | "calendar"
  // Portal (client-facing, separate mode)
  | "portal-dashboard"
  | "portal-offers"
  | "portal-invoices"
  | "portal-documents"
  | "portal-catalog"
  | "portal-profile"
  | "portal-kyc"
  | "portal-rfq"
  | "portal-messages"
  | "portal-proformas"
  | "portal-notifications";

export interface SafeUser {
  id: string;
  tenant_id: string | null;
  username: string;
  email: string;
  full_name: string | null;
  role: string;
  permissions: string[] | null;
  active: boolean;
}

interface AppState {
  user: SafeUser | null;
  setUser: (u: SafeUser | null) => void;

  // Portal mode — separate from CRM admin
  portalAccess: any | null;
  setPortalAccess: (a: any | null) => void;
  appMode: "crm" | "portal";
  setAppMode: (m: "crm" | "portal") => void;

  view: ViewKey;
  setView: (v: ViewKey) => void;

  selectedId: string | null;
  setSelectedId: (id: string | null) => void;

  sidebarCollapsed: boolean;
  toggleSidebar: () => void;

  loading: boolean;
  setLoading: (b: boolean) => void;

  // ── Tenant context switching (super-admin only) ──
  // When a super-admin selects a tenant, ALL data is scoped to that tenant.
  // Regular users are always locked to their own tenant_id (this field is ignored).
  activeTenantId: string | null;
  activeTenantName: string | null;
  setActiveTenant: (id: string | null, name: string | null) => void;
}

function loadActiveTenant(): { id: string | null; name: string | null } {
  if (typeof window === "undefined") return { id: null, name: null };
  try {
    const raw = localStorage.getItem("aspidus_active_tenant");
    if (!raw) return { id: null, name: null };
    const parsed = JSON.parse(raw);
    return { id: parsed.id || null, name: parsed.name || null };
  } catch {
    return { id: null, name: null };
  }
}

export const useAppStore = create<AppState>((set) => ({
  user: null,
  setUser: (u) => set({ user: u }),

  portalAccess: null,
  setPortalAccess: (a) => set({ portalAccess: a }),
  appMode: "crm",
  setAppMode: (m) => set({ appMode: m, view: m === "portal" ? "portal-dashboard" : "dashboard" }),

  view: "dashboard",
  setView: (v) => set({ view: v, selectedId: null }),

  selectedId: null,
  setSelectedId: (id) => set({ selectedId: id }),

  sidebarCollapsed: false,
  toggleSidebar: () => set((s) => ({ sidebarCollapsed: !s.sidebarCollapsed })),

  loading: false,
  setLoading: (b) => set({ loading: b }),

  // Always initialize as null to avoid SSR hydration mismatch.
  // The TenantContextSwitcher loads from localStorage on mount.
  activeTenantId: null,
  activeTenantName: null,
  setActiveTenant: (id, name) => {
    set({ activeTenantId: id, activeTenantName: name });
    if (typeof window !== "undefined") {
      if (id) {
        localStorage.setItem("aspidus_active_tenant", JSON.stringify({ id, name }));
      } else {
        localStorage.removeItem("aspidus_active_tenant");
      }
    }
  },
}));

/**
 * Call this in a client component's useEffect to hydrate the active tenant
 * from localStorage after mount. This avoids SSR hydration mismatch.
 */
export function useHydrateActiveTenant() {
  const setActiveTenant = useAppStore((s) => s.setActiveTenant);
  React.useEffect(() => {
    const t = loadActiveTenant();
    if (t.id) {
      setActiveTenant(t.id, t.name);
    }
  }, [setActiveTenant]);
}

/**
 * Returns the effective tenant ID for the current session.
 * - Super-admin: returns activeTenantId (manually selected) or user.tenant_id
 * - Regular user: returns user.tenant_id (always their own)
 */
export function useEffectiveTenantId(): string | null {
  const user = useAppStore((s) => s.user);
  const activeTenantId = useAppStore((s) => s.activeTenantId);
  if (isSuperAdmin(user)) {
    return activeTenantId || user?.tenant_id || null;
  }
  return user?.tenant_id || null;
}

/**
 * Returns a query string param for the active tenant, for use in API fetch calls.
 * e.g. "?tenant_id=xxx" or "" if no tenant context is needed.
 * Super-admins use this to scope data to the selected tenant.
 */
export function useTenantParam(): string {
  const tid = useEffectiveTenantId();
  const user = useAppStore((s) => s.user);
  if (!isSuperAdmin(user)) return "";
  if (!tid) return "";
  return `tenant_id=${encodeURIComponent(tid)}`;
}

export function hasPermission(perms: string[] | null | undefined, key: string): boolean {
  if (!perms) return false;
  if (perms.includes("*")) return true;
  return perms.some((p) => {
    if (p === key) return true;
    if (p.endsWith(":*")) return key.startsWith(p.slice(0, -1));
    return false;
  });
}

export function isAdmin(u: SafeUser | null): boolean {
  return u?.role === "admin" || u?.role === "super_admin" || (u?.permissions?.includes("*") ?? false);
}

export function isSuperAdmin(u: SafeUser | null): boolean {
  return u?.role === "super_admin";
}

export function isAccountant(u: SafeUser | null): boolean {
  if (!u) return false;
  if (isAdmin(u)) return true; // admins always have ERP access
  return u.role === "accountant" || hasPermission(u.permissions, "erp:*") || hasPermission(u.permissions, "erp:access");
}
