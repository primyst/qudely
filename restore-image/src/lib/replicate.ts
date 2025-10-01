import Replicate from 'replicate';

if (!process.env.REPLICATE_API_TOKEN) {
  throw new Error('Missing REPLICATE_API_TOKEN');
}

const replicate = new Replicate({ auth: process.env.REPLICATE_API_TOKEN });

/**
 * Calls the restore model (flux-kontext-apps/restore-image).
 * Returns a single public URL (string).
 */
export async function restoreImage(inputUrl: string): Promise<string> {
  // Validate URL quickly
  if (!/^https?:\/\//.test(inputUrl)) throw new Error('Invalid input_url');

  const model = 'flux-kontext-apps/restore-image';
  const output = await replicate.run(model, {
    input: { image: inputUrl }
  });

  if (Array.isArray(output) && output.length > 0) return output[0];
  if (typeof output === 'string') return output;
  throw new Error('No output from restore model');
}

/**
 * Calls a colorization model — placeholder name "flux-kontext-apps/colorize" (change later).
 * Returns a single public URL.
 */
export async function colorizeImage(inputUrl: string): Promise<string> {
  // Example: if you later choose DeOldify or a specific colorizer, swap model name here.
  const model = 'flux-kontext-apps/colorize-image'; // <-- replace if necessary
  const output = await replicate.run(model, {
    input: { image: inputUrl }
  });
  if (Array.isArray(output) && output.length > 0) return output[0];
  if (typeof output === 'string') return output;
  throw new Error('No output from colorize model');
}

export default { restoreImage, colorizeImage };
