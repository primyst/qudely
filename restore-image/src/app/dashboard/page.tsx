"use client";

import React, { useState } from "react";
import axios, { AxiosResponse } from "axios";

interface RestoreResponse {
  restored: string;
}

const RestorePage = (): React.ReactElement => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [imageUrl, setImageUrl] = useState<string>("");
  const [restored, setRestored] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const file = e.target.files?.[0];
    setSelectedFile(file || null);
    setImageUrl("");
    setRestored("");
    setError("");
  };

  const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    setImageUrl(e.target.value);
    setSelectedFile(null);
    setRestored("");
    setError("");
  };

  const handleSubmit = async (): Promise<void> => {
    try {
      setLoading(true);
      setError("");
      setRestored("");

      let response: AxiosResponse<RestoreResponse>;

      if (selectedFile) {
        const formData = new FormData();
        formData.append("file", selectedFile);

        response = await axios.post<RestoreResponse>(
          "https://qudely.onrender.com/restore",
          formData,
          { headers: { "Content-Type": "multipart/form-data" } }
        );
      } else if (imageUrl) {
        response = await axios.post<RestoreResponse>(
          "https://qudely.onrender.com/restore",
          { imageUrl },
          { headers: { "Content-Type": "application/json" } }
        );
      } else {
        setError("Please upload an image or enter a URL.");
        return;
      }

      const data = response.data;
      if (data.restored) {
        setRestored(data.restored);
      } else {
        setError("No restored image received.");
      }
    } catch (err: unknown) {
      console.error(err);
      setError("Failed to restore image. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const renderImage = (src: string): React.ReactElement => {
    const isBase64 = src.startsWith("data:image");
    const altText = isBase64 ? "Restored Base64 Image" : "Restored URL Image";
    return (
      <img
        src={src}
        alt={altText}
        className="mt-4 max-w-sm rounded-lg shadow-md border"
      />
    );
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-6">
      <div className="bg-white p-6 rounded-lg shadow-md w-full max-w-md">
        <h1 className="text-2xl font-semibold mb-4 text-center">
          🪄 Old Photo Restoration
        </h1>

        <label className="block mb-2 font-medium text-gray-700">
          Upload Image:
        </label>
        <input
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className="w-full mb-4"
        />

        <div className="text-center text-gray-500 my-2">OR</div>

        <label className="block mb-2 font-medium text-gray-700">
          Image URL:
        </label>
        <input
          type="url"
          value={imageUrl}
          onChange={handleUrlChange}
          placeholder="https://example.com/photo.jpg"
          className="w-full border p-2 rounded mb-4"
        />

        <button
          onClick={handleSubmit}
          disabled={loading}
          className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition"
        >
          {loading ? "Restoring..." : "Restore Image"}
        </button>

        {error && <p className="text-red-600 text-center mt-3">{error}</p>}

        {restored && (
          <div className="flex flex-col items-center mt-6">
            <h2 className="text-lg font-semibold mb-2">Restored Image:</h2>
            {renderImage(restored)}
          </div>
        )}
      </div>
    </div>
  );
};

export default RestorePage;