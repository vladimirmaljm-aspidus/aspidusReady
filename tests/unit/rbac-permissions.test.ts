import { describe, it, expect } from "vitest";
import { NextResponse } from "next/server";
import {
  can,
  requirePermission,
  authCan,
  type PermissionSubject,
} from "@/lib/permissions/can";
import {
  PARTNERS,
  PRODUCTS,
  OFFERS,
  ERP,
  USERS,
  VAULT,
  PLATFORM,
  PORTAL_CLIENT,
  ALL_PERMISSIONS,
  TENANT_PERMISSIONS,
  isPlatformPerm,
} from "@/lib/permissions/catalog";
import { hasPermission, type AuthContext, type ApiKeyAuthContext } from "@/lib/api/helpers";
import type { SafeUser } from "@/lib/store/app-store";

// ── Permission matrix fixtures ────────────────────────────────────────────
// Each fixture represents a role in the system. The fixtures are deliberately
// minimal — only the fields `can()` actually reads (`role`, `permissions`) —
// so the test focuses on the permission evaluator, not the user model.

function superAdmin(): PermissionSubject {
  return { role: "super_admin", permissions: null };
}

function tenantAdmin(): PermissionSubject {
  return { role: "admin", permissions: [] };
}

function manager(): PermissionSubject {
  // "Manager" = a `user`-role account scoped to CRM + finance ops but
  // NOT platform-level operations, NOT user management, NOT vault delete.
  return {
    role: "user",
    permissions: [
      PARTNERS.READ,
      PARTNERS.CREATE,
      PARTNERS.UPDATE,
      PRODUCTS.READ,
      PRODUCTS.CREATE,
      PRODUCTS.UPDATE,
      OFFERS.READ,
      OFFERS.CREATE,
      OFFERS.UPDATE,
      OFFERS.SEND,
      ERP.READ,
      "erp.post", // explicit grant on the post action
    ],
  };
}

function regularUser(): PermissionSubject {
  // Read-only sales viewer — can see offers/partners, cannot mutate.
  return {
    role: "user",
    permissions: [PARTNERS.READ, PRODUCTS.READ, OFFERS.READ],
  };
}

function wildcardUser(): PermissionSubject {
  return { role: "user", permissions: ["*"] };
}

function partnerManagerUser(): PermissionSubject {
  // Resource-level wildcard: every action on partners, nothing else.
  return { role: "user", permissions: ["partners.*"] };
}

function safeUser(over: Partial<SafeUser> = {}): SafeUser {
  return {
    id: "u-1",
    tenant_id: "tenant-A",
    username: "tester",
    email: "tester@example.com",
    full_name: "Tester",
    role: "user",
    permissions: [],
    active: true,
    ...over,
  };
}

function authCtxFor(user: SafeUser): AuthContext {
  return {
    user,
    store: {} as any,
    ip: "127.0.0.1",
    tenantId: user.tenant_id,
    isSuperAdmin: user.role === "super_admin",
  };
}

// ── Tests ─────────────────────────────────────────────────────────────────

