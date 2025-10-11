import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { imageUrl } = await req.json();

    if (!imageUrl) {
      return NextResponse.json({ error: "No image URL provided" }, { status: 400 });
    }

    const apiKey = process.env.DEEPAI_API_KEY;
    if (!apiKey) {
      console.error("❌ Missing DeepAI API key");
      return NextResponse.json({ error: "Server misconfiguration" }, { status: 500 });
    }

    console.log("🎨 Starting DeepAI colorization for:", imageUrl);

    const colorizedResponse = await fetch("https://api.deepai.org/api/colorizer", {
      method: "POST",
      headers: { "Api-Key": apiKey },
      body: new URLSearchParams({ image: imageUrl }),
    });

    const colorizedData = await colorizedResponse.json();

    console.log("🟢 DeepAI Status:", colorizedResponse.status);
    console.log("🟢 DeepAI Response:", colorizedData);

    if (!colorizedResponse.ok) {
      return NextResponse.json(
        { error: `DeepAI request failed: ${colorizedData.error || "Unknown error"}` },
        { status: colorizedResponse.status }
      );
    }

    if (!colorizedData.output_url) {
      return NextResponse.json(
        { error: "No colorized image returned from DeepAI" },
        { status: 500 }
      );
    }

    return NextResponse.json({ restoredUrl: colorizedData.output_url }, { status: 200 });
  } catch (error) {
    console.error("🔥 Error in /api/restore route:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}