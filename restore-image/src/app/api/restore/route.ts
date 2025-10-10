import { NextRequest, NextResponse } from "next/server";

const HF_SPACE_PREDICT = "https://primyst-primyst-deoldify.hf.space/run/predict";

// Define structured response types
interface HFSuccessResponse {
  data: string[];
}

interface HFErrorResponse {
  error: string;
  details?: string;
}

// Helper to return JSON safely
function jsonBody<T extends Record<string, unknown>>(data: T, status = 200): NextResponse<T> {
  return NextResponse.json(data, { status });
}

export async function POST(req: NextRequest): Promise<NextResponse<HFSuccessResponse | HFErrorResponse>> {
  try {
    // Extract file from incoming multipart/form-data
    const formData = await req.formData();
    const file = formData.get("file");

    if (!(file instanceof File)) {
      return jsonBody({ error: "No file provided" }, 400);
    }

    // Convert file to base64
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const base64 = `data:${file.type};base64,${buffer.toString("base64")}`;

    // Gradio expects { data: [base64String] }
    const payload = { data: [base64] };

    // Load token from environment variable
    const HF_TOKEN = process.env.HF_TOKEN;
    if (!HF_TOKEN) {
      console.error("HF_TOKEN not set in environment");
      return jsonBody({ error: "Server misconfigured" }, 500);
    }

    // Send to Hugging Face Space endpoint
    const hfRes = await fetch(HF_SPACE_PREDICT, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${HF_TOKEN}`,
      },
      body: JSON.stringify(payload),
    });

    const text = await hfRes.text();

    if (!hfRes.ok) {
      console.error("HF responded with error:", hfRes.status, text);
      return jsonBody({ error: "HF error", details: text }, 502);
    }

    const result = JSON.parse(text) as HFSuccessResponse;
    if (!result.data || !Array.isArray(result.data)) {
      return jsonBody({ error: "Unexpected response format from Hugging Face" }, 500);
    }

    return jsonBody(result);
  } catch (err: unknown) {
    console.error("Restore route error:", err);
    return jsonBody({ error: "Internal Server Error" }, 500);
  }
}