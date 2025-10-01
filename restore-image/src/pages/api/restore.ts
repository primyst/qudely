import type { NextApiRequest, NextApiResponse } from 'next';
import replicate from '@/lib/replicate'; // your replicate helper
import { insertRestoration, updateRestoration } from '@/lib/db';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { input_url, user_id } = req.body;
    const record = await insertRestoration({ input_url, status: 'pending', user_id });

    // call replicate restore-image model (your replicate helper should abstract details)
    const restoredUrl = await replicate.restoreImage(input_url);

    await updateRestoration(record.id, { restored_url: restoredUrl, status: 'done' });

    return res.status(200).json({ ok: true, restoredUrl, id: record.id });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: err.message || 'Something went wrong' });
  }
}
