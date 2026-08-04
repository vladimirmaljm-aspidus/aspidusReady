import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/api/helpers";

export const runtime = "nodejs";

// Redact secret-bearing fields (e.g. portal password-reset tokens) that get
// written into audit `details` — the audit log is for tracing who did what,
// not for exposing live credentials to anyone who can read it.
const REDACTED_DETAIL_KEYS = ["reset_token"];

function redactDetails(details: unknown): unknown {
  if (!details || typeof details !== "object") return details;
  const copy: Record<string, unknown> = { ...(details as Record<string, unknown>) };
  for (const k of REDACTED_DETAIL_KEYS) {
    if (k in copy) copy[k] = "[redacted]";
  }
  return copy;
}

export async function GET(req: NextRequest) {
  const auth = await requireAuth();
  if (auth instanceof NextResponse) return auth;
  const tid = auth.tenantId!;
  const url = new URL(req.url);
  const search = url.searchParams.get("search") || undefined;
  const limit = url.searchParams.get("limit") ? Number(url.searchParams.get("limit")) : 100;
  const offset = url.searchParams.get("offset") ? Number(url.searchParams.get("offset")) : 0;
  const result = await auth.store.listAudit(tid, { search, limit, offset });
  return NextResponse.json({
    ...result,
    items: result.items.map((item) => ({ ...item, details: redactDetails(item.details) })),
  });
}
