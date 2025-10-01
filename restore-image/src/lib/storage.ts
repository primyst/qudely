import { supabaseAdmin } from './supabase';

const BUCKET = process.env.STORAGE_BUCKET_NAME || 'restored-images';

if (!supabaseAdmin) {
  // Note: this file is server-only — don't import on client.
}

function sanitizeFilename(name: string) {
  return name.replace(/[^a-zA-Z0-9\-_./]/g, '-');
}

export async function saveToStorage(remoteUrl: string, userId: string, step: 'restore' | 'colorize') {
  if (!supabaseAdmin) throw new Error('Missing SUPABASE_SERVICE_ROLE_KEY');

  // Download
  const res = await fetch(remoteUrl);
  if (!res.ok) throw new Error(`Failed to download image: ${res.status}`);
  const contentType = res.headers.get('content-type') || 'image/jpeg';

  // Limit check (optional): read length if available
  const maxBytes = Number(process.env.MAX_IMAGE_BYTES || 5_242_880); // default 5MB
  const contentLength = res.headers.get('content-length');
  if (contentLength && Number(contentLength) > maxBytes) {
    throw new Error('Image exceeds maximum allowed size');
  }

  const buffer = Buffer.from(await res.arrayBuffer());

  // File path: userId/YYYYMMDD/ts-step.ext
  const ext = contentType.split('/').pop() || 'jpg';
  const path = sanitizeFilename(`${userId}/${new Date().toISOString().slice(0,10)}/${Date.now()}-${step}.${ext}`);

  // Upload (upsert true = overwrite if same path)
  const { error } = await supabaseAdmin.storage
    .from(BUCKET)
    .upload(path, buffer, {
      contentType,
      upsert: false
    });

  if (error) throw error;

  // Make a public URL if bucket is public. If bucket is private, return signed URL instead.
  const { data: publicData } = supabaseAdmin.storage.from(BUCKET).getPublicUrl(path);
  if (publicData && publicData.publicUrl) {
    // Add cache-control param for CDN caches if desired by app consumers
    return publicData.publicUrl;
  }

  // Fallback: signed URL (valid for short time)
  const { data: signed, error: signedErr } = await supabaseAdmin.storage.from(BUCKET).createSignedUrl(path, 60 * 60 * 24); // 24h
  if (signedErr) throw signedErr;
  return signed.signedUrl;
}
