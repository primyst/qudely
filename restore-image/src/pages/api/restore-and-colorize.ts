import type { NextApiRequest, NextApiResponse } from 'next';
import { createServerSupabaseClient } from '@supabase/auth-helpers-nextjs';
import { insertRestoration, updateRestoration } from '@/lib/db';
import { restoreImage, colorizeImage } from '@/lib/replicate';
import { saveToStorage } from '@/lib/storage';
import { ratelimit } from '@/lib/rate';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const supabaseServer = createServerSupabaseClient({ req, res });
  const { data: { user } } = await supabaseServer.auth.getUser();
  if (!user) return res.status(401).json({ error: 'Not authenticated' });

  // Rate limiting
  const { success } = await ratelimit.limit(`pipeline:${user.id}`);
  if (!success) return res.status(429).json({ error: 'Too many requests' });

  try {
    const { input_url } = req.body;
    if (!input_url || typeof input_url !== 'string') return res.status(400).json({ error: 'input_url required' });

    // Insert job
    const record = await insertRestoration({
      user_id: user.id,
      input_url,
      status: 'restoring'
    });

    // 1) Restore
    const restoredPublic = await restoreImage(input_url);
    const restoredStored = await saveToStorage(restoredPublic, user.id, 'restore');

    await updateRestoration(record.id, {
      restored_url: restoredStored,
      status: 'colorizing',
      meta: { restored_from: restoredPublic }
    });

    // 2) Colorize (input is the restoredStored or restoredPublic depending on what model can accept)
    const colorInput = restoredStored; // stable URL in storage
    const colorPublic = await colorizeImage(colorInput);
    const colorStored = await saveToStorage(colorPublic, user.id, 'colorize');

    // Final update
    const final = await updateRestoration(record.id, {
      colorized_url: colorStored,
      status: 'done',
      meta: { ...record.meta, colorized_from: colorPublic }
    });

    return res.status(200).json({
      ok: true,
      id: final.id,
      restored_url: final.restored_url,
      colorized_url: final.colorized_url
    });
  } catch (err: any) {
    console.error('pipeline error', err);
    // Mark as failed if record exists? best-effort (we might not have created record)
    try { if ((err as any).recordId) await updateRestoration((err as any).recordId, { status: 'failed' }); } catch (_) {}
    return res.status(500).json({ error: err.message || 'Server error' });
  }
}
