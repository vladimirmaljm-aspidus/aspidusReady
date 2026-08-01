import { NextRequest, NextResponse } from "next/server";
import { requireAuth, audit } from "@/lib/api/helpers";

export const runtime = "nodejs";

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAuth();
  if (auth instanceof NextResponse) return auth;
  const { id } = await params;

  // Verify the key belongs to the user's tenant
  const keys = await auth.store.listApiKeys(auth.tenantId!);
  const key = keys.find((k) => k.id === id);
  if (!key) {
    return NextResponse.json({ error: "API key not found." }, { status: 404 });
  }

  await auth.store.deleteApiKey(id);
  await audit(auth.store, auth.user, req, "api_key.delete", "api_key", id);
  return NextResponse.json({ ok: true });
}
