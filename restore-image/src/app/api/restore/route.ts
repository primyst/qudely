import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { imageUrl } = await req.json();

    if (!imageUrl) {
      return NextResponse.json({ error: "Image URL is required" }, { status: 400 });
    }

    const apiKey = process.env.DEEPAI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: "Missing DeepAI API key" }, { status: 500 });
    }

    // 1️⃣ Colorize the image
    const colorizedResponse = await fetch("https://api.deepai.org/api/colorizer", {
      method: "POST",
      headers: {
        "Api-Key": apiKey,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ image: imageUrl }),
    });

    const colorizedData = await colorizedResponse.json();

    if (!colorizedData.output_url) {
      return NextResponse.json({ error: "Colorization failed" }, { status: 500 });
    }

    // 2️⃣ Optionally enhance (super resolution)
    const enhancedResponse = await fetch("https://api.deepai.org/api/torch-srgan", {
      method: "POST",
      headers: {
        "Api-Key": apiKey,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ image: colorizedData.output_url }),
    });

    const enhancedData = await enhancedResponse.json();

    return NextResponse.json({
      success: true,
      restoredImage: enhancedData.output_url || colorizedData.output_url,
    });
  } catch (error) {
    console.error("Error restoring image:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}