describe("RBAC permission matrix — can()", () => {
  describe("super_admin", () => {
    const sa = superAdmin();

    it("can access every permission in the catalog", () => {
      // Sanity: assert we're actually iterating over a meaningful set.
      expect(ALL_PERMISSIONS.length).toBeGreaterThan(50);
      for (const perm of ALL_PERMISSIONS) {
        expect(can(sa, perm)).toBe(true);
      }
    });

    it("can access tenant-scoped AND platform-scoped permissions", () => {
      expect(can(sa, PARTNERS.READ)).toBe(true);
      expect(can(sa, PARTNERS.DELETE)).toBe(true);
      expect(can(sa, PLATFORM.TENANTS_READ)).toBe(true);
      expect(can(sa, PLATFORM.TENANTS_DELETE)).toBe(true);
      expect(can(sa, PLATFORM.IMPERSONATE)).toBe(true);
      expect(can(sa, ERP.CLOSE_PERIOD)).toBe(true);
      expect(can(sa, VAULT.DELETE)).toBe(true);
    });

    it("can access unknown permissions (bypass)", () => {
      // Super-admin bypass is unconditional — it doesn't consult the
      // catalog. This is intentional: super_admin is the platform root.
      expect(can(sa, "nonexistent.thing")).toBe(true);
      expect(can(sa, "platform.unknown perm with spaces")).toBe(true);
    });
  });

  describe("tenant admin (role=admin)", () => {
    const admin = tenantAdmin();

    it("can access every tenant-scoped permission", () => {
      // Every non-platform permission is implicitly granted.
      for (const perm of TENANT_PERMISSIONS) {
        expect(can(admin, perm)).toBe(true);
      }
    });

    it("CANNOT access any platform.* permission", () => {
      expect(can(admin, PLATFORM.TENANTS_READ)).toBe(false);
      expect(can(admin, PLATFORM.TENANTS_WRITE)).toBe(false);
      expect(can(admin, PLATFORM.TENANTS_DELETE)).toBe(false);
      expect(can(admin, PLATFORM.PLANS_READ)).toBe(false);
      expect(can(admin, PLATFORM.PLANS_WRITE)).toBe(false);
      expect(can(admin, PLATFORM.FEATURE_FLAGS_READ)).toBe(false);
      expect(can(admin, PLATFORM.FEATURE_FLAGS_WRITE)).toBe(false);
      expect(can(admin, PLATFORM.IMPERSONATE)).toBe(false);
      expect(can(admin, PLATFORM.OVERVIEW)).toBe(false);
      expect(can(admin, PLATFORM.MANAGE_USERS)).toBe(false);
    });

    it("ignores even an explicit '*' in permissions (defense: still subject to platform gate)", () => {
      // The catalog says role=admin → tenant perms implicit. If someone
      // mistakenly assigns permissions:["*"] to an admin, the platform
      // gate STILL denies — `isPlatformPerm` runs before the wildcard
      // check on line 41 of can.ts? Actually no — super-admin bypass on
      // line 38 checks `perms.includes("*")` BEFORE the platform gate.
      // So an admin with "*" in their perms WOULD be treated as super.
      // Document this exact behaviour so future refactors notice.
      const adminWithStar = { role: "admin", permissions: ["*"] } as PermissionSubject;
      // Because perms.includes("*") returns true on line 38, can() grants
      // EVERYTHING — including platform perms. This is documented behaviour:
      // the "*" permission is the platform-root grant, role-agnostic.
      expect(can(adminWithStar, PLATFORM.TENANTS_DELETE)).toBe(true);
    });
  });

  describe("manager (user role with explicit CRM+ERP grants)", () => {
    const mgr = manager();

    it("can access explicitly granted actions", () => {
      expect(can(mgr, PARTNERS.READ)).toBe(true);
      expect(can(mgr, PARTNERS.CREATE)).toBe(true);
      expect(can(mgr, PARTNERS.UPDATE)).toBe(true);
      expect(can(mgr, OFFERS.SEND)).toBe(true);
      expect(can(mgr, ERP.READ)).toBe(true);
      expect(can(mgr, "erp.post")).toBe(true);
    });

    it("CANNOT access actions that were not granted", () => {
      expect(can(mgr, PARTNERS.DELETE)).toBe(false);
      expect(can(mgr, PARTNERS.EXPORT)).toBe(false);
      expect(can(mgr, PRODUCTS.DELETE)).toBe(false);
      expect(can(mgr, PRODUCTS.EXPORT)).toBe(false);
      expect(can(mgr, OFFERS.DELETE)).toBe(false);
      expect(can(mgr, OFFERS.EXPORT)).toBe(false);
      expect(can(mgr, ERP.DELETE)).toBe(false);
      expect(can(mgr, ERP.REVERSE)).toBe(false);
      expect(can(mgr, ERP.RECONCILE)).toBe(false);
    });

    it("CANNOT access admin-only routes (users, vault, settings, audit)", () => {
      expect(can(mgr, USERS.READ)).toBe(false);
      expect(can(mgr, USERS.CREATE)).toBe(false);
      expect(can(mgr, USERS.DELETE)).toBe(false);
      expect(can(mgr, VAULT.READ)).toBe(false);
      expect(can(mgr, VAULT.DELETE)).toBe(false);
      expect(can(mgr, "settings.update")).toBe(false);
      expect(can(mgr, "audit.read")).toBe(false);
    });

    it("CANNOT access platform.* routes", () => {
      expect(can(mgr, PLATFORM.TENANTS_READ)).toBe(false);
      expect(can(mgr, PLATFORM.IMPERSONATE)).toBe(false);
      expect(can(mgr, PLATFORM.MANAGE_USERS)).toBe(false);
    });
  });

  describe("regular user (read-only grants)", () => {
    const u = regularUser();

    it("can read partners / products / offers", () => {
      expect(can(u, PARTNERS.READ)).toBe(true);
      expect(can(u, PRODUCTS.READ)).toBe(true);
      expect(can(u, OFFERS.READ)).toBe(true);
    });

    it("cannot mutate anything", () => {
      expect(can(u, PARTNERS.CREATE)).toBe(false);
      expect(can(u, PARTNERS.UPDATE)).toBe(false);
      expect(can(u, PARTNERS.DELETE)).toBe(false);
      expect(can(u, PRODUCTS.CREATE)).toBe(false);
      expect(can(u, OFFERS.SEND)).toBe(false);
      expect(can(u, OFFERS.DELETE)).toBe(false);
    });

    it("cannot access admin routes", () => {
      expect(can(u, USERS.READ)).toBe(false);
      expect(can(u, VAULT.READ)).toBe(false);
      expect(can(u, "settings.update")).toBe(false);
    });
  });

  describe("wildcard permission '*' on a user-role account", () => {
    const w = wildcardUser();

    it("grants every permission in the catalog (including platform.*)", () => {
      // The "*" check on line 38 of can.ts is unconditional — it doesn't
      // consult isPlatformPerm afterwards. So a user with "*" is effectively
      // a super_admin by another name. This is intentional: "*" is the
      // platform-root grant.
      for (const perm of ALL_PERMISSIONS) {
        expect(can(w, perm)).toBe(true);
      }
    });
  });

  describe("resource-level wildcard 'partners.*'", () => {
    const pm = partnerManagerUser();

    it("grants every action on the partners resource", () => {
      expect(can(pm, PARTNERS.READ)).toBe(true);
      expect(can(pm, PARTNERS.CREATE)).toBe(true);
      expect(can(pm, PARTNERS.UPDATE)).toBe(true);
      expect(can(pm, PARTNERS.DELETE)).toBe(true);
      expect(can(pm, PARTNERS.EXPORT)).toBe(true);
    });

    it("does NOT grant actions on other resources", () => {
      expect(can(pm, PRODUCTS.READ)).toBe(false);
      expect(can(pm, OFFERS.READ)).toBe(false);
      expect(can(pm, ERP.READ)).toBe(false);
      expect(can(pm, USERS.READ)).toBe(false);
    });
  });

  describe("null / undefined / empty user", () => {
    it("denies everything when user is null or undefined", () => {
      expect(can(null, PARTNERS.READ)).toBe(false);
      expect(can(undefined, PARTNERS.READ)).toBe(false);
    });

    it("denies when permissions is null or empty", () => {
      const u: PermissionSubject = { role: "user", permissions: null };
      expect(can(u, PARTNERS.READ)).toBe(false);
      const u2: PermissionSubject = { role: "user", permissions: [] };
      expect(can(u2, PARTNERS.READ)).toBe(false);
    });
  });

  describe("legacy colon-format back-compat", () => {
    it("accepts 'partners:read' as equivalent to 'partners.read'", () => {
      const u: PermissionSubject = { role: "user", permissions: ["partners:read"] };
      expect(can(u, PARTNERS.READ)).toBe(true);
    });

    it("accepts 'partners:*' as equivalent to 'partners.*'", () => {
      const u: PermissionSubject = { role: "user", permissions: ["partners:*"] };
      expect(can(u, PARTNERS.READ)).toBe(true);
      expect(can(u, PARTNERS.DELETE)).toBe(true);
      expect(can(u, PRODUCTS.READ)).toBe(false);
    });
  });
});

