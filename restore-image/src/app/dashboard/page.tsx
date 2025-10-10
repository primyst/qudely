"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";
import toast, { Toaster } from "react-hot-toast";

export default function DashboardPage() {
  const [trialCount, setTrialCount] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);

  // 1️⃣ Fetch user and trial count
  const fetchTrialCount = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    const { data, error } = await supabase
      .from("profiles")
      .select("trial_count")
      .eq("id", user.id)
      .single();

    if (error) {
      console.error(error);
      toast.error("Failed to fetch trial count");
    } else {
      setTrialCount(data.trial_count);
    }
  };

  useEffect(() => {
    fetchTrialCount();
  }, []);

  // 2️⃣ Handle image restoration
  const handleRestore = async () => {
    setLoading(true);
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      toast.error("Please login first");
      setLoading(false);
      return;
    }

    if (!trialCount || trialCount <= 0) {
      toast.error("Your free trials are over. Please upgrade to premium.");
      setLoading(false);
      return;
    }

    try {
      // Call your AI restoration API here
      // Example: await fetch("/api/restore", { method: "POST", body: ... });

      // 3️⃣ Decrement trial count automatically
      const { error } = await supabase.rpc("decrement_trial_count", {
        user_id: user.id,
      });

      if (error) {
        console.error(error);
        toast.error("Failed to decrement trial count");
      } else {
        setTrialCount(trialCount - 1);
        toast.success("Restoration complete! Trial used.");
      }
    } catch (err) {
      console.error(err);
      toast.error("Restoration failed. Try again.");
    }

    setLoading(false);
  };

  return (
    <div className="p-6">
      <Toaster position="top-right" />
      <h2 className="text-xl font-semibold">Welcome to your dashboard</h2>
      {trialCount !== null && (
        <p className="mt-2 text-gray-600">
          🧩 You have <span className="font-bold">{trialCount}</span> free
          trial{trialCount !== 1 && "s"} left.
        </p>
      )}

      <button
        onClick={handleRestore}
        disabled={loading || (trialCount !== null && trialCount <= 0)}
        className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
      >
        {loading ? "Restoring..." : "Restore Image"}
      </button>
    </div>
  );
}