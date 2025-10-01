import { createServerSupabaseClient } from '@supabase/auth-helpers-nextjs';
import type { NextApiRequest, NextApiResponse } from 'next';
import { restoreImage } from '@/lib/replicate'; // <- helper you’ll make
import { saveToStorage, updateRestoration } from '@/lib/db'; // <- your db/storage utils

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const supabase = createServerSupabaseClient({ req, res });
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return res.status(401).json({ error: 'Not authenticated' });

  try {
    const { input_url, recordId } = req.body;

    // Step 1: Restore with replicate
    const restoredUrl = await restoreImage(input_url);

    // Step 2: Save to storage, linked to user
    const storedUrl = await saveToStorage(restoredUrl, user.id, 'restore');

    // Step 3: Update DB
    await updateRestoration(recordId, { restored_url: storedUrl });

    return res.status(200).json({ restoredUrl: storedUrl });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
}
