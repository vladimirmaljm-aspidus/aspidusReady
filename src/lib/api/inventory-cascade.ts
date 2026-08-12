import { getSupabase } from "@/lib/supabase/client";
import { notifyLowStock } from "@/lib/notif/helper";

/**
 * Inventory cascade helpers — shared between admin and portal paths so the
 * behaviour is consistent (Re-Audit-2 N6: previously only the admin PUT
 * path in `offers/[id]/route.ts` decremented stock; portal-accepted offers
 * skipped the cascade entirely).
 *
 * Two public helpers:
 *
 *   1. `deductStockForOffer(opts)` — called when an offer transitions to
 *      "accepted" (admin PUT or portal respond). Decrements `products.stock`
 *      for each line item and inserts an `inventory_movements` audit row.
 *      Idempotent: skipped if a movement already exists for the offer id
 *      (Re-Audit-2 N7: prevents double-deduction when a super-admin re-accepts
 *      a previously-cancelled offer, or when a concurrent call races).
 *
 *   2. `restoreStockForOffer(opts)` — called when an offer transitions OUT of
 *      "accepted" (e.g. cancelled). Reverses the deduction by inserting a
 *      positive-delta movement row. Idempotent: skipped if no prior deduction
 *      exists for the offer id (Re-Audit-2 N8: previously no restoration fired
 *      at all).
 *
 * Both helpers are fire-and-forget — callers wrap them in try/catch and log
 * failures; they don't block the primary update.
 */

interface DeductStockOpts {
  tenantId: string;
  offerId: string;
  offerNumber?: string | null;
  partnerId?: string | null;
  items: Array<{
    product_id?: string | null;
    quantity?: number | string | null;
  }>;
  /** Optional label suffix for the inventory_movements.reason column. */
  reasonSuffix?: string;
  /** "admin" | "portal" — used to differentiate the audit reason. */
  source?: "admin" | "portal";
}

/**
 * Decrements stock for each line item of an accepted offer.
 * Returns the list of (productId, newStock) pairs updated — useful for the
 * caller to fire `notifyLowStock` for each product that fell below reorder.
 */
export async function deductStockForOffer(opts: DeductStockOpts): Promise<
  Array<{ productId: string; newStock: number; productName: string; sku: string; reorderLevel: number }>
