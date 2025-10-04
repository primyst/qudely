import Replicate from "replicate";

export const replicate = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN!,
});

export async function restoreAndColorize(imageUrl: string) {
  // Step 1: Restore
  const restored = await replicate.run(
    "flux-kontext-apps/restore-image:latest",
    { input: { image: imageUrl } }
  );

  // Step 2: Colorize (DeOldify model)
  const colorized = await replicate.run(
    "tomekkora/deoldify:latest",
    { input: { image: restored } }
  );

  return { restored, colorized };
}