import type { NextApiRequest, NextApiResponse } from 'next';
import { insertRestoration, updateRestoration } from '@/lib/db';
import { restoreImage } from '@/lib/replicate';
import { saveToStorage } from '@/lib/storage';
import { ratelimit } from '@/lib/rate';
import { getUserFromRequest } from '@/lib/auth';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const finalUser = await getUserFromRequest(req, res);
  if (!finalUser) return res.status(401).json({ error: 'Not authenticated' });

  const { success } = await ratelimit.limit(`restore:${finalUser.id}`);
  if (!success) return res.status(429).json({ error: 'Too many requests' });

  try {
    const { input_url } = req.body;
    if (!input_url || typeof input_url !== 'string') return res.status(400).json({ error: 'input_url required' });

    const record = await insertRestoration({ user_id: finalUser.id, input_url, status: 'restoring' });
    if (!record.id) return res.status(500).json({ error: 'Failed to create record' });

    const restoredPublic = await restoreImage(input_url);
    const restoredStored = await saveToStorage(restoredPublic, finalUser.id, 'restore');

    const updated = await updateRestoration(record.id, {
      restored_url: restoredStored,
      status: 'done',
      meta: { restored_from: restoredPublic }
    });

    return res.status(200).json({
      ok: true,
      id: updated.id,
      input_url,
      restored_url: updated.restored_url
    });
  } catch (err: unknown) {
    console.error('restore error', err);
    return res.status(500).json({ error: err instanceof Error ? err.message : 'Server error' });
  }
}