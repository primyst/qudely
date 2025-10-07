"use client";

import React, { useState, ChangeEvent } from "react";
import axios from "axios";
import Image from "next/image";

interface RestoreResponse {
  restored: string;
  error?: string;
}

export default function RestorePage() {
  const [file, setFile] = useState<File | null>(null);
  const [imageUrl, setImageUrl] = useState<string>("");
  const [restored, setRestored] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>): void => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setImageUrl("");
    }
  };

  const handleUrlChange = (e: ChangeEvent<HTMLInputElement>): void => {
    setImageUrl(e.target.value);
    setFile(null);
  };

  const handleRestore = async (): Promise<void> => {
    try {
      setLoading(true);
      setError("");
      setRestored("");

      let response;

      if (file) {
        const formData = new FormData();
        formData.append("file", file);

        response = await axios.post<RestoreResponse>(
          "https://qudely.onrender.com/restore",
          formData,
          {
            headers: { "Content-Type": "multipart/form-data" },
          }
        );
      } else if (imageUrl.trim() !== "") {
        response = await axios.post<RestoreResponse>(
          "https://qudely.onrender.com/restore",
          { imageUrl },
          { headers: { "Content-Type": "application/json" } }
        );
      } else {
        setError("Please upload an image or enter an image URL.");
        setLoading(false);
        return;
      }

      if (response.data.error) {
        throw new Error(response.data.error);
      }

      setRestored(response.data.restored);
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        setError(err.response?.data?.error ?? err.message);
      } else if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Unknown error occurred.");
      }
    } finally {
      setLoading(false);
    }
  };

  const renderImage = (src: string): JSX.Element => {
    const isBase64 = !src.startsWith("http");
    const imageSrc = isBase64 ? `data:image/png;base64,${src}` : src;

    return (
      <div className="mt-4">
        <h3 className="text-lg font-semibold mb-2">Restored Image:</h3>
        <Image
          src={imageSrc}
          alt="Restored"
          width={400}
          height={400}
          className="rounded-lg border"
        />
      </div>
    );
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6">
      <h1 className="text-3xl font-bold mb-6 text-center">
        🪄 Old Photo Restoration
      </h1>

      <div className="bg-white p-6 rounded-xl shadow-md w-full max-w-md space-y-4">
        <input
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className="w-full border p-2 rounded"
        />

        <div className="text-center text-gray-500">or</div>

        <input
          type="text"
          placeholder="Enter image URL"
          value={imageUrl}
          onChange={handleUrlChange}
          className="w-full border p-2 rounded"
        />

        <button
          onClick={handleRestore}
          disabled={loading}
          className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition"
        >
          {loading ? "Restoring..." : "Restore Photo"}
        </button>

        {error && <p className="text-red-600 mt-2 text-center">{error}</p>}

        {restored && renderImage(restored)}
      </div>
    </div>
  );
}