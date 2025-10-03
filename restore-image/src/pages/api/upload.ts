import type { NextApiRequest, NextApiResponse } from "next";
import { randomUUID } from "crypto";
import { supabaseAdmin } from "@/lib/supabase";
import { getUserFromRequest } from "@/lib/auth";

export const config = {
  api: {
    bodyParser: false, // we handle raw binary stream
  },
};

interface UploadResponse {
  input_url: string;
}

interface ErrorResponse {
  error: string;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<UploadResponse | ErrorResponse>
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const finalUser = await getUserFromRequest(req, res);
  if (!finalUser) {
    return res.status(401).json({ error: "Not authenticated" });
  }

  try {
    // Collect raw file stream
    const chunks: Uint8Array[] = [];
    await new Promise<void>((resolve, reject) => {
      req.on("data", (chunk) => chunks.push(chunk));
      req.on("end", () => resolve());
      req.on("error", (err) => reject(err));
    });

    const buffer = Buffer.concat(chunks);

    const contentType = req.headers["content-type"] || "image/jpeg";
    const ext = contentType.split("/").pop() || "jpg";

    const filePath = `${finalUser.id}/${new Date().toISOString().slice(0, 10)}/${randomUUID()}.${ext}`;

    const { error } = await supabaseAdmin!
      .storage
      .from(process.env.STORAGE_BUCKET_NAME || "restored-images")
      .upload(filePath, buffer, { contentType, upsert: false });

    if (error) throw error;

    const { data: publicData } = supabaseAdmin!
      .storage
      .from(process.env.STORAGE_BUCKET_NAME || "restored-images")
      .getPublicUrl(filePath);

    if (!publicData?.publicUrl) {
      throw new Error("Failed to get public URL");
    }

    return res.status(200).json({ input_url: publicData.publicUrl });
  } catch (err: unknown) {
    console.error("upload error", err);
    const message = err instanceof Error ? err.message : "Server error";
    return res.status(500).json({ error: message });
  }
}