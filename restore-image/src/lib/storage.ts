import { supabaseAdmin } from './supabase';
import fetch from 'node-fetch';

export async function saveToStorage(remoteUrl: string, userId: string, step: 'restore' | 'colorize') {
  if (!supabaseAdmin) throw new Error('Missing SUPABASE_SERVICE_ROLE_KEY');

  const resp = await fetch(remoteUrl);
  if (!resp.ok) throw new Error('Failed to download image from Replicate');

  const buffer = Buffer.from(await resp.arrayBuffer());
  const filePath = `${userId}/${Date.now()}-${step}.jpg`;

  const { error } = await supabaseAdmin.storage
    .from('restored-images')
    .upload(filePath, buffer, { contentType: 'image/jpeg', upsert: true });

  if (error) throw error;

  // Public URL (if bucket is public)
  return supabaseAdmin.storage.from('restored-images').getPublicUrl(filePath).data.publicUrl;
}
