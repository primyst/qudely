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

    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("trial_count, is_premium")
      .eq("id", userId)
      .single();

    if (profileError || !profile) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const TRIAL_LIMIT = 2;
    if (!profile.is_premium && profile.trial_count >= TRIAL_LIMIT) {
      return NextResponse.json(
        { error: "Trial limit reached. Please upgrade to premium." },
        { status: 403 }
      );
    }

    const HF_API_KEY = process.env.HF_API_KEY;
    if (!HF_API_KEY) throw new Error("Missing Hugging Face API key");

    const client = new Client(
      "https://api-inference.huggingface.co/spaces/modelscope/old_photo_restoration",
      { hf_token: HF_API_KEY as `hf_${string}` }
    );

    const result = await client.predict(imageUrl, { api_name: "/predict" });

    if (!result || typeof result !== "string") {
      return NextResponse.json({ error: "Failed to restore image" }, { status: 500 });
    }

    const restoredImageUrl = result;

    await supabase.from("history").insert({
      user_id: userId,
      original: imageUrl,
      restored: restoredImageUrl,
    });

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