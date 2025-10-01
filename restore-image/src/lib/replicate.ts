import Replicate from 'replicate';

if (!process.env.REPLICATE_API_TOKEN) {
  throw new Error('Missing REPLICATE_API_TOKEN');
}

const replicate = new Replicate({ auth: process.env.REPLICATE_API_TOKEN });

export async function restoreImage(inputUrl: string): Promise<string> {
  if (!/^https?:\/\//.test(inputUrl)) throw new Error('Invalid input_url');
  const model = 'flux-kontext-apps/restore-image';
  const output = await replicate.run(model, { input: { image: inputUrl } });
  if (Array.isArray(output) && output.length > 0) return output[0];
  if (typeof output === 'string') return output;
  throw new Error('No output from restore model');
}

export async function colorizeImage(inputUrl: string): Promise<string> {
  const model = 'flux-kontext-apps/colorize-image';
  const output = await replicate.run(model, { input: { image: inputUrl } });
  if (Array.isArray(output) && output.length > 0) return output[0];
  if (typeof output === 'string') return output;
  throw new Error('No output from colorize model');
}

// Assign to a named object before exporting
export const replicateUtils = { restoreImage, colorizeImage };