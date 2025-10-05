import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabaseClient";
import { Client } from "@gradio/client";

interface RestoreRequestBody {
  userId: string;
  imageUrl: string;
}

export async function POST(req: NextRequest) {
  try {
    const { userId, imageUrl } = (await req.json()) as RestoreRequestBody;

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

    if (profileError || !profile) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    if (!profile.is_premium && profile.trial_count >= 2) {
      return NextResponse.json(
        { error: "Trial limit reached. Please upgrade to premium." },
        { status: 403 }
      );
    }

    // 🔥 Call HuggingFace/Gradio Space
    const client = new Client(
      "https://modelscope-old-photo-restoration.hf.space/--replicas/1pe40/"
    );

    // Predict returns a string (URL) for this Space
    const result = await client.predict(imageUrl, { api_name: "/predict" });

    // Ensure we have a string URL
    if (!result || typeof result !== "string") {
      return NextResponse.json({ error: "Failed to restore image" }, { status: 500 });
    }

    const restoredImageUrl = result;

    // Save history
    await supabase.from("history").insert({
      user_id: userId,
      original: imageUrl,
      restored: restoredImageUrl,
    });

    // Increment trial for free users
    if (!profile.is_premium) {
      await supabase
        .from("profiles")
        .update({ trial_count: profile.trial_count + 1 })
        .eq("id", userId);
    }

    return NextResponse.json({ restored: restoredImageUrl });
  } catch (err) {
    console.error("Restore API error:", err);
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}