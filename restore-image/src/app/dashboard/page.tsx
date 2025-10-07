"use client";

import React, { useState } from "react";
import Image from "next/image";
import axios, { AxiosResponse } from "axios";

interface RestoreResponse {
  restored?: string;
  error?: string;
}

export default function RestorePage() {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string>("");
  const [restoredImage, setRestoredImage] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      setPreview(URL.createObjectURL(selectedFile));
      setRestoredImage("");
      setError("");
    }
  };

  const handleRestore = async (): Promise<void> => {
    if (!file) {
      setError("Please upload an image file");
      return;
    }

    setLoading(true);
    setError("");
    setRestoredImage("");

    try {
      const formData = new FormData();
      formData.append("file", file);

      const response: AxiosResponse<RestoreResponse> = await axios.post(
        "https://qudely.onrender.com/restore",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      if (response.data.restored) {
        setRestoredImage(response.data.restored);
      } else {
        setError(response.data.error || "Failed to restore image.");
      }
    } catch (err) {
      console.error(err);
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-gray-100 flex flex-col items-center justify-center p-6">
      <div className="bg-white p-6 rounded-lg shadow-md w-full max-w-md">
        <h1 className="text-xl font-bold mb-4 text-center">
          🪄 Qudely Photo Restoration
        </h1>

        <input
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className="w-full mb-4"
        />

        {preview && (
          <div className="mb-4">
            <h2 className="font-semibold mb-2 text-center">Preview</h2>
            <div className="relative w-full h-64">
              <Image
                src={preview}
                alt="Uploaded Preview"
                fill
                className="object-contain rounded-md border"
              />
            </div>
          </div>
        )}

        <button
          onClick={handleRestore}
          disabled={loading}
          className="w-full bg-blue-600 text-white rounded-md p-2 hover:bg-blue-700 transition disabled:bg-gray-400"
        >
          {loading ? "Restoring..." : "Restore Image"}
        </button>

        {error && <p className="text-red-500 mt-3 text-center">{error}</p>}

        {restoredImage && (
          <div className="mt-6 text-center">
            <h2 className="font-semibold mb-2">Restored Image</h2>
            <div className="relative w-full h-64">
              <Image
                src={restoredImage}
                alt="Restored"
                fill
                className="object-contain rounded-md border"
              />
            </div>
          </div>
        )}
      </div>
    </main>
  );
}