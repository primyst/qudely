import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabaseClient";
import Replicate from "replicate";

interface PipelineRequestBody {
  userId: string;
  imageUrl: string;
}

const replicate = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN!,
});

// Helper to safely extract image URL
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
    const { userId, imageUrl } = (await req.json()) as PipelineRequestBody;

    if (!userId || !imageUrl) {
      return NextResponse.json(
        { error: "Missing parameters" },
        { status: 400 }
      );
    }

    const supabase = createClient();

    // Fetch user profile
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("trial_count, is_premium")
      .eq("id", userId)
      .single();

    if (profileError || !profile) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Check trial limit
    if (!profile.is_premium && profile.trial_count >= 2) {
      return NextResponse.json(
        { error: "Trial limit reached. Please upgrade to premium." },
        { status: 403 }
      );
    }

    // 🧠 Process image using Flux Restore
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
    if (!restored)
      throw new Error("Failed to get restored image URL from Replicate");

    // Save to user history
    const { error: insertError } = await supabase.from("history").insert({
      user_id: userId,
      original: imageUrl,
      restored,
    });

    if (insertError) console.error("History insert error:", insertError);

    // Increment trial count for free users
    if (!profile.is_premium) {
      await supabase
        .from("profiles")
        .update({ trial_count: profile.trial_count + 1 })
        .eq("id", userId);
    }

    return NextResponse.json({ restored });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("Pipeline error:", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}