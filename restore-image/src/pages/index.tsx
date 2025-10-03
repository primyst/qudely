"use client";

import { useState } from "react";
import UploadBox from "@/components/UploadBox";
import BeforeAfterSlider from "@/components/BeforeAfterSlider";
import { useSupabaseClient } from "@supabase/auth-helpers-react";

interface PipelineResult {
  input_url: string;
  restored_url: string;
  colorized_url: string;
}

export default function Home() {
  const [status, setStatus] = useState<string | null>(null);
  const [uploadedUrl, setUploadedUrl] = useState<string | null>(null);
  const [restoredUrl, setRestoredUrl] = useState<string | null>(null);
  const [colorizedUrl, setColorizedUrl] = useState<string | null>(null);

  const supabase = useSupabaseClient();

  const handleUpload = async (fileUrl: string) => {
    setStatus("Processing (restore + colorize)...");

    try {
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;

      const headers: Record<string, string> = { "Content-Type": "application/json" };
      if (token) headers["Authorization"] = `Bearer ${token}`;

      const pipelineRes = await fetch("/api/restore-and-colorize", {
        method: "POST",
        headers,
        body: JSON.stringify({ input_url: fileUrl }),
      });

      if (!pipelineRes.ok) {
        const err = await pipelineRes.json().catch(() => ({ error: pipelineRes.statusText }));
        throw new Error(err?.error || `Pipeline failed: ${pipelineRes.status}`);
      }

      const data: PipelineResult = await pipelineRes.json();

      setUploadedUrl(data.input_url);
      setRestoredUrl(data.restored_url);
      setColorizedUrl(data.colorized_url);

      setStatus("Done");
    } catch (err) {
      if (err instanceof Error) {
        setStatus(`Error: ${err.message}`);
      } else {
        setStatus("Unknown error");
      }
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Photo Restoration & Colorization</h1>

      {/* 🔥 UploadBox now cleanly returns fileUrl */}
      <UploadBox token={undefined} onUpload={handleUpload} />

      {status && <p className="mb-4">Status: {status}</p>}

      {restoredUrl && colorizedUrl && (
        <BeforeAfterSlider before={restoredUrl} after={colorizedUrl} />
      )}
    </div>
  );
}