import type { NextApiRequest, NextApiResponse } from 'next';
import { createServerSupabaseClient } from '@supabase/auth-helpers-nextjs';
import { supabaseAdmin } from '@/lib/supabase';
import { randomUUID } from 'crypto';
import type { User } from '@supabase/supabase-js';  // 👈 proper type

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const supabaseServer = createServerSupabaseClient({ req, res });
  const { data: { user } } = await supabaseServer.auth.getUser();

  let finalUser: User | null = user;  // 👈 explicitly typed

  if (!finalUser) {
    const authHeader = (req.headers.authorization || req.headers.Authorization) as string | undefined;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1];
      try {
        const { data: tokenUser, error } = await supabaseAdmin!.auth.getUser(token);
        if (!error && tokenUser?.user) {
          finalUser = tokenUser.user;  // 👈 already type-safe
        }
      } catch {
        // ignore
      }
    }
  }

  if (!finalUser) return res.status(401).json({ error: 'Not authenticated' });

  try {
    const chunks: Uint8Array[] = [];
    await new Promise<void>((resolve, reject) => {
      req.on('data', (chunk) => chunks.push(chunk));
      req.on('end', () => resolve());
      req.on('error', (err) => reject(err));
    });

    const buffer = Buffer.concat(chunks);
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