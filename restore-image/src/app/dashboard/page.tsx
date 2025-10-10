"use client";

import { useState } from "react";

export default function HomePage() {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [restored, setRestored] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Handle file input
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0] || null;
    setFile(selected);
    setRestored(null);

    if (selected) {
      const objectUrl = URL.createObjectURL(selected);
      setPreview(objectUrl);
    } else {
      setPreview(null);
    }
  };

  // Handle image restoration
  const handleRestore = async () => {
    if (!file) return;
    setLoading(true);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("/api/restore", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`Request failed: ${response.status}`);
      }

      const result = await response.json();
      const output = result?.data?.[0];

      if (output) {
        setRestored(output);
      } else {
        alert("No restored image returned. Please try again.");
      }
    } catch (error) {
      console.error("Error restoring image:", error);
      alert("Something went wrong while restoring the image.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center p-4">
      <h1 className="text-2xl font-semibold mb-6 text-center">
        AI Image Restoration (DeOldify)
      </h1>

      <div className="w-full max-w-md bg-white p-6 rounded-xl shadow">
        <input
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className="mb-4 w-full border border-gray-300 rounded p-2"
        />

        {preview && (
          <div className="mb-4 flex justify-center">
            <img
              src={preview}
              alt="Grayscale preview"
              className="max-w-full rounded-lg shadow-md"
            />
          </div>
        )}

        <button
          onClick={handleRestore}
          disabled={!file || loading}
          className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 disabled:bg-gray-400 transition"
        >
          {loading ? "Restoring..." : "Restore Image"}
        </button>

        {restored && (
          <div className="mt-6 text-center">
            <h2 className="text-lg font-medium mb-2">Restored Image:</h2>
            <img
              src={restored}
              alt="Restored result"
              className="max-w-full rounded-lg shadow-lg"
            />
          </div>
        )}
      </div>
    </div>
  );
}