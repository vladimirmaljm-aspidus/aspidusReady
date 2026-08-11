/**
 * One-off script: re-encrypt vault_secrets that are stored as legacy plaintext.
 *
 * The vault-crypto.ts `encrypt()` uses AES-256-GCM with a key derived from
 * SECRET_KEY (first 32 chars padded with '0' if shorter). Format:
 *   <iv-base64>:<authTag-base64>:<ciphertext-base64>
 *
 * This script:
 * 1. Reads all vault_secrets rows via the Supabase service_role key.
 * 2. For each row whose encrypted_value does NOT contain ':' (legacy plaintext):
 *    - Encrypts the value with the same algorithm + key as vault-crypto.ts.
 *    - UPDATEs the row in place.
 *    - Redacts the description if it contains the secret value.
 * 3. Logs what it changed.
 *
 * Run once via: bun run scripts/aspidus/reencrypt-vault.ts
 * (Requires SECRET_KEY + SUPABASE_SERVICE_ROLE_KEY env vars.)
 */
import { createCipheriv, randomBytes } from "crypto";

const SUPABASE_URL = "https://nwmwdsslgozqwuufjudj.supabase.co";
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const SECRET_KEY = process.env.SECRET_KEY!;

if (!SUPABASE_SERVICE_ROLE_KEY || !SECRET_KEY) {
  console.error("Missing SUPABASE_SERVICE_ROLE_KEY or SECRET_KEY env var.");
  process.exit(1);
}

const ALGORITHM = "aes-256-gcm";
const IV_LENGTH = 16;

function getKey(): Buffer {
  const raw = SECRET_KEY.padEnd(32, "0").slice(0, 32);
  return Buffer.from(raw, "utf8");
}

function encrypt(text: string): string {
  if (!text) return "";
  const iv = randomBytes(IV_LENGTH);
  const cipher = createCipheriv(ALGORITHM, getKey(), iv);
  const encrypted = Buffer.concat([cipher.update(text, "utf8"), cipher.final()]);
  const authTag = cipher.getAuthTag();
  return `${iv.toString("base64")}:${authTag.toString("base64")}:${encrypted.toString("base64")}`;
}

async function fetchVault(): Promise<Array<{ id: string; key: string; encrypted_value: string; description: string | null; tenant_id: string }>> {
  const r = await fetch(`${SUPABASE_URL}/rest/v1/vault_secrets?select=id,tenant_id,key,encrypted_value,description`, {
    headers: {
      apikey: SUPABASE_SERVICE_ROLE_KEY,
      Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
    },
  });
  if (!r.ok) throw new Error(`Fetch failed: ${r.status} ${await r.text()}`);
  return r.json();
}

async function updateRow(id: string, patch: { encrypted_value?: string; description?: string | null }) {
  const r = await fetch(`${SUPABASE_URL}/rest/v1/vault_secrets?id=eq.${id}`, {
    method: "PATCH",
    headers: {
      apikey: SUPABASE_SERVICE_ROLE_KEY,
      Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
      "Content-Type": "application/json",
      Prefer: "return=minimal",
    },
    body: JSON.stringify(patch),
  });
  if (!r.ok) throw new Error(`Update failed for ${id}: ${r.status} ${await r.text()}`);
}

async function main() {
  console.log("Reading vault_secrets…");
  const rows = await fetchVault();
  console.log(`Found ${rows.length} vault secret(s).`);

  let reencrypted = 0;
  let descriptionsRedacted = 0;
  for (const row of rows) {
    const val = row.encrypted_value || "";
    const isLegacy = !val.includes(":") && val.length > 0;
    if (!isLegacy) {
      console.log(`  OK  ${row.key} (already encrypted)`);
      continue;
    }
    const encrypted = encrypt(val);
    const patch: { encrypted_value: string; description?: string | null } = { encrypted_value: encrypted };

    if (row.description && row.description.includes(val)) {
      patch.description = row.description.split(val).join("[REDACTED — see encrypted_value]");
      descriptionsRedacted++;
    }
    await updateRow(row.id, patch);
    console.log(`  RE  ${row.key} (id=${row.id}): re-encrypted (was ${val.length} chars plaintext, now ${encrypted.length} chars encrypted)${patch.description !== undefined ? " + description redacted" : ""}`);
    reencrypted++;
  }
  console.log(`\nDone. Re-encrypted: ${reencrypted}. Descriptions redacted: ${descriptionsRedacted}.`);
}

main().catch((e) => {
  console.error("FATAL:", e);
  process.exit(1);
});
