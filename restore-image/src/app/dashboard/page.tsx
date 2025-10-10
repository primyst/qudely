"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";
import toast, { Toaster } from "react-hot-toast";

export default function DashboardPage() {
  const [trialCount, setTrialCount] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [restoredImage, setRestoredImage] = useState<string | null>(null);
  const [imageUrl, setImageUrl] = useState<string>("");

  // ✅ Fetch current user & profile
  const fetchTrialCount = async () => {
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
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
      toast.error("Failed to load profile info.");
    } else {
      setTrialCount(data.trial_count);
    }
  };

  useEffect(() => {
    fetchTrialCount();
  }, []);

  // ✅ Handle AI Restoration
  const handleRestore = async () => {
    if (!imageUrl.trim()) {
      toast.error("Please enter an image URL.");
      return;
    }

    setLoading(true);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      toast.error("Please login to continue.");
      setLoading(false);
      return;
    }

    // Check trials
    if (trialCount === null) {
      toast.error("Could not verify your trial balance.");
      setLoading(false);
      return;
    }

    if (trialCount <= 0) {
      toast.error("Your free trials are over. Upgrade to premium to continue.");
      setLoading(false);
      return;
    }

    try {
      // 🔥 Call your Replicate pipeline
      const response = await fetch("/api/pipeline", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user.id,
          imageUrl: imageUrl.trim(),
        }),
      });

      const result = await response.json();

      if (!response.ok || result.error) {
        toast.error(result.error || "Something went wrong.");
        return;
      }

      // ✅ Display restored image
      setRestoredImage(result.restored);
      toast.success("Image restored successfully!");

      // ✅ Use your decrement_trial_count RPC for better tracking
      const { error } = await supabase.rpc("decrement_trial_count", {
        user_id: user.id,
      });

      if (error) console.error("RPC error:", error);
      setTrialCount((prev) => (prev !== null ? prev - 1 : 0));
    } catch (err) {
      console.error("Restoration error:", err);
      toast.error("An error occurred during restoration.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-r from-green-100 to-green-200 flex flex-col items-center justify-center px-4">
      <Toaster position="top-right" />
      <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md text-center">
        <h1 className="text-3xl font-extrabold text-green-700">Qudely Dashboard</h1>
        <p className="text-gray-500 mt-2">
          Welcome{userEmail ? `, ${userEmail}` : ""} 👋
        </p>

        {trialCount !== null ? (
          <p className="mt-4 text-gray-700">
            🧩 You have{" "}
            <span className="font-bold text-green-600">{trialCount}</span> free
            trial{trialCount !== 1 && "s"} remaining.
          </p>
        ) : (
          <p className="mt-4 text-gray-500">Loading your trial info...</p>
        )}

        {/* Image URL Input */}
        <input
          type="text"
          placeholder="Enter image URL to restore"
          className="mt-6 w-full border border-gray-300 px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400"
          value={imageUrl}
          onChange={(e) => setImageUrl(e.target.value)}
        />

        {/* Restore Button */}
        <button
          onClick={handleRestore}
          disabled={loading || (trialCount !== null && trialCount <= 0)}
          className={`mt-6 w-full py-3 rounded-lg font-semibold text-white transition ${
            loading
              ? "bg-green-400 cursor-not-allowed"
              : trialCount && trialCount > 0
              ? "bg-green-600 hover:bg-green-700"
              : "bg-gray-400 cursor-not-allowed"
          }`}
        >
          {loading ? "Restoring..." : "Restore Image"}
        </button>

        {/* Restored Image Preview */}
        {restoredImage && (
          <div className="mt-6">
            <h3 className="text-lg font-semibold text-gray-700 mb-2">
              Restored Result:
            </h3>
            <img
              src={restoredImage}
              alt="Restored"
              className="rounded-lg shadow-md mx-auto w-full object-cover"
            />
          </div>
        )}

        <p className="text-sm text-gray-400 mt-6">
          Each restoration uses one free trial.
        </p>
      </div>
    </div>
  );
}