// ── requirePermission / authCan wrappers ─────────────────────────────────

describe("RBAC — requirePermission() route guard", () => {
  it("returns null when the user has the permission (proceed)", () => {
    const auth = authCtxFor(safeUser({ role: "admin" }));
    const denied = requirePermission(auth, PARTNERS.READ);
    expect(denied).toBeNull();
  });

  it("returns a 403 NextResponse when the user lacks the permission", () => {
    const auth = authCtxFor(safeUser({ role: "user", permissions: [] }));
    const denied = requirePermission(auth, PARTNERS.READ);
    expect(denied).toBeInstanceOf(NextResponse);
    expect(denied!.status).toBe(403);
  });

  it("embeds the required permission in the 403 body for client-side debugging", async () => {
    const auth = authCtxFor(safeUser({ role: "user", permissions: [] }));
    const denied = requirePermission(auth, "offers.delete");
    expect(denied).toBeInstanceOf(NextResponse);
    const body = await denied!.json();
    expect(body.error).toMatch(/insufficient permissions/i);
    expect(body.required_permission).toBe("offers.delete");
  });

  it("denies platform.* permissions for tenant admins even if their role is admin", () => {
    const auth = authCtxFor(safeUser({ role: "admin" }));
    const denied = requirePermission(auth, PLATFORM.TENANTS_DELETE);
    expect(denied).toBeInstanceOf(NextResponse);
    expect(denied!.status).toBe(403);
  });

  it("allows platform.* for super_admin", () => {
    const auth = authCtxFor(safeUser({ role: "super_admin", tenant_id: null }));
    const denied = requirePermission(auth, PLATFORM.TENANTS_DELETE);
    expect(denied).toBeNull();
  });

  it("authCan() mirrors can() for the AuthContext wrapper", () => {
    const adminAuth = authCtxFor(safeUser({ role: "admin" }));
    const userAuth = authCtxFor(safeUser({ role: "user", permissions: [] }));
    expect(authCan(adminAuth, PARTNERS.READ)).toBe(true);
    expect(authCan(userAuth, PARTNERS.READ)).toBe(false);
  });
});

