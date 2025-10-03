"use client";

import React, { useState } from "react";

interface UploadBoxProps {
  token?: string;
  onUpload: (fileUrl: string) => void; // 🔥 Strong type
}

export default function UploadBox({ token, onUpload }: UploadBoxProps) {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!file) return;
    setLoading(true);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const uploadRes = await fetch("/api/upload", {
        method: "POST",
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
        body: formData,
      });

      if (!uploadRes.ok) {
        const errorText = await uploadRes.text();
        throw new Error(`Upload failed: ${errorText}`);
      }

      const { input_url }: { input_url: string } = await uploadRes.json();

      // send URL back to parent
      onUpload(input_url);
    } catch (err) {
      if (err instanceof Error) {
        alert("Error: " + err.message);
      } else {
        alert("Unknown error occurred");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 border rounded">
      <input type="file" accept="image/*" onChange={handleFileChange} />
      <button
        onClick={handleUpload}
        disabled={!file || loading}
        className="ml-2 px-4 py-2 bg-blue-500 text-white rounded"
      >
        {loading ? "Uploading..." : "Upload"}
      </button>
    </div>
  );
}