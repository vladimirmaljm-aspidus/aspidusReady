import { getSupabase, isSupabaseConfigured } from "@/lib/supabase/client";

export interface UploadResult { url: string; path: string; }

export async function uploadFile(bucket: string, path: string, buffer: Buffer, contentType: string, size: number): Promise<UploadResult> {
  if (size > 10 * 1024 * 1024) throw new Error("File too large. Max 10MB.");
  if (!isSupabaseConfigured()) {
    const base64 = buffer.toString("base64");
    const dataUrl = `data:${contentType};base64,${base64}`;
    return { url: dataUrl, path };
  }
  const sb = getSupabase();
  const { error } = await sb.storage.from(bucket).upload(path, buffer, { contentType, upsert: true });
  if (error) throw new Error(`Upload failed: ${error.message}`);
  const { data: publicData } = sb.storage.from(bucket).getPublicUrl(path);
  if (publicData?.publicUrl) return { url: publicData.publicUrl, path };
  const { data: signedData, error: signedError } = await sb.storage.from(bucket).createSignedUrl(path, 3600);
  if (signedError || !signedData?.signedUrl) return { url: path, path };
  return { url: signedData.signedUrl, path };
}

export async function uploadKycDocument(submissionId: string, fileName: string, buffer: Buffer, contentType: string, size: number): Promise<UploadResult> {
  const ext = fileName.split(".").pop() || "bin";
  const path = `${submissionId}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
  return uploadFile("kyc-documents", path, buffer, contentType, size);
}

export async function deleteFile(bucket: string, path: string): Promise<void> {
  if (!isSupabaseConfigured()) return;
  const sb = getSupabase();
  const { error } = await sb.storage.from(bucket).remove([path]);
  if (error) console.warn(`[upload] Failed to delete ${path}:`, error.message);
}
