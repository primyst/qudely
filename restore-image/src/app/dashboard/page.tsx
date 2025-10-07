"use client";

import React, { useState } from "react";
import Image from "next/image";
import axios from "axios";

export default function RestorePage() {
  const [imageUrl, setImageUrl] = useState("");
  const [restoredImage, setRestoredImage] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleRestore = async () => {
    if (!imageUrl) {
      setError("Please enter an image URL");
      return;
    }

    setError("");
    setLoading(true);
    setRestoredImage("");

    try {
      const response = await axios.post("https://qudely.onrender.com/restore", {
        imageUrl,
      });

      if (response.data.restored) {
        setRestoredImage(response.data.restored);
      } else {
        setError("No restored image returned.");
      }
    } catch (err: any) {
      console.error(err);
      setError("Failed to restore image.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-gray-100 flex flex-col items-center justify-center p-6">
      <div className="bg-white p-6 rounded-lg shadow-md w-full max-w-md">
        <h1 className="text-xl font-bold mb-4 text-center">
          🪄 Old Photo Restoration
        </h1>

        <input
          type="text"
          placeholder="Enter Image URL..."
          value={imageUrl}
          onChange={(e) => setImageUrl(e.target.value)}
          className="w-full border border-gray-300 rounded-md p-2 mb-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />

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
