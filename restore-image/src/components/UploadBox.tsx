"use client";

import React, { useState } from "react";

interface UploadBoxProps {
  token?: string; // optional Bearer token from Supabase client
}

export default function UploadBox({ token }: UploadBoxProps) {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!file) return;
    setLoading(true);
    try {
      // 1. Upload to /api/upload
      const formData = new FormData();
      formData.append("file", file);

      const uploadRes = await fetch("/api/upload", {
        method: "POST",
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
        body: formData,
      });

      if (!uploadRes.ok) throw new Error("Upload failed");
      const { input_url } = await uploadRes.json();

      // 2. Send to /api/pipeline (restore + colorize)
      const pipeRes = await fetch("/api/pipeline", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ input_url }),
      });

      if (!pipeRes.ok) throw new Error("Pipeline failed");
      const data = await pipeRes.json();

      setResult(data);
    } catch (err) {
      console.error(err);
      alert("Error: " + (err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 border rounded">
      <input type="file" accept="image/*" onChange={handleFileChange} />
      <button
        onClick={handleUpload}
        disabled={!file || loading}
        className="ml-2 px-4 py-2 bg-blue-500 text-white rounded"
      >
        {loading ? "Processing..." : "Upload & Restore"}
      </button>

      {result && (
        <div className="mt-4">
          <p>Original: {result.input_url}</p>
          <p>Restored: {result.restored_url}</p>
          <p>Colorized: {result.colorized_url}</p>
          <div className="flex gap-4 mt-2">
            <img src={result.input_url} alt="input" className="w-32" />
            <img src={result.restored_url} alt="restored" className="w-32" />
            <img src={result.colorized_url} alt="colorized" className="w-32" />
          </div>
        </div>
      )}
    </div>
  );
}