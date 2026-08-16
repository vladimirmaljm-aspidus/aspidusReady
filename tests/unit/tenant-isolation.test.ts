import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest, NextResponse } from "next/server";
import type { SafeUser } from "@/lib/store/app-store";
import type { AuthContext, ApiKeyAuthContext } from "@/lib/api/helpers";

// ── Tenant isolation tests ────────────────────────────────────────────────
//
// The single most important multi-tenancy invariant in the platform:
//   "A principal authenticated for tenant A MUST NOT be able to read, mutate,
//    or destroy records belonging to tenant B."
//
// This is enforced at TWO layers:
//   1. RLS at the database level (Supabase) — the last line of defense.
//   2. The route handler's `existing.tenant_id !== auth.tenantId` check,
//      which is the application-level gate that produces a 404 BEFORE the
//      store mutation is attempted. Returning 404 (not 403) is intentional:
//      it hides the existence of the cross-tenant row from the caller.
//
// These tests target layer #2 — they exercise the route handlers directly
// with a mocked AuthContext for tenant-A and a mock store that returns
// tenant-B entities. The handlers MUST bail with 404 BEFORE attempting the
// mutation.

// ── Mocked auth + store state ─────────────────────────────────────────────
//
// vi.hoisted lets us define mutable state the mock factory can read at
// call time. (vitest hoists vi.mock calls above imports — referencing
// outer-scope variables directly would throw.)

const mockState = vi.hoisted(() => ({
  // The AuthContext that `requireAuth` / `requireAuthOrApiKey` will resolve
  // to. Set in beforeEach to a tenant-A principal.
  auth: null as AuthContext | null,
  // The mock store attached to that AuthContext. Methods are stubbed per-test.
  store: null as any,
  // Whether requireAuth should return a 401 (simulating "no session").
  unauthenticated: false,
}));

vi.mock("@/lib/api/helpers", () => ({
  requireAuth: vi.fn(async () => {
    if (mockState.unauthenticated) {
      return NextResponse.json({ error: "Not authenticated." }, { status: 401 });
    }
    return mockState.auth as AuthContext;
  }),
  requireAuthOrApiKey: vi.fn(async () => {
    if (mockState.unauthenticated) {
      return NextResponse.json({ error: "Not authenticated." }, { status: 401 });
    }
    return mockState.auth as AuthContext;
  }),
  // resolveTenantId: defer to the auth context's tenantId (the same logic the
  // real function uses for non-super-admin principals).
  resolveTenantId: vi.fn((auth: AuthContext | ApiKeyAuthContext) => auth.tenantId),
  // API-key permission gate — always grant in tests (we test it elsewhere).
  hasPermission: vi.fn(() => true),
  // No-op audit + passthrough sanitize for the route's catch blocks.
  audit: vi.fn(async () => {}),
  sanitizeError: vi.fn((e: unknown) =>
    e instanceof Error ? e.message : String(e ?? "Internal server error."),
  ),
  // Stubs that aren't used by the routes under test but must exist as exports
  // so the module shape matches what `import * from "@/lib/api/helpers"` expects.
  requireAdmin: vi.fn(async () => mockState.auth as AuthContext),
  requireSuperAdmin: vi.fn(async () => mockState.auth as AuthContext),
  requireApiKeyAuth: vi.fn(async () =>
    NextResponse.json({ error: "API key required." }, { status: 401 }),
  ),
  getIp: vi.fn(() => "127.0.0.1"),
}));

vi.mock("@/lib/api/feature-guard", () => ({
  // Always allow the module — tenant isolation is independent of plan gating.
  requireFeature: vi.fn(async () => null),
}));

vi.mock("@/lib/api/plan-limits", () => ({
  // Never deny on quota — we want to reach the IDOR check.
  enforceQuota: vi.fn(async () => null),
}));

vi.mock("@/lib/webhooks/deliver", () => ({
  triggerWebhooks: vi.fn(async () => {}),
}));

vi.mock("@/lib/realtime/notify", () => ({
  notifyOfferUpdate: vi.fn(async () => {}),
  notifyInvoicePayment: vi.fn(async () => {}),
  notifyNewMessage: vi.fn(async () => {}),
  notifyPortalActivity: vi.fn(async () => {}),
  emitNotification: vi.fn(async () => {}),
}));

// ── Import route handlers AFTER mocks are registered ──────────────────────
// (vitest hoists vi.mock above imports automatically.)

