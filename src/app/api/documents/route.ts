import { NextRequest, NextResponse } from "next/server";
import { requireAuth, audit } from "@/lib/api/helpers";

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  const auth = await requireAuth();
  if (auth instanceof NextResponse) return auth;
  const tid = auth.tenantId!;
  const url = new URL(req.url);
  const search = url.searchParams.get("search") || undefined;
  const partner_id = url.searchParams.get("partner_id") || undefined;
  const limit = url.searchParams.get("limit") ? Number(url.searchParams.get("limit")) : undefined;
  const offset = url.searchParams.get("offset") ? Number(url.searchParams.get("offset")) : undefined;
  const result = await auth.store.listDocuments(tid, { search, limit, offset, filters: { partner_id } });
  return NextResponse.json(result);
}

export async function POST(req: NextRequest) {
  const auth = await requireAuth();
  if (auth instanceof NextResponse) return auth;
  const body = await req.json();
  if (!body.uploaded_by) body.uploaded_by = auth.user.id;
  const created = await auth.store.upsertDocument(body);
  await audit(auth.store, auth.user, req, body.id ? "document.update" : "document.upload", "document", created.id, { filename: created.filename });
  return NextResponse.json(created);
}
