"use client";

import { create } from "zustand";

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
  | "portal-documents"
  | "portal-catalog"
  | "portal-profile"
  | "portal-kyc"
  | "portal-rfq"
  | "portal-messages";

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
}));

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
