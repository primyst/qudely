"use client";

import React, { useState, ChangeEvent } from "react";
import axios from "axios";
import Image from "next/image";
import { Loader2, Upload, RefreshCw } from "lucide-react";

export default function RestorePage() {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [restoredImage, setRestoredImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      setPreview(URL.createObjectURL(selectedFile));
      setRestoredImage(null);
    }
  };

  const handleRestore = async () => {
    if (!file) return alert("Please upload an image first!");

    const formData = new FormData();
    formData.append("image", file);

    setLoading(true);
    try {
      const res = await axios.post(
        "https://qudely.onrender.com/restore",
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      );

      const base64 = res.data.image as string;
      setRestoredImage(`data:image/png;base64,${base64}`);
    } catch (err) {
      console.error(err);
      alert("Something went wrong restoring the image.");
    } finally {
      setLoading(false);
    }
  };

  const renderImage = (src: string): React.ReactElement => (
    <div className="relative w-full h-64 sm:h-80 md:h-96 rounded-xl overflow-hidden shadow-lg border border-gray-200 bg-gray-50">
      <Image
        src={src}
        alt="Preview"
        fill
        className="object-contain p-2"
        sizes="(max-width: 768px) 100vw, 50vw"
      />
    </div>
  );

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-50 to-white p-6">
      <h1 className="text-2xl sm:text-3xl font-semibold text-blue-700 mb-6">
        🦷 AI Image Restoration
      </h1>

      <div className="flex flex-col items-center gap-4">
        <label className="cursor-pointer flex flex-col items-center justify-center w-60 h-36 border-2 border-dashed border-blue-400 rounded-lg bg-blue-50 hover:bg-blue-100 transition">
          <Upload className="w-8 h-8 text-blue-500 mb-2" />
          <span className="text-sm text-blue-600 font-medium">
            Click to upload
          </span>
          <input type="file" accept="image/*" hidden onChange={handleFileChange} />
        </label>

        {preview && (
          <div className="flex flex-col md:flex-row items-center gap-6 mt-4">
            <div>
              <h2 className="text-sm font-medium text-gray-600 mb-2">Original</h2>
              {renderImage(preview)}
            </div>

            {loading ? (
              <div className="flex flex-col items-center justify-center text-blue-600">
                <Loader2 className="w-8 h-8 animate-spin" />
                <p className="text-sm mt-2">Restoring...</p>
              </div>
            ) : restoredImage ? (
              <div>
                <h2 className="text-sm font-medium text-gray-600 mb-2">Restored</h2>
                {renderImage(restoredImage)}
              </div>
            ) : null}
          </div>
        )}

        <button
          onClick={handleRestore}
          disabled={!file || loading}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 mt-6 rounded-md font-medium shadow-md disabled:opacity-50 transition"
        >
          <RefreshCw className="w-5 h-5" />
          {loading ? "Restoring..." : "Restore Image"}
        </button>
      </div>
    </div>
  );
}