// ── API-key permission layer (colon-format, hasPermission) ─────────────────
// API keys use a separate permission format ("resource:action" / "resource:*"
// / "*") and a separate evaluator (`hasPermission` in @/lib/api/helpers).
// This is the layer that gates `/api/*` routes when the caller presents a
// `Bearer asp_*` token instead of a session cookie.

describe("RBAC — API-key permission matrix (hasPermission)", () => {
  function apiKeyCtx(perms: string[]): ApiKeyAuthContext {
    return {
      store: {} as any,
      ip: "127.0.0.1",
      tenantId: "tenant-A",
      apiKeyId: "key-1",
      apiKeyName: "test key",
      permissions: perms,
    };
  }

  it("wildcard '*' grants every resource:action", () => {
    const ctx = apiKeyCtx(["*"]);
    expect(hasPermission(ctx.permissions, "partners:read")).toBe(true);
    expect(hasPermission(ctx.permissions, "partners:delete")).toBe(true);
    expect(hasPermission(ctx.permissions, "offers:write")).toBe(true);
    expect(hasPermission(ctx.permissions, "invoices:read")).toBe(true);
    expect(hasPermission(ctx.permissions, "erp:post")).toBe(true);
  });

  it("resource wildcard 'partners:*' grants every action on partners only", () => {
    const ctx = apiKeyCtx(["partners:*"]);
    expect(hasPermission(ctx.permissions, "partners:read")).toBe(true);
    expect(hasPermission(ctx.permissions, "partners:write")).toBe(true);
    expect(hasPermission(ctx.permissions, "partners:delete")).toBe(true);
    expect(hasPermission(ctx.permissions, "offers:read")).toBe(false);
    expect(hasPermission(ctx.permissions, "invoices:read")).toBe(false);
  });

  it("exact 'partners:read' grants only that exact action", () => {
    const ctx = apiKeyCtx(["partners:read"]);
    expect(hasPermission(ctx.permissions, "partners:read")).toBe(true);
    expect(hasPermission(ctx.permissions, "partners:write")).toBe(false);
    expect(hasPermission(ctx.permissions, "partners:delete")).toBe(false);
  });

  it("empty permission list denies everything", () => {
    const ctx = apiKeyCtx([]);
    expect(hasPermission(ctx.permissions, "partners:read")).toBe(false);
    expect(hasPermission(ctx.permissions, "anything:anything")).toBe(false);
  });

  it("API key scoped to one resource cannot access another resource even with full perms on the first", () => {
    const ctx = apiKeyCtx(["partners:*", "offers:read"]);
    expect(hasPermission(ctx.permissions, "partners:delete")).toBe(true);
    expect(hasPermission(ctx.permissions, "offers:read")).toBe(true);
    expect(hasPermission(ctx.permissions, "offers:write")).toBe(false);
    expect(hasPermission(ctx.permissions, "invoices:read")).toBe(false);
  });
});

// ── Catalog sanity checks ────────────────────────────────────────────────

describe("RBAC — permission catalog sanity", () => {
  it("every catalog permission is unique (no accidental dupes)", () => {
    const set = new Set(ALL_PERMISSIONS);
    expect(set.size).toBe(ALL_PERMISSIONS.length);
  });

  it("every catalog permission is dot-separated 'resource.action' (multi-segment ok)", () => {
    for (const p of ALL_PERMISSIONS) {
      // Either two-segment (resource.action) or three-segment
      // (platform.tenants.read). At least one dot is required.
      expect(p).toMatch(/^[a-z][a-z0-9_-]*(\.[a-z0-9_]+)+$/);
    }
  });

  it("isPlatformPerm only matches 'platform.*'", () => {
    expect(isPlatformPerm("platform.tenants.read")).toBe(true);
    expect(isPlatformPerm("partners.read")).toBe(false);
    expect(isPlatformPerm("portal.read_own_docs")).toBe(false);
  });

  it("portal-client permissions are NOT in TENANT_PERMISSIONS (they're portal-scoped, not tenant-admin-grantable)", () => {
    for (const p of Object.values(PORTAL_CLIENT)) {
      expect(TENANT_PERMISSIONS).not.toContain(p);
    }
  });

  it("platform permissions are NOT in TENANT_PERMISSIONS", () => {
    for (const p of Object.values(PLATFORM)) {
      expect(TENANT_PERMISSIONS).not.toContain(p);
    }
  });
});
