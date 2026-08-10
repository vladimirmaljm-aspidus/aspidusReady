/**
 * Status transition validator for documents & deals.
 *
 * Enforces a state-machine for offers, invoices, proformas and deals so a
 * finalised document can't be silently reverted (e.g. a paid invoice going
 * back to "draft"). Super-admins always bypass — they manage the platform
 * and need to be able to correct bad data.
 *
 * Used by the PUT handlers under /api/{offers,invoices,proformas,deals}/[id].
 *
 * FIX-P1-LOGIC Fix 1.
 */

export type DocType = "offer" | "invoice" | "proforma" | "deal";

const VALID_TRANSITIONS: Record<DocType, Record<string, string[]>> = {
  offer: {
    draft: ["sent", "cancelled"],
    sent: ["accepted", "rejected", "expired", "draft"],
    accepted: ["cancelled"],
    rejected: [],
    expired: [],
    cancelled: [],
  },
  invoice: {
    draft: ["sent", "cancelled"],
    sent: ["paid", "partial", "overdue", "cancelled"],
    partial: ["paid", "cancelled"],
    paid: [],
    overdue: ["paid", "partial", "cancelled"],
    cancelled: [],
  },
  proforma: {
    draft: ["sent", "cancelled"],
    sent: ["accepted", "expired", "cancelled"],
    accepted: ["paid", "cancelled"],
    paid: [],
    expired: [],
    cancelled: [],
  },
  deal: {
    lead: ["qualified", "cancelled"],
    qualified: ["proposal", "negotiation", "cancelled"],
    proposal: ["negotiation", "won", "lost"],
    negotiation: ["won", "lost"],
    won: [],
    lost: [],
    cancelled: [],
  },
};

export interface StatusTransitionResult {
  valid: boolean;
  error?: string;
}

/**
 * Validate that transitioning `docType` from `currentStatus` to `newStatus`
 * is allowed by the state machine.
 *
 * Notes:
 * - A no-op transition (same status) is always valid.
 * - An unknown `currentStatus` has no allowed transitions → blocked.
 */
export function validateStatusTransition(
  docType: DocType,
  currentStatus: string,
  newStatus: string,
): StatusTransitionResult {
  if (currentStatus === newStatus) return { valid: true };
  const allowed = VALID_TRANSITIONS[docType]?.[currentStatus] || [];
  if (!allowed.includes(newStatus)) {
    return {
      valid: false,
      error: `Cannot change ${docType} status from "${currentStatus}" to "${newStatus}". Allowed transitions: ${allowed.join(", ") || "none"}.`,
    };
  }
  return { valid: true };
}
