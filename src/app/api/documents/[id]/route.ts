import { NextRequest, NextResponse } from "next/server";
import { requireAuth, audit } from "@/lib/api/helpers";
import { getSupabase } from "@/lib/supabase/client";

export const runtime = "nodejs";

const BUCKET = "shared-documents";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const auth = await requireAuth();
    if (auth instanceof NextResponse) return auth;
    { const { requirePermission } = await import("@/lib/permissions/can");
      const _d = requirePermission(auth, "documents.read"); if (_d) return _d; }

    const { id } = await params;
    const doc = await auth.store.getDocument(id);
    if (!doc) return NextResponse.json({ error: "Not found." }, { status: 404 });
    if (!auth.isSuperAdmin && (doc as any).tenant_id !== auth.tenantId) {
      return NextResponse.json({ error: "Not found." }, { status: 404 });
    }
    const path = (doc as any).storage_path as string | undefined;
    if (!path) return NextResponse.json({ error: "No file attached to this document." }, { status: 404 });

    const inline = new URL(req.url).searchParams.get("mode") !== "download";
    const sb = getSupabase();
    const { data, error } = await sb.storage
      .from(BUCKET)
      .createSignedUrl(path, 300, inline ? undefined : { download: (doc as any).filename || true });
    if (error || !data?.signedUrl) return NextResponse.json({ error: "Storage unavailable." }, { status: 502 });
    return NextResponse.redirect(data.signedUrl, 302);
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const auth = await requireAuth();
    if (auth instanceof NextResponse) return auth;
    // Permission gate (documents.delete)
    { const { requirePermission } = await import("@/lib/permissions/can");
      const _d = requirePermission(auth, "documents.delete"); if (_d) return _d; } /* requirePermission wired */

    const { id } = await params;
    // Tenant ownership check: listDocuments ignores tenantId in the store,
    // so we fetch all and filter for non-super_admin.
    const all = await auth.store.listDocuments(auth.tenantId ?? "", { limit: 100000 });
    const existing = all.items.find((d) => d.id === id);
    if (!existing) return NextResponse.json({ error: "Not found." }, { status: 404 });
    if (!auth.isSuperAdmin && (existing as any).tenant_id !== auth.tenantId) {
      return NextResponse.json({ error: "Not found." }, { status: 404 });
    }
    await auth.store.deleteDocument(id);
    await audit(auth.store, auth.user, req, "document.delete", "document", id);
    return NextResponse.json({ ok: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 });
  }
}
