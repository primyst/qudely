import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    // Get the uploaded file from the request
    const formData = await req.formData();
    const file = formData.get("file");

    if (!(file instanceof File)) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    // Prepare new FormData for the Hugging Face Space API
    const hfForm = new FormData();
    hfForm.append("data", file);

    // Send to your Hugging Face Space endpoint
    const response = await fetch("https://primyst-primyst-deoldify.hf.space/run/predict", {
      method: "POST",
      body: hfForm,
    });

    if (!response.ok) {
      const errText = await response.text();
      return NextResponse.json({ error: `HF request failed: ${errText}` }, { status: 500 });
    }

    const result = await response.json();

    return NextResponse.json(result);
  } catch (err) {
    console.error("Error restoring image:", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}