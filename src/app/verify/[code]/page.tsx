import { getStore } from "@/lib/data/store";
import { getSupabase } from "@/lib/supabase/client";
import type { DocumentVerification } from "@/lib/supabase/types";
import { cipherName } from "@/lib/utils/name-cipher";
import { VerifyClient } from "@/components/verify/verify-client";

export const dynamic = "force-dynamic";

export default async function VerifyPage({
  params,
}: {
  params: Promise<{ code: string }>;
}) {
  const { code } = await params;
  let v: DocumentVerification | null = null;
  let cipheredRecipient = "—";

  try {
    const store = await getStore();
    v = await store.getDocumentVerificationByCode(code);

    // Fetch partner name and cipher it for display
    if (v?.issued_to_partner_id) {
      try {
        const sb = getSupabase();
        const { data: partner } = await sb
          .from("partners")
          .select("name")
          .eq("id", v.issued_to_partner_id)
          .maybeSingle();
        if (partner?.name) {
          cipheredRecipient = cipherName(partner.name);
        }
      } catch {
        // Non-fatal — cipher stays "—"
      }
    }
  } catch (err) {
    console.warn("[VerifyPage] Error during verification lookup:", err);
  }

  return <VerifyClient verification={v} code={code} cipheredRecipient={cipheredRecipient} />;
}
