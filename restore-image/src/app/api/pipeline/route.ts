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

export async function POST(req: NextRequest) {
  try {
    const body: PipelineRequestBody = await req.json();
    const { userId, imageUrl } = body;

    if (!userId || !imageUrl) {
      return NextResponse.json({ error: "Missing parameters" }, { status: 400 });
    }

    // Step 1: Restore image
    const restored: string = await replicate.run(
      "flux-kontext-apps/restore-image:latest",
      { input: { image: imageUrl } }
    );

    // Step 2: Colorize image
    const colorized: string = await replicate.run(
      "tomekkora/deoldify:latest",
      { input: { image: restored } }
    );

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