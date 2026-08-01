/**
 * File Upload Service
 * 
 * Uses Supabase Storage for production, with a local fallback for development.
 * All uploads go to Supabase Storage buckets and return a public/storage path.
 */

import { getSupabase, isSupabaseConfigured } from "@/lib/supabase/client";

export interface UploadResult {
  path: string;
  url?: string;
}

/**
 * Upload a file to a Supabase Storage bucket.
 * If Supabase is not configured, returns a mock path (dev mode).
 */
export async function uploadFile(
  bucket: string,
  path: string,
  buffer: Buffer,
  contentType: string,
  _size: number,
): Promise<UploadResult> {
  if (!isSupabaseConfigured()) {
    // Dev fallback — return a mock path
    return { path: `mock://${bucket}/${path}`, url: `mock://${bucket}/${path}` };
  }

  const sb = getSupabase();

  // Ensure bucket exists (ignore error if already exists)
  await sb.storage.createBucket(bucket, { public: true }).catch(() => {});

  const { error } = await sb.storage
    .from(bucket)
    .upload(path, buffer, {
      contentType,
      upsert: true,
    });

  if (error) {
    throw new Error(`Upload failed: ${error.message}`);
  }

  // Get public URL
  const { data: urlData } = sb.storage.from(bucket).getPublicUrl(path);

  return {
    path,
    url: urlData?.publicUrl || undefined,
  };
}

/**
 * Upload a KYC document to the kyc-documents bucket.
 * Path structure: kyc-documents/{submissionId}/{filename}
 */
export async function uploadKycDocument(
  submissionId: string,
  filename: string,
  buffer: Buffer,
  contentType: string,
  size: number,
): Promise<UploadResult> {
  const safeName = filename.replace(/[^a-zA-Z0-9._-]/g, "_");
  const path = `${submissionId}/${Date.now()}_${safeName}`;
  return uploadFile("kyc-documents", path, buffer, contentType, size);
}

/**
 * Delete a file from a Supabase Storage bucket.
 */
export async function deleteFile(
  bucket: string,
  path: string,
): Promise<void> {
  if (!isSupabaseConfigured()) return;

  const sb = getSupabase();
  const { error } = await sb.storage.from(bucket).remove([path]);
  if (error) {
    throw new Error(`Delete failed: ${error.message}`);
  }
}
