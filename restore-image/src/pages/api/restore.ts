import type { NextApiRequest, NextApiResponse } from 'next';
import { createServerSupabaseClient } from '@supabase/auth-helpers-nextjs';
import { insertRestoration, updateRestoration } from '@/lib/db';
import { restoreImage } from '@/lib/replicate';
import { saveToStorage } from '@/lib/storage';
import { ratelimit } from '@/lib/rate';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const supabaseServer = createServerSupabaseClient({ req, res });
  const { data: { user } } = await supabaseServer.auth.getUser();
  if (!user) return res.status(401).json({ error: 'Not authenticated' });

  // Rate limit per user id
  const rlKey = `restore:${user.id}`;
  const { success } = await ratelimit.limit(rlKey);
  if (!success) return res.status(429).json({ error: 'Too many requests' });

  try {
    const { input_url } = req.body;
    if (!input_url || typeof input_url !== 'string') {
      return res.status(400).json({ error: 'input_url required' });
    }

    // Insert DB record immediately (pending)
    const record = await insertRestoration({
      user_id: user.id,
      input_url,
      status: 'restoring'
    });

    // ✅ Guard against missing id
    if (!record.id) {
      return res.status(500).json({ error: 'Failed to create restoration record' });
    }

    // Call replicate to restore
    const restoredPublicUrl = await restoreImage(input_url);

    // Save to storage and get stable URL
    const storedUrl = await saveToStorage(restoredPublicUrl, user.id, 'restore');

    // Update record
    const updated = await updateRestoration(record.id, {
      restored_url: storedUrl,
      status: 'done',
      meta: { restored_from: restoredPublicUrl }
    });

    return res.status(200).json({
      ok: true,
      id: updated.id,
      input_url, // keep original input_url in response
      restored_url: updated.restored_url
    });
  } catch (err: unknown) {
    console.error('restore error', err);
    const message = err instanceof Error ? err.message : 'Server error';
    return res.status(500).json({ error: message });
  }
}