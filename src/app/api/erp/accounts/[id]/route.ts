import { NextRequest, NextResponse } from "next/server";
import { requireAuth, requireAdmin, resolveTenantId, audit } from "@/lib/api/helpers";

export const runtime = "nodejs";

// GET /api/erp/accounts/[id] — Get single account
export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAuth();
  if (auth instanceof NextResponse) return auth;

  const { id } = await params;
  try {
    const account = await auth.store.getErpAccount(id);
    if (!account) return NextResponse.json({ error: "Not found." }, { status: 404 });
    return NextResponse.json(account);
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

// PUT /api/erp/accounts/[id] — Update account
export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAdmin();
  if (auth instanceof NextResponse) return auth;

  const { id } = await params;
  try {
    const body = await req.json();
    const updated = await auth.store.upsertErpAccount({ ...body, id });
    await audit(auth.store, auth.user, req, "erp_account.update", "erp_account", id, {
      code: updated.code,
      name: updated.name,
    });
    return NextResponse.json(updated);
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

// DELETE /api/erp/accounts/[id] — Delete account (only if not system account)
export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAdmin();
  if (auth instanceof NextResponse) return auth;

  const { id } = await params;
  try {
    const account = await auth.store.getErpAccount(id);
    if (!account) return NextResponse.json({ error: "Not found." }, { status: 404 });
    if (account.is_system) {
      return NextResponse.json({ error: "Cannot delete system account." }, { status: 403 });
    }
    await auth.store.deleteErpAccount(id);
    await audit(auth.store, auth.user, req, "erp_account.delete", "erp_account", id, {
      code: account.code,
      name: account.name,
    });
    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
