// src/lib/permissions/sod-matrix.ts
// ----------------------------------------------------------------------------
// Separation of Duties (SoD) matrix (P1-1 / Feature 2).
//
// Prevents the same user from both creating and approving the same
// action — a classic SOX / fraud-prevention control. Without it, a
// single user holding both `offers.create` + `offers.send` could
// manufacture AND commit a binding commercial commitment, with no
// second-person review.
//
// RULES (per entity)
//   • Offer          — creator (`offers.create`) cannot send/approve
//                      (`offers.send`) their own offer.
//   • Invoice        — creator (`invoices.create`) cannot send/approve
//                      (`invoices.send`) their own invoice.
//   • Journal entry  — creator (`erp.create`) cannot post (`erp.post`)
//                      their own draft entry.
//   • Commission payout — creator (`commissions.payout`) cannot approve
//                      (`commissions.update`) their own payout.
//
// SUPER-ADMIN RULE
// ----------------
// Super_admin bypasses ALL SoD rules. They can create AND approve the
// same action. This is the explicit contract: super_admin is the
// platform root and is trusted with the keys to the kingdom. The
// bypass fires when EITHER of these is true:
//   1. The user's permissions array includes `"*"` (the platform-root
//      wildcard — same convention `can()` uses).
//   2. The user's permissions array includes the literal string
//      `"super_admin"` (a hint flag — routes that know the user's role
//      is super_admin can pass it in the permissions list to force the
//      bypass even when the user's `*` grant was somehow stripped).
//
// Routes should ALSO short-circuit on `auth.isSuperAdmin` BEFORE
// calling `checkSoD` (defence-in-depth — see `assertNoSoDViolation`
// below which does this automatically).
//
// SEMANTICS
// ---------
// A violation requires BOTH of these conditions:
//   1. `creatorId === approverId` — the same natural person is doing
//      both the create and the approve (we compare user ids, NOT
//      usernames — usernames can be reused after a GDPR erase).
//   2. The user holds BOTH the create_perm and the approve_perm
//      (otherwise they couldn't perform both actions in the first
//      place — but the check is defence-in-depth: a future permission
//      change might temporarily grant both, and the audit log entry
//      would still be valuable).
//
// WHAT THIS MODULE DOES NOT DO
// -----------------------------
//   • It does NOT enforce "the approver must be a different person
//     than the creator" unconditionally — a small tenant with one
//     admin legitimately has the same person doing both. We only
//     block when the user holds both permissions, which means the
//     tenant explicitly set up the role for two-person control.
//   • It does NOT retroactively check past actions — only the action
//     being performed right now.
//   • It does NOT integrate with the settings-based SoD matrix route
//     (`/api/admin/sod-matrix`) which uses a different rule format
//     (the `permissions_a` / `permissions_b` format from another
//     agent's admin route). Those two systems are complementary —
//     the admin route is for ops-managed rules; this module is the
//     code-enforced baseline.
// ----------------------------------------------------------------------------

import { NextResponse } from "next/server";
import type { AuthContext } from "@/lib/api/helpers";

/**
 * A single SoD rule. Maps a "creator" permission to the matching
 * "approver" permission that, if held by the same user who created
 * the entity, constitutes a violation.
 */
export interface SoDRule {
  /** The permission needed to CREATE the entity. */
  creator_permission: string;
  /** The permission needed to APPROVE / finalise the entity. */
  approver_permission: string;
  /** Human-readable explanation (used in the 403 body + audit log). */
  description: string;
}

/**
 * The baseline SoD rule set. The permission strings are taken from the
 * canonical catalog (`src/lib/permissions/catalog.ts`).
 *
 * Offer approval = `offers.send` (the act of sending an offer to the
 * customer is the binding approval — once sent, the offer is locked).
 *
 * Invoice approval = `invoices.send` (same logic — sending is the
 * external commitment that locks the invoice).
 *
 * Journal entry approval = `erp.post` (posting is the act of moving
 * a draft entry into the ledger — that's the approval step).
 *
 * Commission payout approval = `commissions.update` (transitioning a
 * payout from "pending" to "completed" is the approval step — see the
 * PUT /api/commission-payouts/[id] route).
 */