import { GET as getProduct, PUT as putProduct, DELETE as deleteProduct } from "@/app/api/products/[id]/route";
import { GET as getOffer, PUT as putOffer, DELETE as deleteOffer } from "@/app/api/offers/[id]/route";
import { GET as getPartner, PUT as putPartner, DELETE as deletePartner } from "@/app/api/partners/[id]/route";
import { POST as postOffer } from "@/app/api/offers/route";

// ── Fixtures ──────────────────────────────────────────────────────────────

const TENANT_A = "tenant-A";
const TENANT_B = "tenant-B";

function tenantAUser(over: Partial<SafeUser> = {}): SafeUser {
  return {
    id: "u-tenant-a",
    tenant_id: TENANT_A,
    username: "alice",
    email: "alice@a.example",
    full_name: "Alice",
    role: "admin",
    permissions: [],
    active: true,
    ...over,
  };
}

function makeAuthCtx(user: SafeUser, store: any): AuthContext {
  return {
    user,
    store,
    ip: "127.0.0.1",
    tenantId: user.tenant_id,
    isSuperAdmin: user.role === "super_admin",
  };
}

function makeStore(over: Record<string, any> = {}): any {
  return {
    // Most methods are unused in the cross-tenant bail path; stub them as
    // vi.fn() so any unexpected call surfaces clearly in the test output.
    getProduct: vi.fn(async () => null),
    getOffer: vi.fn(async () => null),
    getPartner: vi.fn(async () => null),
    upsertProduct: vi.fn(async (p: any) => p),
    upsertOffer: vi.fn(async (o: any) => o),
    upsertPartner: vi.fn(async (p: any) => p),
    deleteProduct: vi.fn(async () => {}),
    deleteOffer: vi.fn(async () => {}),
    deletePartner: vi.fn(async () => {}),
    appendAudit: vi.fn(async () => ({})),
    ...over,
  };
}

function req(url: string, init: RequestInit = {}): NextRequest {
  return new NextRequest(new Request(url, init));
}

beforeEach(() => {
  mockState.unauthenticated = false;
  mockState.auth = null;
  mockState.store = null;
});

// ── Tests: GET (read) cross-tenant ────────────────────────────────────────

