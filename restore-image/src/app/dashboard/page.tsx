"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";
import toast, { Toaster } from "react-hot-toast";

export default function DashboardPage() {
  const [trialCount, setTrialCount] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [userEmail, setUserEmail] = useState<string | null>(null);

  // ✅ 1. Fetch current user and trial count
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

  // ✅ 2. Handle restore click
  const handleRestore = async () => {
    setLoading(true);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      toast.error("Please login to continue.");
      setLoading(false);
      return;
    }

    // Check available trials
    if (!trialCount || trialCount <= 0) {
      toast.error("Your free trials are over. Upgrade to premium to continue.");
      setLoading(false);
      return;
    }

    try {
      // 🧠 Here’s where your AI restore API will be called
      // const response = await fetch("/api/restore", { method: "POST", body: ... });
      // const data = await response.json();

      // Simulate restoration delay
      await new Promise((r) => setTimeout(r, 1500));

      // ✅ Decrement trial count
      const { error } = await supabase.rpc("decrement_trial_count", {
        user_id: user.id,
      });

      if (error) {
        console.error(error);
        toast.error("Error updating trial count.");
      } else {
        setTrialCount((prev) => (prev !== null ? prev - 1 : 0));
        toast.success("Restoration successful! Trial used.");
      }
    } catch (err) {
      console.error(err);
      toast.error("Something went wrong during restoration.");
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-r from-green-100 to-green-200 flex flex-col items-center justify-center">
      <Toaster position="top-right" />
      <div className="bg-white p-8 rounded-2xl shadow-xl w-[90%] max-w-md text-center">
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
          {loading ? "Restoring..." : "Restore an Image"}
        </button>

        <p className="text-sm text-gray-400 mt-6">
          Each restoration uses one free trial.
        </p>
      </div>
    </div>
  );
}