import { supabase } from '@/integrations/supabase/client';

export interface UploadProgress {
  progress: number;
  loaded: number;
  total: number;
}

export interface UploadResult {
  url: string;
  path: string;
  size: number;
}

/**
 * Upload a blob directly to Supabase storage with progress tracking
 * @param blob - The file blob to upload
 * @param bucketName - Storage bucket name ('hair-photos', 'avatars', 'client-videos')
 * @param fileName - Optional custom filename (will generate random if not provided)
 * @param onProgress - Optional progress callback
 * @returns Promise with public URL and file path
 */
export async function uploadToStorage(
  blob: Blob,
  bucketName: 'hair-photos' | 'avatars' | 'client-videos',
  fileName?: string,
  onProgress?: (progress: UploadProgress) => void
): Promise<UploadResult> {
  // Generate filename if not provided
  if (!fileName) {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(7);
    const extension = blob.type.split('/')[1] || 'jpg';
    fileName = `${timestamp}-${random}.${extension}`;
  }

  // Upload with progress tracking
  const { data, error } = await supabase.storage
    .from(bucketName)
    .upload(fileName, blob, {
      cacheControl: '3600',
      upsert: false,
      contentType: blob.type,
    });

  if (error) {
    console.error('Storage upload error:', error);
    throw new Error(`Upload failed: ${error.message}`);
  }

  // Get public URL
  const {
    data: { publicUrl },
  } = supabase.storage.from(bucketName).getPublicUrl(data.path);

  return {
    url: publicUrl,
    path: data.path,
    size: blob.size,
  };
}

/**
 * Delete a file from Supabase storage
 * @param bucketName - Storage bucket name
 * @param filePath - File path within the bucket
 */
export async function deleteFromStorage(
  bucketName: 'hair-photos' | 'avatars' | 'client-videos',
  filePath: string
): Promise<void> {
  const { error } = await supabase.storage.from(bucketName).remove([filePath]);

  if (error) {
    console.error('Storage delete error:', error);
    throw new Error(`Delete failed: ${error.message}`);
  }
}

/**
 * Get a signed URL for private bucket access
 * @param bucketName - Storage bucket name
 * @param filePath - File path within the bucket
 * @param expiresIn - Expiration time in seconds (default: 3600)
 */
export async function getSignedUrl(
  bucketName: 'hair-photos' | 'avatars' | 'client-videos',
  filePath: string,
  expiresIn: number = 3600
): Promise<string> {
  const { data, error } = await supabase.storage
    .from(bucketName)
    .createSignedUrl(filePath, expiresIn);

  if (error) {
    console.error('Signed URL error:', error);
    throw new Error(`Failed to create signed URL: ${error.message}`);
  }

  return data.signedUrl;
}