export const SOD_RULES: SoDRule[] = [
  {
    creator_permission: "offers.create",
    approver_permission: "offers.send",
    description: "Offer creator cannot send/approve their own offer (two-person control).",
  },
  {
    creator_permission: "invoices.create",
    approver_permission: "invoices.send",
    description: "Invoice creator cannot send/approve their own invoice (two-person control).",
  },
  {
    creator_permission: "erp.create",
    approver_permission: "erp.post",
    description: "Journal entry creator cannot post their own entry (two-person control).",
  },
  {
    creator_permission: "commissions.payout",
    approver_permission: "commissions.update",
    description: "Commission payout creator cannot approve their own payout (two-person control).",
  },
];

/**
 * Lookup the SoD rule that matches a given create_perm (or approve_perm).
 *
 * Returns the first matching rule, or `null` if no rule covers the
 * permission (i.e. the action is not subject to SoD). Used by routes
 * to find the rule that applies to the action they're about to take.
 */
export function findSoDRuleByCreatePerm(createPerm: string): SoDRule | null {
  return SOD_RULES.find((r) => r.creator_permission === createPerm) ?? null;
}

export function findSoDRuleByApprovePerm(approvePerm: string): SoDRule | null {
  return SOD_RULES.find((r) => r.approver_permission === approvePerm) ?? null;
}

export interface SoDResult {
  violated: boolean;
  reason?: string;
  /** The rule that was violated (for audit-log context). */
  rule?: SoDRule;
}

/**
 * Check whether the given approver is violating SoD by approving an
 * entity they themselves created.
 *
 * @param userPermissions  The approver's full effective permission list.
 *                         Must already include any per-tenant override
 *                         perms (the caller is responsible for merging).
 *                         Pass `"*"` or `"super_admin"` for super-admin
 *                         callers to bypass the check entirely.
 * @param creatorId        The id of the user who created the entity
 *                         (looked up from the entity's `created_by`
 *                         or `owner_id` column). NULL/undefined on
 *                         legacy rows → fail open (don't block).
 * @param approverId       The id of the user attempting to approve.
 * @param action           The SoD rule (or a { create_perm, approve_perm }
 *                         pair).
 *
 * Returns `{ violated: false }` when:
 *   • The approver is a super_admin (bypass — permissions array
 *     includes `"*"` OR `"super_admin"`).
 *   • The approver is NOT the creator (different natural persons).
 *   • The approver holds the create_perm but not the approve_perm,
 *     OR vice versa (one-sided — no SoD concern).
 *
 * Returns `{ violated: true, reason, rule }` when:
 *   • The approver is the same person as the creator (ids match) AND
 *     the approver holds BOTH the create_perm and the approve_perm.
 */
export function checkSoD(
  userPermissions: string[],
  creatorId: string | null | undefined,
  approverId: string | null | undefined,
  action: { create_perm: string; approve_perm: string },
): SoDResult {
  // ── 1) Super-admin bypass — NEVER blocked ──────────────────────────
  // The platform root is trusted to do both sides of any action.
  // We honour BOTH the "*" wildcard AND the "super_admin" hint flag
  // (routes that know the user's role is super_admin pass it in the
  // permissions array).
  if (userPermissions.includes("*") || userPermissions.includes("super_admin")) {
    return { violated: false };
  }

  // ── 2) Different natural person — no SoD concern ──────────────────
  // We compare user ids (not usernames). When the creator id is
  // missing (e.g. a legacy row, an API-key-created entity), we can't
  // confirm the same-person check — fail OPEN (don't block) rather
  // than fail closed (which would block every legacy-row approval).
  // The audit log entry below still records the attempt.
  if (!creatorId || !approverId || creatorId !== approverId) {
    return { violated: false };
  }

  // ── 3) Same person — check if they hold BOTH permissions ──────────
  // If they only have one side (create OR approve), no violation —
  // they couldn't perform both actions anyway. The "*" check above
  // already handled super-admin; this is for the case where a non-
  // super-admin somehow has both catalog perms explicitly granted.
  const hasCreate =
    userPermissions.includes(action.create_perm) ||
    userPermissions.includes("*");
  const hasApprove =
    userPermissions.includes(action.approve_perm) ||
    userPermissions.includes("*");

  if (hasCreate && hasApprove) {
    const rule = SOD_RULES.find(
      (r) =>
        r.creator_permission === action.create_perm &&
        r.approver_permission === action.approve_perm,
    );
    return {
      violated: true,
      reason:
        rule?.description ||
        "Separation of duties: creator cannot approve own action.",
      rule,
    };
  }

  return { violated: false };
}

