import { NextRequest, NextResponse } from "next/server";
import { requireAuth, requireAdmin, audit } from "@/lib/api/helpers";
import { randomBytes, createHash } from "crypto";

export const runtime = "nodejs";

/** List all API keys for the current tenant */
export async function GET() {
  const auth = await requireAuth();
  if (auth instanceof NextResponse) return auth;
  const tid = auth.tenantId!;
  const keys = await auth.store.listApiKeys(tid);
  // strip key_hash
  return NextResponse.json({ items: keys.map(({ key_hash, ...k }) => k) });
}

/** Create a new API key */
export async function POST(req: NextRequest) {
  const auth = await requireAdmin();
  if (auth instanceof NextResponse) return auth;
  const body = await req.json();

  // Validate required fields
  if (!body.name || typeof body.name !== "string" || !body.name.trim()) {
    return NextResponse.json({ error: "Name is required." }, { status: 400 });
  }

  body.tenant_id = auth.tenantId!;

  // Parse permissions
  let permissions: string[] = [];
  if (body.permissions) {
    if (typeof body.permissions === "string") {
      permissions = body.permissions.split(",").map((s: string) => s.trim()).filter(Boolean);
    } else if (Array.isArray(body.permissions)) {
      permissions = body.permissions;
    }
  }
  body.permissions = permissions;

  // Generate a real key
  const raw = "asp_" + randomBytes(24).toString("hex");
  body.key_prefix = raw.slice(0, 12);
  body.key_hash = createHash("sha256").update(raw).digest("hex");
  body.active = true;

  // Set expiration if provided
  if (body.expires_at) {
    body.expires_at = new Date(body.expires_at).toISOString();
  }

  // Remove id if not provided (force create, not update)
  delete body.id;

  const created = await auth.store.upsertApiKey(body);
  await audit(auth.store, auth.user, req, "api_key.create", "api_key", created.id, { name: created.name });

  const { key_hash, ...safe } = created;
  // return full key only on create
  const response: Record<string, unknown> = { ...safe, full_key: raw };
  return NextResponse.json(response);
}
