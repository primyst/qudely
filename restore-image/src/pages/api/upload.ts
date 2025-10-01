import type { NextApiRequest, NextApiResponse } from 'next';
import { createServerSupabaseClient } from '@supabase/auth-helpers-nextjs';
import { supabaseAdmin } from '@/lib/supabase';
import { randomUUID } from 'crypto';

export const config = {
  api: {
    bodyParser: false, // we will use FormData
  },
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const supabaseServer = createServerSupabaseClient({ req, res });
  const { data: { user } } = await supabaseServer.auth.getUser();
  if (!user) return res.status(401).json({ error: 'Not authenticated' });

  try {
    // Parse incoming FormData
    const chunks: Uint8Array[] = [];
    await new Promise<void>((resolve, reject) => {
      req.on('data', (chunk) => chunks.push(chunk));
      req.on('end', () => resolve());
      req.on('error', (err) => reject(err));
    });

    const buffer = Buffer.concat(chunks);

    // Get file extension from Content-Type header
    const contentType = req.headers['content-type'] || 'image/jpeg';
    const ext = contentType.split('/').pop() || 'jpg';

    // File path: userId/YYYYMMDD/uuid.ext
    const filePath = `${user.id}/${new Date().toISOString().slice(0,10)}/${randomUUID()}.${ext}`;

    const { error } = await supabaseAdmin!.storage
      .from('restored-images')
      .upload(filePath, buffer, { contentType, upsert: false });

    if (error) throw error;

    // Get public URL
    const { data: publicData } = supabaseAdmin!.storage.from('restored-images').getPublicUrl(filePath);
    if (!publicData || !publicData.publicUrl) throw new Error('Failed to get public URL');

    return res.status(200).json({ input_url: publicData.publicUrl });
  } catch (err: unknown) {
  console.error('upload error', err);
  const message = err instanceof Error ? err.message : 'Server error';
  return res.status(500).json({ error: message });
}
}
