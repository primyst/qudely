import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabaseClient";
import Replicate from "replicate";

interface PipelineRequestBody {
  userId: string;
  imageUrl: string;
}

const replicate = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN!, // ✅ same env var works fine
});

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

    // 🔍 Fetch user profile
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("trial_count, is_premium")
      .eq("id", userId)
      .single();

    if (profileError || !profile) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // ⛔ Trial limit check
    if (!profile.is_premium && profile.trial_count >= 2) {
      return NextResponse.json(
        { error: "Trial limit reached. Please upgrade to premium." },
        { status: 403 }
      );
    }

    // 🧠 Step 1: Restore the image using the latest SDK method (no version needed)
    const restoredOutput = await replicate.run("flux-kontext-apps/restore-image", {
      input: {
        input_image: imageUrl,
        safety_tolerance: 2,
        output_format: "png",
      },
    });

    // 🧩 The SDK now returns a URL or array — normalize it
    const restored =
      typeof restoredOutput === "string"
        ? restoredOutput
        : Array.isArray(restoredOutput)
        ? restoredOutput[0]
        : "";

    if (!restored) throw new Error("Failed to get restored image URL from Replicate");

    // 💾 Save in history
    const { error: insertError } = await supabase.from("history").insert({
      user_id: userId,
      original: imageUrl,
      restored,
    });

    if (insertError) console.error("History insert error:", insertError);

    // 🔄 Increment trial count if not premium
    if (!profile.is_premium) {
      await supabase
        .from("profiles")
        .update({ trial_count: profile.trial_count + 1 })
        .eq("id", userId);
    }

    // ✅ Respond with restored image
    return NextResponse.json({ restored });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("Pipeline error:", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}