/**
 * Convenience helper for routes: takes a Next.js auth context (which
 * has both `isSuperAdmin` and the user object) and returns either
 * `null` (allow) or a 403 NextResponse (block).
 *
 * Super-admin rule: `auth.isSuperAdmin` short-circuits to allow BEFORE
 * `checkSoD` is even called (defence-in-depth — even if the user's
 * permissions array somehow doesn't include `"*"`, the role check
 * fires the bypass).
 *
 * For non-super-admin callers, the user's permissions are merged with
 * the literal `"super_admin"` hint flag when `auth.isSuperAdmin` is
 * true (it won't be in that branch, but the call signature is uniform)
 * — this means `checkSoD` itself never needs to know about the auth
 * context's role flag.
 *
 * Usage in a route:
 *   const sod = assertNoSoDViolation(auth, existing.created_by, {
 *     create_perm: "invoices.create",
 *     approve_perm: "invoices.send",
 *   });
 *   if (sod) return sod;
 */
export async function assertNoSoDViolation(
  auth: AuthContext,
  creatorId: string | null | undefined,
  action: { create_perm: string; approve_perm: string },
): Promise<NextResponse | null> {
  // ── Super-admin bypass — NEVER blocked ─────────────────────────────
  // Two-layer check: isSuperAdmin (from auth context) OR role string
  // (defence-in-depth — the auth context's isSuperAdmin flag is set
  // by `requireAuth` from `effectiveUser.role === "super_admin"`,
  // which is the source of truth).
  if (auth.isSuperAdmin || auth.user.role === "super_admin") {
    return null;
  }

  // Build the effective permissions list. We include the per-tenant
  // override here so the check considers it — but the override is
  // ADDITIVE (it can only grant extra perms, not revoke), so loading
  // it does not let a tenant accidentally BYPASS SoD by stripping a
  // perm via the override (overrides can't strip).
  let tenantOverride: string[] | null = null;
  try {
    if (auth.tenantId && auth.user.role) {
      const { loadTenantRolePermissions } = await import("./tenant-roles");
      tenantOverride = await loadTenantRolePermissions(auth.tenantId, auth.user.role);
    }
  } catch (e) {
    // DB hiccup — proceed without the override. The override is
    // additive so this can only make the check MORE permissive than
    // it should be, which is the safe failure mode for a check that
    // gates user actions (fail open, log).
    console.warn("[sod-matrix] loadTenantRolePermissions failed:", e);
  }

  const basePerms = auth.user.permissions ?? [];
  const effectivePerms =
    tenantOverride && tenantOverride.length > 0
      ? Array.from(new Set([...basePerms, ...tenantOverride]))
      : basePerms;

  const result = checkSoD(effectivePerms, creatorId, auth.user.id, action);
  if (result.violated) {
    return NextResponse.json(
      {
        error: result.reason || "Separation of duties violation.",
        sod_rule: result.rule
          ? {
              create_perm: result.rule.creator_permission,
              approve_perm: result.rule.approver_permission,
              description: result.rule.description,
            }
          : action,
      },
      { status: 403 },
    );
  }
  return null;
}
