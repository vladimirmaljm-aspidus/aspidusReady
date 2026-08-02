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
 * Upload a document to the documents bucket.
 * Alias for uploadFile with the "documents" bucket.
 */
export async function uploadDocument(
  path: string,
  buffer: Buffer,
  contentType: string,
  size: number,
): Promise<UploadResult> {
  return uploadFile("documents", path, buffer, contentType, size);
}

/**
 * Download a file from a Supabase Storage bucket.
 * Returns the file buffer and content type.
 */
export async function downloadFile(
  bucket: string,
  path: string,
): Promise<{ buffer: ArrayBuffer; contentType: string }> {
  if (!isSupabaseConfigured()) {
    throw new Error("Supabase is not configured. Cannot download files.");
  }

  const sb = getSupabase();
  const { data, error } = await sb.storage.from(bucket).download(path);

  if (error) {
    throw new Error(`Download failed: ${error.message}`);
  }

  if (!data) {
    throw new Error("File not found in storage.");
  }

  const buffer = await data.arrayBuffer();
  return {
    buffer,
    contentType: data.type || "application/octet-stream",
  };
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