describe("tenant isolation — cross-tenant READ is blocked", () => {
  it("user from tenant A cannot GET a product belonging to tenant B → 404", async () => {
    const store = makeStore({
      getProduct: vi.fn(async () => ({
        id: "prod-tenant-B",
        tenant_id: TENANT_B,
        sku: "B-SKU",
        name: "Tenant B Widget",
      })),
    });
    const user = tenantAUser();
    mockState.auth = makeAuthCtx(user, store);

    const r = await getProduct(req(`http://localhost/api/products/prod-tenant-B`), {
      params: Promise.resolve({ id: "prod-tenant-B" }),
    });

    expect(r.status).toBe(404);
    // Must NOT have called delete/upsert — the route bailed at the read gate.
    expect(store.upsertProduct).not.toHaveBeenCalled();
    expect(store.deleteProduct).not.toHaveBeenCalled();
    // The store WAS consulted (proving the route actually tried to load the row
    // and didn't 404 for some other reason).
    expect(store.getProduct).toHaveBeenCalledWith("prod-tenant-B");
  });

  it("user from tenant A cannot GET an offer belonging to tenant B → 404", async () => {
    const store = makeStore({
      getOffer: vi.fn(async () => ({
        id: "off-tenant-B",
        tenant_id: TENANT_B,
        number: "OF-2024-001",
        status: "draft",
      })),
    });
    mockState.auth = makeAuthCtx(tenantAUser(), store);

    const r = await getOffer(req(`http://localhost/api/offers/off-tenant-B`), {
      params: Promise.resolve({ id: "off-tenant-B" }),
    });

    expect(r.status).toBe(404);
  });

  it("user from tenant A cannot GET a partner belonging to tenant B → 404", async () => {
    const store = makeStore({
      getPartner: vi.fn(async () => ({
        id: "partner-tenant-B",
        tenant_id: TENANT_B,
        name: "Tenant B Partner",
        portal_token: "should-not-leak",
      })),
    });
    mockState.auth = makeAuthCtx(tenantAUser(), store);

    const r = await getPartner(req(`http://localhost/api/partners/partner-tenant-B`), {
      params: Promise.resolve({ id: "partner-tenant-B" }),
    });

    expect(r.status).toBe(404);
    // portal_token must never appear in any response (D-5 / F-9-1).
    const body = await r.json();
    expect(JSON.stringify(body)).not.toContain("should-not-leak");
  });

  it("returns the entity normally when the principal IS in the same tenant (sanity check)", async () => {
    const store = makeStore({
      getProduct: vi.fn(async () => ({
        id: "prod-tenant-A",
        tenant_id: TENANT_A,
        sku: "A-SKU",
        name: "Tenant A Widget",
      })),
    });
    mockState.auth = makeAuthCtx(tenantAUser(), store);

    const r = await getProduct(req(`http://localhost/api/products/prod-tenant-A`), {
      params: Promise.resolve({ id: "prod-tenant-A" }),
    });

    expect(r.status).toBe(200);
    const body = await r.json();
    expect(body.id).toBe("prod-tenant-A");
  });

  it("super_admin CAN read cross-tenant (they manage the platform)", async () => {
    const store = makeStore({
      getProduct: vi.fn(async () => ({
        id: "prod-tenant-B",
        tenant_id: TENANT_B,
        sku: "B-SKU",
        name: "Tenant B Widget",
      })),
    });
    const sa: SafeUser = {
      ...tenantAUser(),
      id: "super-1",
      role: "super_admin",
      tenant_id: null,
    };
    mockState.auth = makeAuthCtx(sa, store);

    const r = await getProduct(req(`http://localhost/api/products/prod-tenant-B`), {
      params: Promise.resolve({ id: "prod-tenant-B" }),
    });

    expect(r.status).toBe(200);
  });

  it("returns 404 (not 403) so cross-tenant row existence is hidden", async () => {
    // The route intentionally returns 404 rather than 403 — confirming
    // existence of a tenant-B row to a tenant-A principal would itself be
    // an information leak. Lock this in as a contract.
    const store = makeStore({
      getProduct: vi.fn(async () => ({
        id: "prod-tenant-B",
        tenant_id: TENANT_B,
        sku: "B-SKU",
        name: "Tenant B Widget",
      })),
    });
    mockState.auth = makeAuthCtx(tenantAUser(), store);

    const r = await getProduct(req(`http://localhost/api/products/prod-tenant-B`), {
      params: Promise.resolve({ id: "prod-tenant-B" }),
    });

    expect(r.status).toBe(404);
    const body = await r.json();
    // Generic "Not found." — no hint that the row exists in another tenant.
    expect(body.error).toMatch(/not found/i);
    expect(JSON.stringify(body)).not.toContain(TENANT_B);
  });
});

// ── Tests: PUT (update) cross-tenant ──────────────────────────────────────

describe("tenant isolation — cross-tenant UPDATE is blocked", () => {
  it("user from tenant A cannot PUT (update) an offer belonging to tenant B → 404", async () => {
    const store = makeStore({
      getOffer: vi.fn(async () => ({
        id: "off-tenant-B",
        tenant_id: TENANT_B,
        number: "OF-2024-001",
        status: "draft",
      })),
    });
    mockState.auth = makeAuthCtx(tenantAUser(), store);

    const r = await putOffer(
      req(`http://localhost/api/offers/off-tenant-B`, {
        method: "PUT",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ subject: "Hijacked" }),
      }),
      { params: Promise.resolve({ id: "off-tenant-B" }) },
    );

    expect(r.status).toBe(404);
    // The mutation MUST NOT have been attempted on the cross-tenant row.
    expect(store.upsertOffer).not.toHaveBeenCalled();
  });

  it("user from tenant A cannot PUT (update) a product belonging to tenant B → 404", async () => {
    const store = makeStore({
      getProduct: vi.fn(async () => ({
        id: "prod-tenant-B",
        tenant_id: TENANT_B,
        sku: "B-SKU",
        name: "Tenant B Widget",
      })),
    });
    mockState.auth = makeAuthCtx(tenantAUser(), store);

    const r = await putProduct(
      req(`http://localhost/api/products/prod-tenant-B`, {
        method: "PUT",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ name: "Hijacked" }),
      }),
      { params: Promise.resolve({ id: "prod-tenant-B" }) },
    );

    expect(r.status).toBe(404);
    expect(store.upsertProduct).not.toHaveBeenCalled();
  });

  it("user from tenant A cannot PUT (update) a partner belonging to tenant B → 404", async () => {
    const store = makeStore({
      getPartner: vi.fn(async () => ({
        id: "partner-tenant-B",
        tenant_id: TENANT_B,
        name: "Tenant B Partner",
      })),
    });
    mockState.auth = makeAuthCtx(tenantAUser(), store);

    const r = await putPartner(
      req(`http://localhost/api/partners/partner-tenant-B`, {
        method: "PUT",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ name: "Hijacked" }),
      }),
      { params: Promise.resolve({ id: "partner-tenant-B" }) },
    );

    expect(r.status).toBe(404);
    expect(store.upsertPartner).not.toHaveBeenCalled();
  });
});

