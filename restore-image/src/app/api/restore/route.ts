import { NextRequest, NextResponse } from "next/server";

const HF_SPACE_PREDICT = "https://primyst-primyst-deoldify.hf.space/run/predict";

interface HFSuccessResponse {
  data: string[];
}

interface HFErrorResponse {
  error: string;
  details?: string;
}

// ✅ Helper: strongly typed JSON response (no `any`, no generic issues)
function jsonBody(data: HFSuccessResponse | HFErrorResponse, status = 200) {
  return new NextResponse(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

export async function POST(req: NextRequest) {
  try {
    // Get form data
    const formData = await req.formData();
    const file = formData.get("file");

    if (!(file instanceof File)) {
      return jsonBody({ error: "No file provided" }, 400);
    }

    // Convert file to Base64
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const base64 = `data:${file.type};base64,${buffer.toString("base64")}`;

    // Prepare payload for Gradio
    const payload = { data: [base64] };

    // Get Hugging Face token securely
    const HF_TOKEN = process.env.HF_TOKEN;
    if (!HF_TOKEN) {
      console.error("❌ HF_TOKEN missing in environment");
      return jsonBody({ error: "Server misconfigured" }, 500);
    }

    // Call Hugging Face private Space
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
      console.error("HF error:", hfRes.status, text);
      return jsonBody({ error: "HF error", details: text }, 502);
    }

    const result = JSON.parse(text) as HFSuccessResponse;

    // Validate HF response shape
    if (!Array.isArray(result.data) || typeof result.data[0] !== "string") {
      return jsonBody({ error: "Invalid response from Hugging Face" }, 500);
    }

    return jsonBody(result);
  } catch (err) {
    console.error("Server error:", err);
    return jsonBody({ error: "Internal Server Error" }, 500);
  }
}