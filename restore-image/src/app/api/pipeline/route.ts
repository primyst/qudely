import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabaseClient";
import Replicate from "replicate";

interface PipelineRequestBody {
  userId: string;
  imageUrl: string;
}
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabaseClient";
import Replicate from "replicate";

interface PipelineRequestBody {
  userId: string;
  imageUrl: string;
}

interface PipelineResponse {
  restored: string;
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

    const supabase = createClient();

    // Fetch user profile
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("trial_count, is_premium")
      .eq("id", userId)
      .single();

    if (profileError) {
      console.error("Profile error:", profileError);
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Enforce trial limit
    if (!profile.is_premium && profile.trial_count >= 2) {
      return NextResponse.json(
        { error: "Trial limit reached. Please upgrade to premium." },
        { status: 403 }
      );
    }

    // --- Step 1: Restore + Colorize using FLUX Kontext ---
    const restoredResult = await replicate.run(
      "flux-kontext-apps/restore-image:1d22d3b0e9ed7f1ebec8d5a8f8d8d6c5a7018e8f9cd56b27f3e9a2094f99b1b2",
      {
        input: {
          input_image: imageUrl,
          safety_tolerance: 2,
          output_format: "png",
        },
      }
    );

    const restored = extractUrl(restoredResult);
    if (!restored) throw new Error("Failed to get restored image URL");

    // Save history in Supabase
    const { error: insertError } = await supabase.from("history").insert({
      user_id: userId,
      original: imageUrl,
      restored,
    });

    if (insertError) {
      console.error("Error inserting history:", insertError);
    }

    // Increment trial count if not premium
    if (!profile.is_premium) {
      await supabase
        .from("profiles")
        .update({ trial_count: profile.trial_count + 1 })
        .eq("id", userId);
    }

    const response: PipelineResponse = { restored };
    return NextResponse.json(response);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("Pipeline error:", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
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