import { NextRequest, NextResponse } from "next/server";
import { requireAuth, requireAuthOrApiKey, requireAuthOrApiKeyPermission, audit, resolveTenantId } from "@/lib/api/helpers";
import { notify } from "@/lib/notif/helper";
import { triggerWebhooks } from "@/lib/webhooks/deliver";

export const runtime = "nodejs";

/**
 * POST /api/automation/create-demand-from-portal-rfq
 *
 * Auto-create a demand from a portal RFQ:
 * - Copy RFQ data into demand items
 * - Auto-generate demand number (RFQ-YYYY-NNN format)
 * - Auto-fill partner and product details
 * - Link the RFQ to the new demand
 *
 * Body: { rfq_id: string }
 */
export async function POST(req: NextRequest) {
  const auth = await requireAuthOrApiKey(req);
  if (auth instanceof NextResponse) return auth;
  // U-FIX (RBAC audit D-1): gate BOTH session AND API-key callers.
  // This automation route creates a CRM demand entity — previously
  // any API key could trigger demand creation, including cross-
  // tenant if combined with another bug. API-key callers MUST now
  // hold `demands:create` (or `*`).
  const denied = requireAuthOrApiKeyPermission(auth, "demands.create");
  if (denied) return denied;
  // Feature gate (module_crm) — creates a demand (CRM entity).
  { const { requireFeature } = await import("@/lib/api/feature-guard");
    const _tid = ("apiKeyId" in auth) ? auth.tenantId : auth.tenantId;
    const _isSA = !("apiKeyId" in auth) && auth.isSuperAdmin;
    const _f = await requireFeature(_tid, "module_crm", _isSA); if (_f) return _f; } /* requireFeature wired */


  const tid = resolveTenantId(auth, req);
  if (!tid) {
    return NextResponse.json({ error: "Tenant ID required." }, { status: 400 });
  }

  try {
    const body = await req.json();
    const { rfq_id } = body;

    if (!rfq_id) {
      return NextResponse.json(
        { error: "rfq_id is required." },
        { status: 400 }
      );
    }

    const store = auth.store;

    // 1. Fetch the portal RFQ
    const rfq = await store.getPortalRfq(rfq_id);
    if (!rfq) {
      return NextResponse.json({ error: "Portal RFQ not found." }, { status: 404 });
    }
    // Tenant ownership check (applies to both session auth and API-key auth)
    const isSuperAdmin = "user" in auth && auth.isSuperAdmin;
    if (!isSuperAdmin && rfq.tenant_id !== auth.tenantId) {
      return NextResponse.json({ error: "Portal RFQ not found." }, { status: 404 });
    }

    // 2. Fetch partner data for auto-fill
    const partner = rfq.partner_id ? await store.getPartner(rfq.partner_id) : null;

    // 3. Auto-generate demand number
    const existingDemands = await store.listDemands(tid, { limit: 1 });
    const year = new Date().getFullYear();
    const nextSeq = existingDemands.total + 1;
    const demandNumber = `RFQ-${year}-${String(nextSeq).padStart(3, "0")}`;

    // 4. Build demand items from RFQ data
    //    CRITICAL FIX (FLOW-FIX): preserve rfq.product_id link so the
    //    product-traceability chain is intact (RFQ → demand → offer). Was
    //    hard-coded to null — broke Step 3 of the audit.
    const demandItems = [
      {
        product_id: rfq.product_id as string | null,
        product_name: rfq.product_name,
        quantity: rfq.quantity,
        unit: rfq.unit,
        target_price: rfq.target_price,
        notes: rfq.specifications || rfq.notes || null,
      },
    ];

    // 5. Build the demand object
    const demandData = {
      tenant_id: tid,
      number: demandNumber,
      partner_id: rfq.partner_id,
      status: "open" as const,
      subject: `RFQ: ${rfq.product_name}`,
      description: [
        rfq.product_description,
        rfq.delivery_country ? `Delivery: ${rfq.delivery_country}` : "",
        rfq.delivery_port ? `Port: ${rfq.delivery_port}` : "",
        rfq.delivery_date ? `Date: ${rfq.delivery_date}` : "",
        rfq.incoterm ? `Incoterm: ${rfq.incoterm}` : "",
        rfq.notes ? `Notes: ${rfq.notes}` : "",
      ].filter(Boolean).join("\n"),
      requested_delivery: rfq.delivery_date || null,
      currency: rfq.currency || (partner?.preferred_currency || "USD"),
      items: demandItems,
    };

    // 6. Create the demand
    const created = await store.upsertDemand(demandData);

    // 7. Update the portal RFQ to link the demand and set status to "quoted"
    try {
      await store.upsertPortalRfq({
        id: rfq_id,
        linked_demand_id: created.id,
        status: "quoted",
      });
    } catch {
      // Non-critical: if the RFQ update fails, the demand is still created
      console.warn("[create-demand-from-portal-rfq] Failed to update portal RFQ status");
    }

    // 8. Audit log
    const auditUser = "user" in auth ? auth.user : { id: auth.apiKeyId, username: auth.apiKeyName, tenant_id: auth.tenantId };
    await audit(
      store,
      auditUser,
      req,
      "automation.create_demand_from_portal_rfq",
      "demand",
      created.id,
      {
        rfq_id: rfq.id,
        rfq_number: rfq.number,
        demand_number: created.number,
        partner_id: rfq.partner_id,
        partner_name: partner?.name || "Unknown",
        product_name: rfq.product_name,
      }
    );

    // 9. FLOW-FIX: notify the portal client their RFQ is being actioned.
    //    Previously the client only found out by refreshing the portal
    //    RFQ list view — no push notification was sent on the
    //    pending → quoted transition. The notification is partner-scoped
    //    so listNotificationsByPartner surfaces it in the portal bell.
    if (rfq.partner_id) {
      try {
        await notify({
          tenantId: rfq.tenant_id,
          userId: null,
          partnerId: rfq.partner_id,
          type: "rfq_quoted",
          title: `Your RFQ has been converted`,
          message: `Your request (${rfq.number || rfq.product_name}) is being prepared as a quote. We'll send you an offer shortly.`,
          entityType: "portal_rfq",
          entityId: rfq.id,
          actionLabel: "View",
        });
      } catch (e) {
        console.error("[create-demand-from-portal-rfq] client notification failed:", e);
      }
    }

    // 10. FLOW-FIX: outbound webhook `rfq.quoted` — fire-and-forget.
    //     Complements `rfq.created` (fired at submission). Receivers get
    //     the RFQ snapshot + linked demand id so they can mirror the
    //     status change in their own system.
    void triggerWebhooks(
      store,
      tid,
      "rfq.quoted",
      "portal_rfq",
      rfq.id,
      {
        id: rfq.id,
        number: rfq.number,
        product_id: rfq.product_id,
        product_name: rfq.product_name,
        partner_id: rfq.partner_id,
        partner_name: partner?.name || null,
        linked_demand_id: created.id,
        demand_number: created.number,
        status: "quoted",
      },
    ).catch((e) => console.error("[create-demand-from-portal-rfq] webhook trigger failed:", e));

    return NextResponse.json(created);
  } catch (e: any) {
    console.error("[automation/create-demand-from-portal-rfq]", e);
    return NextResponse.json(
      { error: e.message || "Failed to create demand from portal RFQ." },
      { status: 500 }
    );
  }
}
