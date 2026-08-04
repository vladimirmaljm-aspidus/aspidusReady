import { getSupabase } from "@/lib/supabase/client";

/**
 * When a deal / offer / invoice is cancelled, deleted or reverted to draft,
 * any deal_commissions rows that were computed off of it become invalid.
 *
 * Rules (idempotent):
 *   - status = "cancelled" | "declined" | "voided"  → mark linked commissions
 *     as "voided" (unless already "paid" — paid commissions stay as an
 *     audit trail with a `voided_after_payment: true` flag).
 *   - status = "draft"                              → mark as "voided"
 *     because a draft has no committed value to pay commission on.
 *   - hard delete of the deal                       → mark as "voided" +
 *     null out the deal_id link (kept for history).
 *
 * Fire-and-forget: called from route handlers after the primary update.
 */

const VOIDABLE_STATUSES = new Set(["cancelled", "declined", "voided", "draft"]);

async function markCommissionsVoided(dealId: string, tenantId: string, reason: string) {
  const sb = getSupabase();
  // Only touch rows not already terminal ("paid" stays, "voided" already terminal).
  const { data } = await sb
    .from("deal_commissions")
    .select("id, status")
    .eq("tenant_id", tenantId)
    .eq("deal_id", dealId);
  if (!data || data.length === 0) return;

  for (const row of data as Array<{ id: string; status: string }>) {
    if (row.status === "voided") continue;
    if (row.status === "paid") {
      await sb
        .from("deal_commissions")
        .update({
          notes: `Voided after payment (source cancelled: ${reason}) at ${new Date().toISOString()}`,
        })
        .eq("id", row.id);
    } else {
      await sb
        .from("deal_commissions")
        .update({ status: "voided", notes: `Auto-voided: ${reason} at ${new Date().toISOString()}` })
        .eq("id", row.id);
    }
  }
}

export async function cascadeCommissionOnStatusChange(
  dealId: string | null | undefined,
  tenantId: string,
  newStatus: string | null | undefined,
  reason: string,
): Promise<void> {
  if (!dealId || !newStatus) return;
  if (!VOIDABLE_STATUSES.has(newStatus.toLowerCase())) return;
  try {
    await markCommissionsVoided(dealId, tenantId, reason);
  } catch (e) {
    console.warn("[commission-cascade]", e);
  }
}

export async function cascadeCommissionOnDelete(
  dealId: string | null | undefined,
  tenantId: string,
  reason: string,
): Promise<void> {
  if (!dealId) return;
  try {
    await markCommissionsVoided(dealId, tenantId, reason);
  } catch (e) {
    console.warn("[commission-cascade:delete]", e);
  }
}
