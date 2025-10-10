"use client";

import { useState } from "react";

export default function HomePage() {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [restored, setRestored] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0] ?? null;
    setFile(selected);
    setRestored(null);
    if (selected) {
      setPreview(URL.createObjectURL(selected));
    } else {
      setPreview(null);
    }
  };

  const handleRestore = async () => {
    if (!file) return;
    setLoading(true);
    setRestored(null);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/restore", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const text = await res.text();
        console.error("Restore failed:", res.status, text);
        alert("Restore failed. Check console for details.");
        return;
      }

      const json = await res.json();
      const output = json?.data?.[0];

      if (output && typeof output === "string") {
        setRestored(output); // should be "data:image/png;base64,...."
      } else {
        console.error("Unexpected response:", json);
        alert("Unexpected response from server. Check console.");
      }
    } catch (err) {
      console.error("Network or server error:", err);
      alert("Network error while restoring.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="w-full max-w-xl bg-white p-6 rounded-xl shadow">
        <h1 className="text-2xl font-semibold mb-4">AI Image Restoration</h1>

        <input
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className="mb-4 w-full"
        />

        {preview && (
          <div className="mb-4">
            <div className="text-sm text-gray-600 mb-2">Preview</div>
            <img src={preview} alt="preview" className="w-full rounded" />
          </div>
        )}

        <button
          onClick={handleRestore}
          disabled={!file || loading}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded disabled:opacity-60"
        >
          {loading ? "Restoring..." : "Restore Image"}
        </button>

        {restored && (
          <div className="mt-6">
            <h2 className="text-lg font-medium mb-2">Restored Image</h2>
            <img src={restored} alt="restored" className="w-full rounded shadow" />
          </div>
        )}
      </div>
    </div>
  );
}