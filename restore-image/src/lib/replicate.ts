// lib/replicate.ts
import Replicate from "replicate";

const replicate = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN!,
});

export async function restoreImage(inputUrl: string): Promise<string> {
  const output = await replicate.run(
    "flux-kontext-apps/restore-image", 
    {
      input: {
        image: inputUrl,
      },
    }
  );

  // Replicate usually returns an array of image URLs
  if (Array.isArray(output) && output.length > 0) {
    return output[0];
  }

  throw new Error("No output received from restore-image model");
}
