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

  // Try server cookie-based user first
  const supabaseServer = createServerSupabaseClient({ req, res });
  const { data: { user } } = await supabaseServer.auth.getUser();

  // If no cookie-based user, accept an Authorization: Bearer <token> header
  let finalUser = user;
  if (!finalUser) {
    const authHeader = (req.headers.authorization || req.headers.Authorization) as string | undefined;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1];
      try {
        // Use admin client to fetch user from token
        const { data: tokenUser, error } = await supabaseAdmin!.auth.getUser(token);
        if (!error && tokenUser?.user) {
          finalUser = tokenUser.user as any;
        }
      } catch (e) {
        // fall through to unauthenticated
      }
    }
  }

  if (!finalUser) return res.status(401).json({ error: 'Not authenticated' });

  try {
    // Parse incoming FormData (raw stream)
    const chunks: Uint8Array[] = [];
    await new Promise<void>((resolve, reject) => {
      req.on('data', (chunk) => chunks.push(chunk));
      req.on('end', () => resolve());
      req.on('error', (err) => reject(err));
    });

    const buffer = Buffer.concat(chunks);

    // Guess extension from Content-Type (FormData won't set this correctly but works in many cases)
    const contentType = req.headers['content-type'] || 'image/jpeg';
    const ext = contentType.split('/').pop() || 'jpg';

    const filePath = `${finalUser.id}/${new Date().toISOString().slice(0,10)}/${randomUUID()}.${ext}`;

    const { error } = await supabaseAdmin!.storage
      .from(process.env.STORAGE_BUCKET_NAME || 'restored-images')
      .upload(filePath, buffer, { contentType, upsert: false });

    if (error) throw error;

    const { data: publicData } = supabaseAdmin!
      .storage
      .from(process.env.STORAGE_BUCKET_NAME || 'restored-images')
      .getPublicUrl(filePath);

    if (!publicData?.publicUrl) throw new Error('Failed to get public URL');

    return res.status(200).json({ input_url: publicData.publicUrl });
  } catch (err: unknown) {
    console.error('upload error', err);
    const message = err instanceof Error ? err.message : 'Server error';
    return res.status(500).json({ error: message });
  }
}