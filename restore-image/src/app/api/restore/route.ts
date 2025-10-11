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

    // 🧠 STEP 1: COLORIZE the image
    const colorizedResponse = await fetch("https://api.deepai.org/api/colorizer", {
      method: "POST",
      headers: {
        "Api-Key": apiKey,
      },
      body: new URLSearchParams({ image: imageUrl }),
    });

    const colorizedData = await colorizedResponse.json();

    console.log("Colorization status:", colorizedResponse.status);
    console.log("Colorization response:", colorizedData);

    if (!colorizedResponse.ok || !colorizedData.output_url) {
      return NextResponse.json(
        { error: colorizedData.error || "Colorization failed" },
        { status: 500 }
      );
    }

    // 🧠 STEP 2: Enhance using Super Resolution (optional)
    const enhancedResponse = await fetch("https://api.deepai.org/api/torch-srgan", {
      method: "POST",
      headers: {
        "Api-Key": apiKey,
      },
      body: new URLSearchParams({ image: colorizedData.output_url }),
    });

    const enhancedData = await enhancedResponse.json();

    console.log("Enhancement status:", enhancedResponse.status);
    console.log("Enhancement response:", enhancedData);

    if (!enhancedResponse.ok) {
      return NextResponse.json(
        { error: enhancedData.error || "Enhancement failed" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      restoredImage: enhancedData.output_url || colorizedData.output_url,
    });
  } catch (error) {
    console.error("Error restoring image:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}