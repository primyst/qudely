"use client";

import { useState } from "react";

export default function DeOldifyPage() {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [result, setResult] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0] || null;
    setFile(selected);
    if (selected) {
      setPreview(URL.createObjectURL(selected));
    }
  };

  const handleRestore = async () => {
    if (!file) return;
    setLoading(true);
    const formData = new FormData();
    formData.append("data", file);

    try {
      const response = await fetch("https://primyst-primyst-deoldify.hf.space/run/predict", {
        method: "POST",
        body: formData,
      });

      const resultJson = await response.json();
      const output = resultJson.data?.[0];
      if (output) setResult(output);
    } catch (err) {
      console.error("Error:", err);
      alert("Failed to restore image. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center p-4">
      <h1 className="text-2xl font-semibold mb-4">AI Image Restoration (DeOldify)</h1>

      <input
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="mb-4"
      />

      {preview && (
        <img
          src={preview}
          alt="preview"
          className="w-64 h-auto mb-4 rounded shadow-md"
        />
      )}

      <button
        onClick={handleRestore}
        disabled={!file || loading}
        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:bg-gray-400"
      >
        {loading ? "Restoring..." : "Restore Image"}
      </button>

      {result && (
        <div className="mt-6">
          <h2 className="text-lg font-medium mb-2">Restored Image:</h2>
          <img
            src={result}
            alt="restored"
            className="w-64 h-auto rounded shadow-lg"
          />
        </div>
      )}
    </div>
  );
}