"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";
import toast, { Toaster } from "react-hot-toast";

interface UploadResponse {
  url: string;
}

export default function DashboardPage() {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [restored, setRestored] = useState<string | null>(null);
  const [trialCount, setTrialCount] = useState<number | null>(null);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // ✅ Fetch user & trial info from Supabase
  const fetchTrialCount = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      toast.error("Please log in first.");
      return;
    }

    setUserEmail(user.email ?? null);

    const { data, error } = await supabase
      .from("profiles")
      .select("trial_count")
      .eq("id", user.id)
      .single();

    if (error) {
      console.error(error);
      toast.error("Failed to load trial info.");
    } else {
      setTrialCount(data.trial_count);
    }
  };

  useEffect(() => {
    fetchTrialCount();
  }, []);

  // ✅ Handle file selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (selected) {
      setFile(selected);
      setPreview(URL.createObjectURL(selected));
    }
  };

  // ✅ Handle image restoration
  const handleRestore = async () => {
    if (!file) {
      toast.error("Please select an image first.");
      return;
    }

    if (trialCount !== null && trialCount <= 0) {
      toast.error("You’ve used all your free trials.");
      return;
    }

    setLoading(true);

    try {
      // 1️⃣ Upload image to Supabase storage
      const formData = new FormData();
      formData.append("file", file);

      const uploadResponse = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const uploadData: UploadResponse = await uploadResponse.json();
      if (!uploadResponse.ok || !uploadData.url) {
        throw new Error("Image upload failed.");
      }

      // 2️⃣ Send to DeepAI restoration API
      const restoreResponse = await fetch("/api/restore", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imageUrl: uploadData.url }),
      });

      const restoreData = await restoreResponse.json();
      if (!restoreResponse.ok) {
        throw new Error(restoreData.error || "Restoration failed.");
      }

      // 3️⃣ Update trial count in Supabase
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        const { error: updateError } = await supabase
          .from("profiles")
          .update({ trial_count: (trialCount ?? 1) - 1 })
          .eq("id", user.id);

        if (updateError) {
          console.error(updateError);
        } else {
          setTrialCount((prev) => (prev !== null ? prev - 1 : 0));
        }
      }

      // 4️⃣ Show restored image
      setRestored(restoreData.restoredImage);
      toast.success("Photo restored successfully!");
    } catch (err) {
      console.error(err);
      toast.error((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-r from-green-100 to-green-200 flex flex-col items-center justify-center p-4">
      <Toaster position="top-right" />
      <div className="bg-white p-8 rounded-2xl shadow-xl w-[90%] max-w-md text-center">
        <h1 className="text-3xl font-extrabold text-green-700">
          Qudely Photo Restorer
        </h1>
        <p className="text-gray-500 mt-2">
          Welcome{userEmail ? `, ${userEmail}` : ""} 👋
        </p>

        {trialCount !== null ? (
          <p className="mt-4 text-gray-700">
            🧩 You have{" "}
            <span className="font-bold text-green-600">{trialCount}</span>{" "}
            free trial{trialCount !== 1 && "s"} remaining.
          </p>
        ) : (
          <p className="mt-4 text-gray-500">Loading your trial info...</p>
        )}

        {/* Upload & preview */}
        <div className="mt-6">
          <input
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="block mx-auto"
          />
          {preview && (
            <img
              src={preview}
              alt="Preview"
              className="max-w-xs rounded-md mt-4 mx-auto shadow"
            />
          )}
        </div>

        <button
          onClick={handleRestore}
          disabled={loading}
          className={`mt-6 w-full py-3 rounded-md text-white font-semibold ${
            loading ? "bg-gray-400" : "bg-green-600 hover:bg-green-700"
          }`}
        >
          {loading ? "Restoring..." : "Restore Photo"}
        </button>

        {restored && (
          <div className="mt-6">
            <h2 className="text-lg font-semibold text-gray-700 mb-2">
              Restored Image
            </h2>
            <img
              src={restored}
              alt="Restored"
              className="max-w-xs mx-auto rounded-md shadow"
            />
          </div>
        )}
      </div>
    </div>
  );
}