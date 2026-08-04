import { NextRequest, NextResponse } from "next/server";
import { requireAuth, audit } from "@/lib/api/helpers";
import { uploadFile } from "@/lib/upload/service";

export const runtime = "nodejs";

// Upload tenant logo — stored in Supabase Storage (or mock path in dev)
export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAuth();
  if (auth instanceof NextResponse) return auth;
    // Permission gate (platform.tenants.create)
    { const { requirePermission } = await import("@/lib/permissions/can");
      const _d = requirePermission(auth, "platform.tenants.create"); if (_d) return _d; } /* requirePermission wired */

  if (!auth.isSuperAdmin && auth.user.role !== "admin") {
    return NextResponse.json({ error: "Admin access required." }, { status: 403 });
  }
  const { id } = await params;
  // Tenant ownership check: a tenant admin can only upload a logo for their own tenant.
  // Super_admin can upload for any tenant.
  if (!auth.isSuperAdmin && id !== auth.tenantId) {
    return NextResponse.json({ error: "Not found." }, { status: 404 });
  }

  const formData = await req.formData();
  const file = formData.get("logo") as File | null;
  if (!file) {
    return NextResponse.json({ error: "No logo file provided." }, { status: 400 });
  }

  // Validate
  if (file.size > 2 * 1024 * 1024) {
    return NextResponse.json({ error: "Logo too large. Max 2MB." }, { status: 400 });
  }
  const allowedTypes = ["image/png", "image/jpeg", "image/webp", "image/svg+xml"];
  if (!allowedTypes.includes(file.type)) {
    return NextResponse.json({ error: "Invalid type. Allowed: PNG, JPEG, WebP, SVG." }, { status: 400 });
  }

  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);
  const ext = file.name.split(".").pop() || "png";
  const path = `${id}/logo.${ext}`;

  const result = await uploadFile("tenant-logos", path, buffer, file.type, file.size);

  // Update tenant with logo URL
  const tenant = await auth.store.getTenant(id);
  if (tenant) {
    await auth.store.upsertTenant({ ...tenant, logo_url: result.url || result.path });
  }

  await audit(auth.store, auth.user, req, "tenant.logo_upload", "tenant", id, {});

  return NextResponse.json({ url: result.url || result.path });
}
