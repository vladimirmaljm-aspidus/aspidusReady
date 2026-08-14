import { NextRequest, NextResponse } from "next/server";
import { requireAuth, audit, resolveTenantId } from "@/lib/api/helpers";
import { encrypt, decrypt } from "@/lib/api/vault-crypto";

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  try {
    const auth = await requireAuth(req);
    if (auth instanceof NextResponse) return auth;
    // Permission gate (vault.read)
    { const { requirePermission } = await import("@/lib/permissions/can");
      const _d = requirePermission(auth, "vault.read"); if (_d) return _d; } /* requirePermission wired */
    // Feature gate (module_vault)
    { const { requireFeature } = await import("@/lib/api/feature-guard");
      const _f = await requireFeature(auth.tenantId, "module_vault", auth.isSuperAdmin); if (_f) return _f; } /* requireFeature wired */

    const tid = resolveTenantId(auth, req);
    if (!tid) {
      return NextResponse.json({ error: "No tenant context." }, { status: 400 });
    }
    const url = new URL(req.url);
    const search = url.searchParams.get("search") || undefined;
    const category = url.searchParams.get("category") || undefined;
    // `?reveal=true` opts IN to returning the decrypted secret value. By
    // default we strip the value from list responses (defense in depth) — the
    // secret is only revealed when the caller explicitly asks for it. Even
    // when revealed, the value is decrypted in-flight; the DB only stores the
    // AES-256-GCM ciphertext.
    const reveal = url.searchParams.get("reveal") === "true";
    const result = await auth.store.listVault(tid, { search, filters: { category } });
    // Defense-in-depth: even though SupabaseStore filters by tenant_id,
    // this post-filter provides an extra safety layer. Do NOT remove.
    if (!auth.isSuperAdmin && auth.tenantId) {
      result.items = result.items.filter((s) => s.tenant_id === auth.tenantId);
      result.total = result.items.length;
    }
    const items = result.items.map((s) => {
      if (reveal) {
        // Decrypt the stored ciphertext before returning.
        return { ...s, encrypted_value: decrypt(s.encrypted_value) };
      }
      // Default: strip encrypted_value from list response (only reveal on
      // explicit reveal request).
      const { encrypted_value, ...rest } = s;
      return rest;
    });
    // Audit: log the count of vault secrets returned (not each one). (Audit
    // finding D P1 #5 — vault reads were silent.)
    try {
      await audit(auth.store, auth.user, req, "vault.read", "vault_secret", undefined, {
        count: items.length,
        reveal,
      });
    } catch (e) {
      console.error("[vault GET audit]", e);
    }
    return NextResponse.json({ items, total: result.total });
  } catch (e: any) {
    console.error("[vault GET]", e);
    return NextResponse.json(
      { error: e.message || "Internal server error" },
      { status: 500 },
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const auth = await requireAuth(req);
    if (auth instanceof NextResponse) return auth;
    // Permission gate (vault.create)
    { const { requirePermission } = await import("@/lib/permissions/can");
      const _d = requirePermission(auth, "vault.create"); if (_d) return _d; } /* requirePermission wired */
    // Feature gate (module_vault)
    { const { requireFeature } = await import("@/lib/api/feature-guard");
      const _f = await requireFeature(auth.tenantId, "module_vault", auth.isSuperAdmin); if (_f) return _f; } /* requireFeature wired */

    let body: any;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
    }
    if (!auth.tenantId) {
      return NextResponse.json({ error: "tenant_id is required." }, { status: 400 });
    }
    body.tenant_id = auth.tenantId;

    // Encrypt the secret value before it hits the store. Accept either
    // `encrypted_value` (legacy field name) or `value` (newer name) from the
    // caller — both are treated as plaintext here and encrypted with
    // AES-256-GCM. The store only ever sees the ciphertext. Legacy rows that
    // were saved as plaintext are still readable because `decrypt()` falls
    // back to returning the raw value when the format doesn't match.
    const plaintextValue =
      body.encrypted_value != null && body.encrypted_value !== ""
        ? String(body.encrypted_value)
        : body.value != null && body.value !== ""
        ? String(body.value)
        : "";
    body.encrypted_value = encrypt(plaintextValue);
    // `value` is not a real column — drop it so smartUpsert doesn't send it.
    delete body.value;

    const created = await auth.store.upsertVaultSecret(body);
    await audit(auth.store, auth.user, req, body.id ? "vault.update" : "vault.create", "vault_secret", created.id, { key: created.key });
    // Never echo the ciphertext back to the client.
    const { encrypted_value, ...safe } = created;
    return NextResponse.json(safe);
  } catch (e: any) {
    console.error("[vault POST]", e);
    return NextResponse.json(
      { error: e.message || "Internal server error" },
      { status: 500 },
    );
  }
}