// ── Tests: DELETE cross-tenant ─────────────────────────────────────────────

describe("tenant isolation — cross-tenant DELETE is blocked", () => {
  it("user from tenant A cannot DELETE a partner belonging to tenant B → 404", async () => {
    const store = makeStore({
      getPartner: vi.fn(async () => ({
        id: "partner-tenant-B",
        tenant_id: TENANT_B,
        name: "Tenant B Partner",
      })),
    });
    mockState.auth = makeAuthCtx(tenantAUser(), store);

    const r = await deletePartner(
      req(`http://localhost/api/partners/partner-tenant-B`, { method: "DELETE" }),
      { params: Promise.resolve({ id: "partner-tenant-B" }) },
    );

    expect(r.status).toBe(404);
    expect(store.deletePartner).not.toHaveBeenCalled();
  });

  it("user from tenant A cannot DELETE an offer belonging to tenant B → 404", async () => {
    const store = makeStore({
      getOffer: vi.fn(async () => ({
        id: "off-tenant-B",
        tenant_id: TENANT_B,
        number: "OF-2024-001",
        status: "draft",
      })),
    });
    mockState.auth = makeAuthCtx(tenantAUser(), store);

    const r = await deleteOffer(
      req(`http://localhost/api/offers/off-tenant-B`, { method: "DELETE" }),
      { params: Promise.resolve({ id: "off-tenant-B" }) },
    );

    expect(r.status).toBe(404);
    expect(store.deleteOffer).not.toHaveBeenCalled();
  });

  it("user from tenant A cannot DELETE a product belonging to tenant B → 404", async () => {
    const store = makeStore({
      getProduct: vi.fn(async () => ({
        id: "prod-tenant-B",
        tenant_id: TENANT_B,
        sku: "B-SKU",
        name: "Tenant B Widget",
      })),
    });
    mockState.auth = makeAuthCtx(tenantAUser(), store);

    const r = await deleteProduct(
      req(`http://localhost/api/products/prod-tenant-B`, { method: "DELETE" }),
      { params: Promise.resolve({ id: "prod-tenant-B" }) },
    );

    expect(r.status).toBe(404);
    expect(store.deleteProduct).not.toHaveBeenCalled();
  });
});

// ── Tests: IDOR (Insecure Direct Object Reference) on create ───────────────

