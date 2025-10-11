import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { imageUrl } = await req.json();

    if (!imageUrl) {
      return NextResponse.json({ error: "Image URL is required" }, { status: 400 });
    }

    const apiKey = process.env.DEEPAI_API_KEY;

    // ---- DEBUG: verify API key presence without printing the key itself ----
    console.log("DEEPAI_API_KEY exists:", !!apiKey);
    console.log("DEEPAI_API_KEY length:", apiKey?.length ?? 0);

    if (!apiKey) {
      return NextResponse.json({ error: "Missing DeepAI API key" }, { status: 500 });
    }

    // Helper to call DeepAI endpoints with form-encoded body
    async function callDeepAI(endpoint: string, image: string) {
      const body = new URLSearchParams({ image });
      const res = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Api-Key": apiKey,
        },
        body,
      });

      // Try parse JSON safely
      let parsed;
      try {
        parsed = await res.json();
      } catch (parseErr) {
        console.error(`Failed to parse JSON from ${endpoint}`, parseErr);
        parsed = null;
      }

      return { ok: res.ok, status: res.status, body: parsed };
    }

    // 1) Colorize
    const colorize = await callDeepAI("https://api.deepai.org/api/colorizer", imageUrl);

    if (!colorize.ok || !colorize.body?.output_url) {
      console.error("Colorization failed:", {
        status: colorize.status,
        body: colorize.body,
      });
      return NextResponse.json(
        {
          error: "Colorization failed",
          details: colorize.body ?? `status:${colorize.status}`,
        },
        { status: 500 }
      );
    }

    const colorizedUrl: string = colorize.body.output_url;

    // 2) Super-resolution (optional)
    const sr = await callDeepAI("https://api.deepai.org/api/torch-srgan", colorizedUrl);

    if (!sr.ok) {
      // if SR failed, still return colorized result but include SR error details
      console.warn("Super-resolution failed — returning colorized image instead:", {
        status: sr.status,
        body: sr.body,
      });

      return NextResponse.json({
        success: true,
        restoredImage: colorizedUrl,
        warning: "Super-resolution failed; returned colorized image instead.",
        srDetails: sr.body ?? `status:${sr.status}`,
      });
    }

    const restoredUrl: string = sr.body?.output_url || colorizedUrl;

    return NextResponse.json({
      success: true,
      restoredImage: restoredUrl,
    });
  } catch (err) {
    console.error("Internal error in /api/restore:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}