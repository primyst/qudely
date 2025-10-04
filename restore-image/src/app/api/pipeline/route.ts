import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

const REPLICATE_API = "https://api.replicate.com/v1/predictions";
const MODEL = "flux-kontext-apps/restore-image";

async function createReplicatePrediction(imageUrl: string) {
  const body = {
    // Using the unified endpoint: provide model and input
    model: MODEL,
    input: { image: imageUrl },
    // Optionally: you can add "webhook" to get notified instead of polling
  };

  const res = await fetch(REPLICATE_API, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Token ${process.env.REPLICATE_API_TOKEN}`,
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Replicate create error: ${res.status} ${text}`);
  }

  return await res.json(); // contains id and status
}

async function getPrediction(predictionId: string) {
  const res = await fetch(`${REPLICATE_API}/${predictionId}`, {
    headers: {
      Authorization: `Token ${process.env.REPLICATE_API_TOKEN}`,
    },
  });
  if (!res.ok) {
    throw new Error(`Replicate get error: ${res.status}`);
  }
  return await res.json();
}

export async function POST(req: NextRequest) {
  try {
    const { imageUrl, userId } = await req.json();

    if (!imageUrl || !userId) {
      return NextResponse.json({ error: "imageUrl and userId required" }, { status: 400 });
    }

    // 1) Create prediction
    const createResp = await createReplicatePrediction(imageUrl);

    const predictionId: string = createResp.id;
    // 2) Poll until succeeded
    const maxAttempts = 30;
    let attempt = 0;
    let prediction: any = createResp;

    while (attempt < maxAttempts) {
      prediction = await getPrediction(predictionId);
      if (prediction.status === "succeeded") break;
      if (prediction.status === "failed") {
        throw new Error("Replicate prediction failed: " + JSON.stringify(prediction));
      }
      // backoff
      await new Promise((r) => setTimeout(r, 1500 + attempt * 200));
      attempt++;
    }

    if (prediction.status !== "succeeded") {
      return NextResponse.json({ error: "Prediction did not finish in time" }, { status: 504 });
    }

    // prediction.output might be an array or single url depending on model
    // For flux-kontext-apps/restore-image the output typically contains final image url(s).
    const output = prediction.output;
    // normalize:
    const restoredUrl = Array.isArray(output) ? output[0] : output;

    // 3) Save to Supabase history table
    const { data: historyRow, error: insertError } = await supabaseAdmin
      .from("history")
      .insert({
        user_id: userId,
        original_url: imageUrl,
        restored_url: restoredUrl,
        colorized_url: restoredUrl,
        meta: {
          replicate: {
            id: predictionId,
            raw: prediction,
          },
        },
      })
      .select()
      .single();

    if (insertError) {
      console.error("Failed to insert history:", insertError);
      // continue — return result anyway
    }

    return NextResponse.json({
      restoredUrl: restoredUrl,
      history: historyRow ?? null,
    });
  } catch (err: any) {
    console.error("Pipeline error:", err);
    return NextResponse.json({ error: err.message ?? String(err) }, { status: 500 });
  }
}