import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabaseClient";
import fetch from "node-fetch";

export async function POST(req: NextRequest) {
  const supabase = createClient();
  // Get user session
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const body = await req.json();
  const { imageUrl } = body; // client should send the URL (or base64) of original image

  // 1. Call replicate model `flux-kontext-apps/restore-image`
  const replicateResponse = await fetch(
    "https://api.replicate.com/v1/predictions",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Token ${process.env.REPLICATE_API_TOKEN!}`,
      },
      body: JSON.stringify({
        version: "latest",
        model: "flux-kontext-apps/restore-image",
        input: {
          image: imageUrl,
        },
        // You can specify `wait: true` or poll. Replicate’s API supports waiting. 3
      }),
    }
  );

  if (!replicateResponse.ok) {
    const err = await replicateResponse.text();
    return NextResponse.json({ error: "Replicate error: " + err }, { status: 500 });
  }

  const repJson = await replicateResponse.json();
  // The replicate API returns something like:
  // { status: "succeeded", output: "<url to image>" } etc. 4

  if (repJson.status !== "succeeded") {
    // you might want to poll until success. For simplicity here:
    return NextResponse.json({ status: repJson.status });
  }

  const outputUrl = repJson.output; // final restored+colorized result

  // 2. Save to history in Supabase
  const { data: historyEntry, error: historyError } = await supabase
    .from("history")
    .insert({
      user_id: user.id,
      original_url: imageUrl,
      restored_url: outputUrl,
      colorized_url: outputUrl, // since this model does both
    })
    .select()
    .single();

  if (historyError) {
    console.error("History save error:", historyError);
  }

  // 3. Return output(s)
  return NextResponse.json({
    restoredUrl: outputUrl,
    colorizedUrl: outputUrl,
  });
}