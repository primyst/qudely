"use client";

import { useState } from "react";

export default function HomePage() {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [restored, setRestored] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0] ?? null;
    setFile(selectedFile);
    setRestored(null);
    setError(null);

    if (selectedFile) {
      const reader = new FileReader();
      reader.onload = () => setPreview(reader.result as string);
      reader.readAsDataURL(selectedFile);
    } else {
      setPreview(null);
    }
  };

  interface RestoreResponse {
    restored?: string;
    error?: string;
  }

  const handleUpload = async () => {
    if (!file) return;
    setLoading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("https://qudely.onrender.com/restore", {
        method: "POST",
        body: formData,
      });

      const data: RestoreResponse = await res.json();

      if (!res.ok) {
        setError(data.error ?? "Failed to restore image");
      } else {
        setRestored(data.restored ?? null);
      }
    } catch (err) {
      if (err instanceof Error) {
        setError("Server error: " + err.message);
      } else {
        setError("Unknown server error");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 p-6">
      <h1 className="text-3xl font-bold mb-6">Old Photo Restorer</h1>

      <input
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="mb-4"
      />

      {preview && (
        <div className="mb-4">
          <p className="font-semibold mb-2">Original:</p>
          <img
            src={preview}
            alt="preview"
            className="max-w-xs rounded-md shadow"
          />
        </div>
      )}

      <button
        onClick={handleUpload}
        className="px-6 py-2 bg-blue-600 text-white rounded-md shadow hover:bg-blue-700 disabled:bg-gray-400"
        disabled={!file || loading}
      >
        {loading ? "Restoring..." : "Restore & Colorize"}
      </button>

      {error && <p className="text-red-500 mt-4">{error}</p>}

      {restored && (
        <div className="mt-6">
          <p className="font-semibold mb-2">Restored:</p>
          <img
            src={restored}
            alt="restored"
            className="max-w-xs rounded-md shadow"
          />
        </div>
      )}
    </div>
  );
}