"use client";

import React, { useState, ChangeEvent } from "react";
import axios, { AxiosResponse } from "axios";

interface RestoreResponse {
  restored?: string;
  error?: string;
}

export default function RestorePage(): React.ReactElement {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [restoredImage, setRestoredImage] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>): void => {
    const f = e.target.files?.[0] ?? null;
    setFile(f);
    setPreview(f ? URL.createObjectURL(f) : null);
    setRestoredImage(null);
    setError("");
  };

  const handleRestore = async (): Promise<void> => {
    if (!file) {
      setError("Please upload a file first.");
      return;
    }
    setLoading(true);
    setError("");
    setRestoredImage(null);

    const form = new FormData();
    form.append("file", file); // backend expects "file"

    try {
      const res: AxiosResponse<RestoreResponse> = await axios.post(
        "https://qudely.onrender.com/restore",
        form,
        { headers: { "Content-Type": "multipart/form-data" } }
      );

      if (res.data.error) {
        setError(res.data.error);
      } else if (res.data.restored) {
        setRestoredImage(res.data.restored);
      } else {
        setError("Unexpected response from server");
      }
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        setError(err.response?.data?.error ?? err.message);
      } else if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Unknown error");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-2xl bg-white p-6 rounded shadow">
        <h1 className="text-2xl font-bold mb-4">Qudely — Restore & Colorize</h1>

        <input type="file" accept="image/*" onChange={handleFileChange} />

        {preview && (
          <div className="mt-4">
            <h3 className="font-medium">Original</h3>
            <img src={preview} alt="original" className="max-w-full rounded border mt-2" />
          </div>
        )}

        <div className="mt-4 flex gap-3">
          <button
            onClick={handleRestore}
            disabled={!file || loading}
            className="px-4 py-2 bg-blue-600 text-white rounded disabled:opacity-60"
          >
            {loading ? "Restoring..." : "Restore"}
          </button>
        </div>

        {error && <p className="mt-3 text-red-600">{error}</p>}

        {restoredImage && (
          <div className="mt-6">
            <h3 className="font-medium">Restored / Colorized</h3>
            <img src={restoredImage} alt="restored" className="max-w-full rounded border mt-2" />
          </div>
        )}
      </div>
    </div>
  );
}