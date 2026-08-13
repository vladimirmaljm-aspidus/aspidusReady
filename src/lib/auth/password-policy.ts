import { NextRequest } from "next/server";

/**
 * Password policy validation.
 * Used at user creation + password change to enforce tenant security settings.
 */

export interface PasswordPolicy {
  minLength: number;
  requireUppercase: boolean;
  requireLowercase: boolean;
  requireNumbers: boolean;
  requireSymbols: boolean;
}

export const DEFAULT_POLICY: PasswordPolicy = {
  minLength: 8,
  requireUppercase: true,
  requireLowercase: true,
  requireNumbers: true,
  requireSymbols: false,
};

/**
 * Portal client password policy.
 *
 * Audit finding P1-7: `setup-password` previously used a permissive policy
 * (minLength: 8, no character-class requirements) that accepted passwords
 * like "abcdefgh", while `reset-password` and `change-password` enforced the
 * strong DEFAULT_POLICY (uppercase + lowercase + number). That inconsistency
 * meant a client could set a weak password at first login that they could
 * then never re-use via the change-password flow.
 *
 * Portal clients now use the same strong policy as staff users: 8+ chars
 * with at least one uppercase, one lowercase, and one number. Symbols are
 * intentionally NOT required (mobile-keyboard UX).
 *
 * This is exported as a named constant (rather than re-using DEFAULT_POLICY
 * inline) so there's a single source of truth if the product team later
 * wants to diverge portal and staff policies again.
 */
export const PORTAL_POLICY: PasswordPolicy = {
  minLength: 8,
  requireUppercase: true,
  requireLowercase: true,
  requireNumbers: true,
  requireSymbols: false,
};

export interface PasswordValidationResult {
  ok: boolean;
  errors: string[];
}

export function validatePassword(
  password: string,
  policy: PasswordPolicy = DEFAULT_POLICY
): PasswordValidationResult {
  const errors: string[] = [];

  if (password.length < policy.minLength) {
    errors.push(`Password must be at least ${policy.minLength} characters long.`);
  }
  if (policy.requireUppercase && !/[A-Z]/.test(password)) {
    errors.push("Password must contain at least one uppercase letter.");
  }
  if (policy.requireLowercase && !/[a-z]/.test(password)) {
    errors.push("Password must contain at least one lowercase letter.");
  }
  if (policy.requireNumbers && !/[0-9]/.test(password)) {
    errors.push("Password must contain at least one number.");
  }
  if (policy.requireSymbols && !/[^A-Za-z0-9]/.test(password)) {
    errors.push("Password must contain at least one symbol.");
  }

  // Common weak passwords check
  const weak = [
    "password", "password123", "12345678", "qwerty", "abc123",
    "letmein", "admin", "welcome", "monkey", "dragon",
  ];
  if (weak.includes(password.toLowerCase())) {
    errors.push("This password is too common. Choose a more unique one.");
  }

  return { ok: errors.length === 0, errors };
}

/**
 * Generate a secure random password that meets the default policy.
 * Used when admin clicks "Generate" in the user creation form.
 */
export async function generateSecurePassword(length: number = 12): Promise<string> {
  const upper = "ABCDEFGHJKLMNPQRSTUVWXYZ";
  const lower = "abcdefghijkmnpqrstuvwxyz";
  const numbers = "23456789";
  const symbols = "!@#$%^&*-_=+?";
  const all = upper + lower + numbers + symbols;

  // Use crypto for secure randomness
  const { randomBytes } = await import("crypto");
  const bytes = randomBytes(length);

  // Ensure at least one of each required type
  let pwd = "";
  pwd += upper[bytes[0] % upper.length];
  pwd += lower[bytes[1] % lower.length];
  pwd += numbers[bytes[2] % numbers.length];
  pwd += symbols[bytes[3] % symbols.length];

  for (let i = 4; i < length; i++) {
    pwd += all[bytes[i] % all.length];
  }

  // Shuffle
  return pwd
    .split("")
    .sort(() => randomBytes(1)[0] - 128)
    .join("");
}
