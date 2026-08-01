import { NextRequest, NextResponse } from "next/server";
import { requireAuth, audit } from "@/lib/api/helpers";
import { randomBytes, createHash } from "crypto";

export const runtime = "nodejs";

export async function GET() {
  const auth = await requireAuth();
  if (auth instanceof NextResponse) return auth;
  const tid = auth.tenantId!;
  const keys = await auth.store.listApiKeys(tid);
  // strip key_hash
  return NextResponse.json({ items: keys.map(({ key_hash, ...k }) => k) });
}

export async function POST(req: NextRequest) {
  const auth = await requireAuth();
  if (auth instanceof NextResponse) return auth;
  const body = await req.json();
  // generate a real key on create
  if (!body.id) {
    const raw = "asp_" + randomBytes(24).toString("hex");
    body.key_prefix = raw.slice(0, 12);
    body.key_hash = createHash("sha256").update(raw).digest("hex");
  }
  const created = await auth.store.upsertApiKey(body);
  await audit(auth.store, auth.user, req, body.id ? "api_key.update" : "api_key.create", "api_key", created.id, { name: created.name });
  const { key_hash, ...safe } = created;
  // return full key only on create
  const response: any = { ...safe };
  if (!body.id) response.full_key = raw;
  return NextResponse.json(response);
}
