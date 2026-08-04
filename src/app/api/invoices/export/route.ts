import { NextRequest, NextResponse } from "next/server";
import { requireAuth, resolveTenantId } from "@/lib/api/helpers";
import { toCSV, csvResponse, parseExportParams } from "@/lib/export/csv";

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  const auth = await requireAuth();
  if (auth instanceof NextResponse) return auth;
    // Permission gate (invoices.read)
    { const { requirePermission } = await import("@/lib/permissions/can");
      const _d = requirePermission(auth, "invoices.read"); if (_d) return _d; } /* requirePermission wired */

  const tid = resolveTenantId(auth, req);
  if (!tid) return csvResponse("invoices.csv", "");

  const result = await auth.store.listInvoices(tid, { limit: 10000 });
  const { columns } = parseExportParams(req);

  const cols = columns || [
    "number", "partner_id", "status", "subject", "currency",
    "subtotal", "discount_total", "tax_total", "total",
    "issue_date", "due_date", "sent_at", "paid_at", "created_at",
  ];

  const csv = toCSV(result.items as unknown as Record<string, unknown>[], cols);
  return csvResponse(`invoices-${new Date().toISOString().split("T")[0]}.csv`, csv);
}
