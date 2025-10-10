import { NextRequest, NextResponse } from "next/server";

const HF_SPACE_PREDICT = "https://primyst-primyst-deoldify.hf.space/run/predict";

// Helper to return JSON with status
function jsonBody(data: any, status = 200) {
  return NextResponse.json(data, { status });
}

export async function POST(req: NextRequest) {
  try {
    // Get file from incoming multipart/form-data
    const formData = await req.formData();
    const file = formData.get("file");

    if (!(file instanceof File)) {
      return jsonBody({ error: "No file provided" }, 400);
    }

    // Convert file to base64 string
    const arrayBuffer = await file.arrayBuffer();
    // Buffer is available in Node runtime on Vercel; Next supports Buffer.
    const buffer = Buffer.from(arrayBuffer);
    const base64 = `data:${file.type};base64,${buffer.toString("base64")}`;

    // Build payload Gradio expects
    const payload = { data: [base64] };

    // Read HF token from env — set this on Vercel / host
    const HF_TOKEN = process.env.HF_TOKEN;
    if (!HF_TOKEN) {
      console.error("HF_TOKEN not set in environment");
      return jsonBody({ error: "Server misconfigured" }, 500);
    }

    // Call the private Hugging Face Space predict endpoint with Authorization
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
      // Forward HF error message
      return jsonBody({ error: "HF error", details: text }, 502);
    }

    // HF returns JSON like { data: ["data:image/png;base64,..."] }
    const result = JSON.parse(text);
    return jsonBody(result);
  } catch (err) {
    console.error("Restore route error:", err);
    return jsonBody({ error: "Internal Server Error" }, 500);
  }
}