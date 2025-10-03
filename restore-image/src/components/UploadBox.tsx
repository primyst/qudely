"use client";

import { useRef } from "react";
import { useSupabaseClient } from "@supabase/auth-helpers-react";

interface UploadBoxProps {
  onUpload: (input_url: string) => void;
}

export default function UploadBox({ onUpload }: UploadBoxProps) {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const supabase = useSupabaseClient();

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const formData = new FormData();
      formData.append("file", file);

      // get session token to forward to server
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;

      const headers: Record<string, string> = {};
      if (token) headers["Authorization"] = `Bearer ${token}`;

      const res = await fetch("/api/upload", {
        method: "POST",
        headers,
        body: formData,
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: res.statusText }));
        throw new Error(err?.error || `Upload failed: ${res.status}`);
      }

      const data = await res.json();
      if (data.input_url) {
        onUpload(data.input_url); // backend canonical URL
      } else {
        throw new Error("No input_url returned from upload API");
      }
    } catch (err) {
      console.error("Upload error:", err);
      alert("Upload failed. Please try again.");
    } finally {
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  return (
    <div className="border-2 border-dashed border-gray-400 p-6 rounded-lg text-center">
      <input
        type="file"
        accept="image/*"
        ref={fileInputRef}
        onChange={handleFileChange}
        className="hidden"
        id="file-upload"
      />
      <label
        htmlFor="file-upload"
        className="cursor-pointer text-blue-600 hover:underline"
      >
        Click to upload an image
      </label>
    </div>
  );
}