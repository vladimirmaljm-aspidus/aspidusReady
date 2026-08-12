import { createCipheriv, createDecipheriv, randomBytes } from "crypto";

/**
 * Vault secret encryption helper.
 *
 * Uses AES-256-GCM (authenticated encryption) so any tampering with the
 * ciphertext is detected on decrypt. The format is:
 *
 *   <iv-base64>:<authTag-base64>:<ciphertext-base64>
 *
 * Backward compatibility:
 *   - `decrypt()` accepts legacy plaintext (no colons in the value) and
 *     returns it as-is. This lets us roll out encryption without migrating
 *     existing rows — old secrets stay readable until they are next saved,
 *     at which point they become encrypted.
 *   - If decryption fails for any reason (wrong key, corrupted data, etc.),
 *     the original value is returned untouched so the vault stays readable
 *     even if `SECRET_KEY` is rotated/lost. Log the failure upstream.
 *
 * The key is derived from `SECRET_KEY` env var (padded/truncated to 32
 * bytes). When `SECRET_KEY` is unset or shorter than 16 chars, `getKey()`
 * throws — every environment (including dev) MUST set SECRET_KEY.
 */

const ALGORITHM = "aes-256-gcm";
const IV_LENGTH = 16;

function getKey(): Buffer {
  const raw = process.env.SECRET_KEY;
  if (!raw || raw.length < 16) {
    throw new Error("SECRET_KEY environment variable is required (min 16 chars). Set it in your .env or Render env vars.");
  }
  return Buffer.from(raw.padEnd(32, "0").slice(0, 32), "utf8");
}

/**
 * Encrypt a plaintext secret into the colon-separated wire format. Returns
 * the empty string when given the empty string.
 */
export function encrypt(text: string): string {
  if (text == null) return "";
  const str = typeof text === "string" ? text : String(text);
  if (str === "") return "";
  const iv = randomBytes(IV_LENGTH);
  const cipher = createCipheriv(ALGORITHM, getKey(), iv);
  const encrypted = Buffer.concat([cipher.update(str, "utf8"), cipher.final()]);
  const authTag = cipher.getAuthTag();
  return `${iv.toString("base64")}:${authTag.toString("base64")}:${encrypted.toString("base64")}`;
}

/**
 * Decrypt a value produced by `encrypt()`. Returns the original input
 * untouched when:
 *   - the value does not look like our wire format (legacy plaintext), or
 *   - decryption fails (wrong key, tampered ciphertext, etc.).
 *
 * This graceful fallback keeps the vault readable across key rotations and
 * migrations — at the cost of failing CLOSED for security (decrypt returns
 * the encrypted blob rather than the plaintext, which the UI can flag as
 * "could not decrypt").
 */
export function decrypt(encryptedValue: string): string {
  if (encryptedValue == null) return "";
  const str = typeof encryptedValue === "string" ? encryptedValue : String(encryptedValue);
  if (str === "") return "";

  // Heuristic: our format is exactly three colon-separated base64 chunks.
  const parts = str.split(":");
  if (parts.length !== 3) {
    // Legacy plaintext — return as-is.
    return str;
  }
  const [ivB64, authTagB64, dataB64] = parts;
  if (!ivB64 || !authTagB64 || !dataB64) return str;

  try {
    const iv = Buffer.from(ivB64, "base64");
    const authTag = Buffer.from(authTagB64, "base64");
    const encrypted = Buffer.from(dataB64, "base64");
    const decipher = createDecipheriv(ALGORITHM, getKey(), iv);
    decipher.setAuthTag(authTag);
    return decipher.update(encrypted).toString("utf8") + decipher.final("utf8");
  } catch {
    // Decryption failed (wrong key / tampered / corrupted). Return the raw
    // stored value so the caller can surface a "could not decrypt" notice
    // rather than silently returning empty/garbage data.
    return str;
  }
}
