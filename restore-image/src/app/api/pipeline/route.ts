import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabaseClient";
import Replicate from "replicate";

interface PipelineRequestBody {
  userId: string;
  imageUrl: string;
}

interface PipelineResponse {
  restored: string;
  colorized: string;
}

const replicate = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN!,
});

// Helper to safely extract string URL from Replicate output
function extractUrl(result: unknown): string {
  if (typeof result === "string") return result;
  if (Array.isArray(result)) return result[0] ?? "";
  if (typeof result === "object" && result !== null && "url" in result) {
    return (result as { url?: string }).url ?? "";
  }
  return "";
}

export async function POST(req: NextRequest) {
  try {
    const body: PipelineRequestBody = await req.json();
    const { userId, imageUrl } = body;

    if (!userId || !imageUrl) {
      return NextResponse.json({ error: "Missing parameters" }, { status: 400 });
    }

    // Step 1: Restore image
    const restoredResult = await replicate.run(
      "flux-kontext-apps/restore-image:latest",
      { input: { image: imageUrl } }
    );
    const restored = extractUrl(restoredResult);
    if (!restored) throw new Error("Failed to get restored image URL");

    // Step 2: Colorize image
    const colorizedResult = await replicate.run(
      "tomekkora/deoldify:latest",
      { input: { image: restored } }
    );
    const colorized = extractUrl(colorizedResult);
    if (!colorized) throw new Error("Failed to get colorized image URL");

    // Store in Supabase history
    const supabase = createClient();
    await supabase.from("history").insert({
      user_id: userId,
      original: imageUrl,
      restored,
      colorized,
    });

    const response: PipelineResponse = { restored, colorized };
    return NextResponse.json(response);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("Pipeline error:", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}