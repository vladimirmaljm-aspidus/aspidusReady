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
