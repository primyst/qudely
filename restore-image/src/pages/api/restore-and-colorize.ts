import type { NextApiRequest, NextApiResponse } from "next";
import { insertRestoration, updateRestoration } from "@/lib/db";
import { restoreImage, colorizeImage } from "@/lib/replicate";
import { saveToStorage } from "@/lib/storage";
import { ratelimit } from "@/lib/rate";
import { getUserFromRequest } from "@/lib/auth";

// ---- Strong types ----
interface PipelineRequest {
  input_url: string;
}

interface PipelineResponse {
  ok: true;
  id: string;
  input_url: string;
  restored_url: string;
  colorized_url: string;
}

interface ErrorResponse {
  error: string;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<PipelineResponse | ErrorResponse>
) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const finalUser = await getUserFromRequest(req, res);
  if (!finalUser) return res.status(401).json({ error: "Not authenticated" });

  const { success } = await ratelimit.limit(`pipeline:${finalUser.id}`);
  if (!success) return res.status(429).json({ error: "Too many requests" });

  try {
    const { input_url } = req.body as PipelineRequest;
    if (!input_url || typeof input_url !== "string") {
      return res.status(400).json({ error: "input_url required" });
    }

    const record = await insertRestoration({
      user_id: finalUser.id,
      input_url,
      status: "restoring",
    });
    if (!record.id) return res.status(500).json({ error: "Failed to create record" });

    // Step 1: Restore
    const restoredPublic = await restoreImage(input_url);
    const restoredStored = await saveToStorage(restoredPublic, finalUser.id, "restore");

    await updateRestoration(record.id, {
      restored_url: restoredStored,
      status: "colorizing",
      meta: { restored_from: restoredPublic },
    });

    // Step 2: Colorize
    const colorPublic = await colorizeImage(restoredStored);
    const colorStored = await saveToStorage(colorPublic, finalUser.id, "colorize");

    const final = await updateRestoration(record.id, {
      colorized_url: colorStored,
      status: "done",
      meta: { colorized_from: colorPublic },
    });

    // ✅ Ensure id is defined
    if (!final?.id) {
      return res.status(500).json({ error: "Final record missing ID" });
    }

    return res.status(200).json({
      ok: true,
      id: final.id, // now safe
      input_url,
      restored_url: final.restored_url ?? "",
      colorized_url: final.colorized_url ?? "",
    });
  } catch (err: unknown) {
    console.error("pipeline error", err);
    return res.status(500).json({
      error: err instanceof Error ? err.message : "Server error",
    });
  }
}