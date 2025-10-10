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

// Helper function to extract output URL from Replicate response
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

    if (!userId || !imageUrl)
      return NextResponse.json({ error: "Missing parameters" }, { status: 400 });

    const supabase = createClient();

    // Fetch user profile
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("trial_count, is_premium")
      .eq("id", userId)
      .single();

    if (profileError || !profile)
      return NextResponse.json({ error: "User not found" }, { status: 404 });

    // Check if user has trials left (if not premium)
    if (!profile.is_premium && profile.trial_count <= 0) {
      return NextResponse.json(
        { error: "Trial limit reached. Please upgrade to premium." },
        { status: 403 }
      );
    }

    // 🧠 Run the Replicate model
    const result = await replicate.run("flux-kontext-apps/restore-image", {
      input: { input_image: imageUrl },
    });

    const restoredUrl = extractUrl(result);
    if (!restoredUrl)
      throw new Error("Failed to get restored image URL from Replicate");

    // ✅ Insert history record
    await supabase.from("history").insert({
      user_id: userId,
      original_url: imageUrl,
      restored_url: restoredUrl,
    });

    // ✅ Decrement trial count via your Supabase RPC function
    if (!profile.is_premium) {
      const { error: decrementError } = await supabase.rpc("decrement_trial_count", {
        user_id: userId,
      });
      if (decrementError) console.error("Trial decrement error:", decrementError);
    }

    return NextResponse.json({ restored: restoredUrl });
  } catch (err) {
    console.error("Pipeline error:", err);
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}