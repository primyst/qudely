import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

const REPLICATE_API = "https://api.replicate.com/v1/predictions";
const MODEL = "flux-kontext-apps/restore-image";

interface PredictionInput {
  image: string;
}

interface ReplicatePrediction {
  id: string;
  status: "starting" | "processing" | "succeeded" | "failed" | "canceled";
  output?: string | string[];
  error?: string | null;
}

interface ProcessRequestBody {
  imageUrl: string;
  userId: string;
}

async function createReplicatePrediction(imageUrl: string): Promise<ReplicatePrediction> {
  const body = {
    model: MODEL,
    input: { image: imageUrl } satisfies PredictionInput,
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

  return (await res.json()) as ReplicatePrediction;
}

async function getPrediction(predictionId: string): Promise<ReplicatePrediction> {
  const res = await fetch(`${REPLICATE_API}/${predictionId}`, {
    headers: {
      Authorization: `Token ${process.env.REPLICATE_API_TOKEN}`,
    },
  });

  if (!res.ok) throw new Error(`Replicate get error: ${res.status}`);

  return (await res.json()) as ReplicatePrediction;
}

export async function POST(req: NextRequest) {
  try {
    const { imageUrl, userId } = (await req.json()) as ProcessRequestBody;

    if (!imageUrl || !userId) {
      return NextResponse.json({ error: "imageUrl and userId required" }, { status: 400 });
    }

    // 1️⃣ Create prediction
    const createResp = await createReplicatePrediction(imageUrl);

    const predictionId = createResp.id;
    const maxAttempts = 30;
    let attempt = 0;
    let prediction: ReplicatePrediction = createResp;

    // 2️⃣ Poll until succeeded
    while (attempt < maxAttempts) {
      prediction = await getPrediction(predictionId);
      if (prediction.status === "succeeded" || prediction.status === "failed") break;
      await new Promise((r) => setTimeout(r, 1500 + attempt * 200));
      attempt++;
    }

    if (prediction.status !== "succeeded" || !prediction.output) {
      throw new Error(prediction.error || "Prediction failed or timed out");
    }

    const output = Array.isArray(prediction.output)
      ? prediction.output[0]
      : prediction.output;

    // 3️⃣ Save to history table
    const { data: historyRow, error: insertError } = await supabaseAdmin
      .from("history")
      .insert({
        user_id: userId,
        original_url: imageUrl,
        restored_url: output,
        colorized_url: output,
        meta: { replicate: { id: predictionId, raw: prediction } },
      })
      .select()
      .single();

    if (insertError) console.error("Insert history error:", insertError);

    return NextResponse.json({ restoredUrl: output, history: historyRow ?? null });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("Pipeline error:", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}