describe("tenant isolation — cross-tenant IDOR on POST /api/offers is blocked", () => {
  it("user from tenant A cannot create an offer referencing tenant B's partner_id → 404 'Partner not found.'", async () => {
    // The route's IDOR guard: when body.partner_id resolves to a partner
    // whose tenant_id differs from the caller's tenant, the route refuses
    // with 404 (NOT 403 — same existence-hiding rationale as the read test).
    const store = makeStore({
      getPartner: vi.fn(async () => ({
        id: "partner-tenant-B",
        tenant_id: TENANT_B,
        name: "Tenant B Partner",
      })),
      upsertOffer: vi.fn(async (o: any) => o),
    });
    mockState.auth = makeAuthCtx(tenantAUser(), store);

    const r = await postOffer(
      req(`http://localhost/api/offers`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          partner_id: "partner-tenant-B",
          subject: "Cross-tenant offer",
          currency: "USD",
          items: [{ quantity: 1, unit_price: 100 }],
        }),
      }),
    );

    expect(r.status).toBe(404);
    const body = await r.json();
    expect(body.error).toMatch(/partner not found/i);
    // The offer MUST NOT have been created.
    expect(store.upsertOffer).not.toHaveBeenCalled();
  });

  it("user from tenant A CAN create an offer referencing their own tenant's partner", async () => {
    const store = makeStore({
      getPartner: vi.fn(async () => ({
        id: "partner-tenant-A",
        tenant_id: TENANT_A,
        name: "Tenant A Partner",
      })),
      upsertOffer: vi.fn(async (o: any) => ({
        id: "off-new",
        number: "OF-2024-001",
        ...o,
      })),
      createDocWithNumber: vi.fn(async (_t: string, o: any) => ({
        id: "off-new",
        number: "OF-2024-001",
        ...o,
      })),
    });
    mockState.auth = makeAuthCtx(tenantAUser(), store);

    const r = await postOffer(
      req(`http://localhost/api/offers`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          partner_id: "partner-tenant-A",
          subject: "Same-tenant offer",
          currency: "USD",
          items: [{ quantity: 1, unit_price: 100 }],
        }),
      }),
    );

    expect(r.status).toBe(200);
  });

  it("does NOT trust a body.tenant_id field that attempts to write into tenant B", async () => {
    // Even if a malicious client sends body.tenant_id = "tenant-B", the
    // route OVERWRITES it with the auth context's tenantId (tenant-A). This
    // is the "force tenant_id from auth context" guard at line 78 of
    // offers/route.ts. We can't observe the overwrite directly (it's an
    // internal field), but we CAN assert that the upsert was called with
    // tenant-A, not tenant-B.
    const store = makeStore({
      getPartner: vi.fn(async () => ({
        id: "partner-tenant-A",
        tenant_id: TENANT_A,
        name: "Tenant A Partner",
      })),
      createDocWithNumber: vi.fn(async (_t: string, o: any) => ({
        id: "off-new",
        number: "OF-2024-001",
        ...o,
      })),
    });
    mockState.auth = makeAuthCtx(tenantAUser(), store);

    const r = await postOffer(
      req(`http://localhost/api/offers`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          partner_id: "partner-tenant-A",
          tenant_id: TENANT_B, // ← malicious
          subject: "Attempting to write into tenant B",
          currency: "USD",
        }),
      }),
    );

    expect(r.status).toBe(200);
    expect(store.createDocWithNumber).toHaveBeenCalled();
    const passed = store.createDocWithNumber.mock.calls[0][1];
    expect(passed.tenant_id).toBe(TENANT_A); // overwritten — NOT tenant-B
  });
});

// ── Tests: API-key tenant lock (resolveTenantId) ──────────────────────────

describe("tenant isolation — API key is locked to its own tenant", () => {
  it("API key scoped to tenant A returns tenant-A even when ?tenant_id=tenant-B is passed", async () => {
    // We test the REAL resolveTenantId (not the mock) to verify the
    // platform's tenant-lock guarantee for API-key auth.
    const real = (await vi.importActual<typeof import("@/lib/api/helpers")>(
      "@/lib/api/helpers",
    ));
    const apiKeyAuth: ApiKeyAuthContext = {
      store: {} as any,
      ip: "127.0.0.1",
      tenantId: TENANT_A,
      apiKeyId: "key-1",
      apiKeyName: "tenant-A key",
      permissions: ["*"],
    };
    const reqWithTenantB = new NextRequest(
      new Request(`http://localhost/api/offers?tenant_id=${TENANT_B}`),
    );
    const tid = real.resolveTenantId(apiKeyAuth, reqWithTenantB);
    expect(tid).toBe(TENANT_A);
  });

  it("regular user from tenant A is locked to tenant-A even with ?tenant_id=tenant-B", async () => {
    const real = (await vi.importActual<typeof import("@/lib/api/helpers")>(
      "@/lib/api/helpers",
    ));
    const auth: AuthContext = {
      user: tenantAUser(),
      store: {} as any,
      ip: "127.0.0.1",
      tenantId: TENANT_A,
      isSuperAdmin: false,
    };
    const reqWithTenantB = new NextRequest(
      new Request(`http://localhost/api/offers?tenant_id=${TENANT_B}`),
    );
    expect(real.resolveTenantId(auth, reqWithTenantB)).toBe(TENANT_A);
  });

  it("super_admin with ?tenant_id=tenant-B can act on tenant B (platform-level support)", async () => {
    const real = (await vi.importActual<typeof import("@/lib/api/helpers")>(
      "@/lib/api/helpers",
    ));
    const auth: AuthContext = {
      user: { ...tenantAUser(), role: "super_admin", tenant_id: null },
      store: {} as any,
      ip: "127.0.0.1",
      tenantId: null,
      isSuperAdmin: true,
    };
    const reqWithTenantB = new NextRequest(
      new Request(`http://localhost/api/offers?tenant_id=${TENANT_B}`),
    );
    expect(real.resolveTenantId(auth, reqWithTenantB)).toBe(TENANT_B);
  });
});
