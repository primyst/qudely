import type { NextApiRequest, NextApiResponse } from 'next';
import { insertRestoration, updateRestoration } from '@/lib/db';
import replicate from '@/lib/replicate'; // your replicate helper

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { input_url, user_id } = req.body;

    // Create pending job
    const record = await insertRestoration({
      input_url,
      status: 'restoring',
      user_id,
    });

    // Call Replicate restore-image
    const restoredUrl = await replicate.restoreImage(input_url);

    // Update record
    await updateRestoration(record.id, {
      restored_url: restoredUrl,
      status: 'done',
    });

    res.status(200).json({ id: record.id, restoredUrl });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
}