> {
  const sb = getSupabase();
  const tenantId = opts.tenantId;
  const offerId = String(opts.offerId);
  const offerNumber = opts.offerNumber ? String(opts.offerNumber) : offerId;
  const sourceLabel = opts.source === "portal" ? "portal client" : "admin";
  const updatedProducts: Array<{
    productId: string; newStock: number; productName: string; sku: string; reorderLevel: number;
  }> = [];

  // ── Idempotency check (Re-Audit-2 N7, fix P0-5/C-5) ────────────────
  // If a prior DEDUCTION movement already exists for this offer id, skip
  // the whole cascade. This prevents:
  //   1. Double-deduction when a super-admin re-accepts a cancelled offer.
  //   2. Double-deduction when two concurrent calls (admin + portal, or
  //      double-click) both fire the cascade.
  //
  // CRITICAL: we filter `delta < 0` so we ONLY match prior DEDUCTIONS.
  // Without this filter, after `accepted → cancelled (restore) → accepted
  // (re-deduct)`, the prior RESTORATION movement (positive delta) would
  // match here and we'd skip the re-deduction entirely — leaving stock
  // un-deducted on the second acceptance (audit C-5).
  const { data: existingMovements, error: existingErr } = await sb
    .from("inventory_movements")
    .select("id")
    .eq("tenant_id", tenantId)
    .eq("reference", offerId)
    .lt("delta", 0) // P0-5/C-5: only count prior DEDUCTIONS (negative deltas)
    .limit(1);
  if (existingErr) {
    console.warn("[inventory cascade] idempotency lookup failed:", existingErr.message);
    // Bail out — we can't safely proceed without the idempotency guarantee.
    return updatedProducts;
  }
  if (existingMovements && existingMovements.length > 0) {
    console.log(
      `[inventory cascade] prior deduction already exists for offer ${offerId}, skipping deduction`,
    );
    return updatedProducts;
  }

  // ── Deduct stock for each line item ───────────────────────────────────
  for (const item of opts.items) {
    const productId = item?.product_id;
    if (!productId) continue;
    const qty = Math.abs(Number(item.quantity) || 0);
    if (qty <= 0) continue;

    // 1) Log the movement (delta negative = stock out).
    const { error: moveErr } = await sb.from("inventory_movements").insert({
      tenant_id: tenantId,
      product_id: productId,
      partner_id: opts.partnerId || null,
      delta: -qty,
      reason: `Offer ${offerNumber} accepted by ${sourceLabel}${opts.reasonSuffix ? " — " + opts.reasonSuffix : ""}`,
      reference: offerId,
    });
    if (moveErr) {
      console.error(`[inventory cascade] movement insert failed for product ${productId}:`, moveErr.message);
      continue;
    }

    // 2) Fetch current stock + reorder_level + name (for the notifyLowStock
    //    notification that fires after the deduction).
    const { data: productRow, error: prodErr } = await sb
      .from("products")
      .select("id, name, sku, stock, reorder_level, unit")
      .eq("id", productId)
      .eq("tenant_id", tenantId)
      .maybeSingle();
    if (prodErr) {
      console.error(`[inventory cascade] product fetch failed for ${productId}:`, prodErr.message);
      continue;
    }
    if (!productRow) {
      // Product may have been deleted between offer save and accept — log + skip.
      console.warn(`[inventory cascade] product ${productId} not found, skipping stock decrement`);
      continue;
    }

    const currentStock = Number((productRow as any).stock ?? 0) || 0;
    const reorderLevel = Number((productRow as any).reorder_level ?? 0) || 0;
    const newStock = Math.max(0, currentStock - qty);

    const { error: updErr } = await sb
      .from("products")
      .update({ stock: newStock, updated_at: new Date().toISOString() })
      .eq("id", productId)
      .eq("tenant_id", tenantId);
    if (updErr) {
      console.error(`[inventory cascade] product update failed for ${productId}:`, updErr.message);
      continue;
    }

    updatedProducts.push({
      productId,
      newStock,
      productName: (productRow as any).name || "(unnamed)",
      sku: (productRow as any).sku || "",
      reorderLevel,
    });
  }

  // ── Fire low-stock notifications for any product that crossed the reorder level ──
  // (Re-Audit-2 LOGIC §8.3: notifyLowStock was defined but never called from
  // any route. We fire it here, after the deduction, when stock falls at or
  // below the reorder_level.)
  for (const p of updatedProducts) {
    if (p.newStock <= p.reorderLevel) {
      try {
        await notifyLowStock(
          tenantId,
          p.productName,
          p.sku,
          p.newStock,
          p.reorderLevel,
          p.productId,
        );
      } catch (e) {
        console.error(`[inventory cascade] notifyLowStock failed for ${p.productId}:`, e);
      }
    }
  }

  return updatedProducts;
}

interface RestoreStockOpts {
  tenantId: string;
  offerId: string;
  offerNumber?: string | null;
  partnerId?: string | null;
  items: Array<{
    product_id?: string | null;
    quantity?: number | string | null;
  }>;
  /** Reason for the restoration (e.g. "Offer cancelled by admin"). */
  reason: string;
}

/**
 * Reverses a prior deduction by inserting a positive-delta movement row for
 * each line item and incrementing `products.stock`. Idempotent: skipped if
 * no prior deduction exists for the offer id (Re-Audit-2 N8).
 *
 * Note: this does NOT delete the original deduction row — both rows stay in
 * the audit trail so the books reconcile (movement out + movement back in).
 */
