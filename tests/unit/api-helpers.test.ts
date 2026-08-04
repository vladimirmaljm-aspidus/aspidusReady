import { describe, it, expect } from "vitest";
import { NextRequest } from "next/server";
import { hasPermission, resolveTenantId, type AuthContext, type ApiKeyAuthContext } from "@/lib/api/helpers";

describe("hasPermission", () => {
  it("grants access with a wildcard '*' permission", () => {
    expect(hasPermission(["*"], "partners:read")).toBe(true);
  });

  it("grants access with a resource wildcard e.g. 'partners:*'", () => {
    expect(hasPermission(["partners:*"], "partners:delete")).toBe(true);
  });

  it("grants access with an exact resource:action match", () => {
    expect(hasPermission(["partners:read"], "partners:read")).toBe(true);
  });

  it("denies access when the permission is not present", () => {
    expect(hasPermission(["partners:read"], "partners:delete")).toBe(false);
    expect(hasPermission(["invoices:*"], "partners:read")).toBe(false);
  });

  it("denies access for an empty permission list", () => {
    expect(hasPermission([], "partners:read")).toBe(false);
  });
});

describe("resolveTenantId", () => {
  function req(url: string) {
    return new NextRequest(new Request(url));
  }

  it("locks API-key auth to the key's own tenant regardless of query params", () => {
    const auth: ApiKeyAuthContext = {
      store: {} as any,
      ip: "127.0.0.1",
      tenantId: "tenant-A",
      apiKeyId: "key-1",
      apiKeyName: "test key",
      permissions: ["*"],
    };
    const result = resolveTenantId(auth, req("http://localhost/api/deals?tenant_id=tenant-B"));
    expect(result).toBe("tenant-A");
  });

  it("locks a regular (non-super-admin) user to their own tenant even if they pass ?tenant_id=", () => {
    const auth: AuthContext = {
      user: { id: "u1", tenant_id: "tenant-A" } as any,
      store: {} as any,
      ip: "127.0.0.1",
      tenantId: "tenant-A",
      isSuperAdmin: false,
    };
    const result = resolveTenantId(auth, req("http://localhost/api/deals?tenant_id=tenant-B"));
    expect(result).toBe("tenant-A");
  });

  it("lets a super-admin switch tenant context via ?tenant_id=", () => {
    const auth: AuthContext = {
      user: { id: "u1", tenant_id: null } as any,
      store: {} as any,
      ip: "127.0.0.1",
      tenantId: null,
      isSuperAdmin: true,
    };
    const result = resolveTenantId(auth, req("http://localhost/api/deals?tenant_id=tenant-B"));
    expect(result).toBe("tenant-B");
  });

  it("falls back to the super-admin's own tenant (null) when no ?tenant_id= is given", () => {
    const auth: AuthContext = {
      user: { id: "u1", tenant_id: null } as any,
      store: {} as any,
      ip: "127.0.0.1",
      tenantId: null,
      isSuperAdmin: true,
    };
    const result = resolveTenantId(auth, req("http://localhost/api/deals"));
    expect(result).toBeNull();
  });
});
