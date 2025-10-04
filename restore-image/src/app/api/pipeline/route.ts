import { NextRequest, NextResponse } from "next/server";
import { replicate, restoreAndColorize } from "@/lib/replicateClient";
import { createClient } from "@/lib/supabaseClient";

export async function POST(req: NextRequest) {
  const supabase = createClient();
  const { userId, imageUrl } = await req.json();

  if (!userId || !imageUrl) {
    return NextResponse.json({ error: "Missing parameters" }, { status: 400 });
  }

  try {
    const { restored, colorized } = await restoreAndColorize(imageUrl);

    // Save to history
    await supabase.from("history").insert({
      user_id: userId,
      original: imageUrl,
      restored,
      colorized,
    });

    return NextResponse.json({ restored, colorized });
  } catch (err: any) {
    console.error(err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}