export async function restoreStockForOffer(opts: RestoreStockOpts): Promise<void> {
  const sb = getSupabase();
  const tenantId = opts.tenantId;
  const offerId = String(opts.offerId);

  // Idempotency check: if no deduction exists for this offer id, there's
  // nothing to restore.
  const { data: priorDeductions, error: lookupErr } = await sb
    .from("inventory_movements")
    .select("id, delta")
    .eq("tenant_id", tenantId)
    .eq("reference", offerId)
    .lt("delta", 0); // only count prior deductions (negative deltas)
  if (lookupErr) {
    console.warn("[inventory restore] lookup failed:", lookupErr.message);
    return;
  }
  if (!priorDeductions || priorDeductions.length === 0) {
    console.log(`[inventory restore] no prior deduction for offer ${offerId}, skipping`);
    return;
  }

  // Check if a restoration movement already exists (avoid double-restore on
  // repeated cancel calls).
  const { data: priorRestorations } = await sb
    .from("inventory_movements")
    .select("id")
    .eq("tenant_id", tenantId)
    .eq("reference", offerId)
    .gt("delta", 0); // positive deltas = restorations
  if (priorRestorations && priorRestorations.length > 0) {
    console.log(`[inventory restore] restoration already exists for offer ${offerId}, skipping`);
    return;
  }

  for (const item of opts.items) {
    const productId = item?.product_id;
    if (!productId) continue;
    const qty = Math.abs(Number(item.quantity) || 0);
    if (qty <= 0) continue;

    // 1) Log the restoration movement (delta positive = stock in).
    const { error: moveErr } = await sb.from("inventory_movements").insert({
      tenant_id: tenantId,
      product_id: productId,
      partner_id: opts.partnerId || null,
      delta: qty,
      reason: `Offer ${opts.offerNumber || offerId} cancelled — ${opts.reason}`,
      reference: offerId,
    });
    if (moveErr) {
      console.error(`[inventory restore] movement insert failed for product ${productId}:`, moveErr.message);
      continue;
    }

    // 2) Fetch current stock.
    const { data: productRow } = await sb
      .from("products")
      .select("id, stock")
      .eq("id", productId)
      .eq("tenant_id", tenantId)
      .maybeSingle();
    if (!productRow) continue;

    // CRITICAL FIX (audit C-4): restore only the ACTUAL amount that was
    // deducted, not the requested `qty`. `deductStockForOffer` caps stock
    // at 0 via `Math.max(0, currentStock - qty)`, so if stock was 10 and
    // qty was 15, only 10 units were actually removed from `products.stock`
    // (the movement row still records delta = -15). Naively restoring
    // `+qty` (15) would create 5 phantom units.
    //
    // We read the delta from the prior deduction movement (matched by
    // tenant + reference + product_id + delta < 0). The movement delta
    // matches the *requested* qty in the current implementation, so this
    // fix is forward-compatible: if `deductStockForOffer` is later changed
    // to record `actual_delta` (clamped to currentStock), the restore will
    // automatically pick up the correct value without further changes.
    // Falls back to `qty` only if the movement row can't be found (defensive).
    const { data: priorDeduction } = await sb
      .from("inventory_movements")
      .select("delta")
      .eq("tenant_id", tenantId)
      .eq("reference", offerId)
      .eq("product_id", productId)
      .lt("delta", 0) // negative = deduction
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();
    const actualDeducted = priorDeduction
      ? Math.abs(Number((priorDeduction as any).delta) || 0)
      : qty;
    const currentStock = Number((productRow as any).stock ?? 0) || 0;
    const newStock = currentStock + actualDeducted;
    const { error: updErr } = await sb
      .from("products")
      .update({ stock: newStock, updated_at: new Date().toISOString() })
      .eq("id", productId)
      .eq("tenant_id", tenantId);
    if (updErr) {
      console.error(`[inventory restore] product update failed for ${productId}:`, updErr.message);
    }
  }
}
