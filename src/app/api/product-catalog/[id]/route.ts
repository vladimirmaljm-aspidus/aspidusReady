import { NextRequest, NextResponse } from "next/server";
import { requireAuth, audit } from "@/lib/api/helpers";

export const runtime = "nodejs";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAuth();
  if (auth instanceof NextResponse) return auth;
  const { id } = await params;
  const item = await auth.store.getProductCatalogEntry(id);
  if (!item) return NextResponse.json({ error: "Not found." }, { status: 404 });
  return NextResponse.json(item);
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAuth();
  if (auth instanceof NextResponse) return auth;
  const { id } = await params;
  const body = await req.json();
  const updated = await auth.store.upsertProductCatalogEntry({ ...body, id });
  await audit(auth.store, auth.user, req, "product_catalog.update", "product_catalog", id, { name: updated.name });
  return NextResponse.json(updated);
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAuth();
  if (auth instanceof NextResponse) return auth;
  const { id } = await params;
  await auth.store.deleteProductCatalogEntry(id);
  await audit(auth.store, auth.user, req, "product_catalog.delete", "product_catalog", id);
  return NextResponse.json({ ok: true });
}
