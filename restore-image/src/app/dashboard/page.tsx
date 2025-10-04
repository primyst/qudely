"use client";

import { useEffect, useState, ChangeEvent } from "react";
import { createClient } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";

interface Profile {
  id: string;
  email: string;
  trial_count: number;
  is_premium: boolean;
  created_at: string;
}

interface HistoryRow {
  id: string;
  user_id: string;
  original_url: string;
  restored_url: string | null;
  colorized_url: string | null;
  created_at: string;
}

export default function DashboardPage() {
  const supabase = createClient();
  const router = useRouter();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [history, setHistory] = useState<HistoryRow[]>([]);

  // Fetch user profile
  useEffect(() => {
    const fetchProfile = async () => {
      const { data: userData, error: userError } = await supabase.auth.getUser();
      if (userError || !userData.user) {
        router.push("/auth/login");
        return;
      }

      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userData.user.id)
        .single();

      if (error || !data) return;
      setProfile(data as Profile);

      // Fetch history too
      const { data: historyData } = await supabase
        .from("history")
        .select("*")
        .eq("user_id", userData.user.id)
        .order("created_at", { ascending: false });

      if (historyData) setHistory(historyData as HistoryRow[]);
    };

    fetchProfile();
  }, [supabase, router]);

  // Upload image to Supabase Storage
  const uploadImage = async (file: File): Promise<string | null> => {
    if (!profile) return null;

    const filePath = `originals/${profile.id}-${Date.now()}-${file.name}`;
    const { error: uploadError } = await supabase.storage
      .from("images")
      .upload(filePath, file);

    if (uploadError) {
      alert("Upload failed: " + uploadError.message);
      return null;
    }

    const { data: publicUrl } = supabase.storage
      .from("images")
      .getPublicUrl(filePath);

    return publicUrl?.publicUrl ?? null;
  };

  // Handle AI pipeline
  const handleProcessImage = async () => {
    if (!profile) return;
    if (!selectedFile) {
      alert("Please select an image first.");
      return;
    }

    if (!profile.is_premium && profile.trial_count >= 2) {
      alert("Trial limit reached! Please subscribe to premium.");
      return;
    }

    setIsProcessing(true);
    try {
      const imageUrl = await uploadImage(selectedFile);
      if (!imageUrl) throw new Error("Failed to upload image.");

      const response = await fetch("/api/pipeline", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imageUrl, userId: profile.id }),
      });

      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Pipeline failed");

      if (!profile.is_premium) {
        const { data, error } = await supabase
          .from("profiles")
          .update({ trial_count: profile.trial_count + 1 })
          .eq("id", profile.id)
          .select("*")
          .single();

        if (!error && data) setProfile(data as Profile);
      }

      if (result.history) {
        setHistory((prev) => [result.history as HistoryRow, ...prev]);
      }

      alert("Image restored successfully!");
    } catch (err) {
      console.error(err);
      alert((err as Error).message);
    } finally {
      setIsProcessing(false);
    }
  };

  // Upgrade to premium
  const handleUpgrade = async () => {
    if (!profile) return;
    const { data, error } = await supabase
      .from("profiles")
      .update({ is_premium: true })
      .eq("id", profile.id)
      .select("*")
      .single();

    if (!error && data) {
      setProfile(data as Profile);
      alert("Upgraded to premium! Unlimited access unlocked.");
    }
  };

  if (!profile) return <p>Loading...</p>;

  return (
    <div className="p-6 space-y-6 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold">Welcome {profile.email}</h1>
      <div className="flex justify-between">
        <p>Trials used: {profile.trial_count} / 2</p>
        <p>Status: {profile.is_premium ? "🌟 Premium" : "🧩 Free Trial"}</p>
      </div>

      <input
        type="file"
        accept="image/*"
        onChange={(e: ChangeEvent<HTMLInputElement>) =>
          setSelectedFile(e.target.files?.[0] || null)
        }
      />

      <button
        className={`bg-blue-500 text-white px-4 py-2 rounded disabled:opacity-50`}
        disabled={isProcessing}
        onClick={handleProcessImage}
      >
        {isProcessing ? "Processing..." : "Restore & Colorize"}
      </button>

      {!profile.is_premium && profile.trial_count >= 2 && (
        <button
          className="bg-green-500 text-white px-4 py-2 rounded"
          onClick={handleUpgrade}
        >
          Upgrade to Premium
        </button>
      )}

      <h2 className="text-lg font-semibold mt-6">History</h2>
      <div className="space-y-3">
        {history.map((h) => (
          <div key={h.id} className="border p-3 rounded-md">
            <p className="text-sm text-gray-600">
              {new Date(h.created_at).toLocaleString()}
            </p>
            <div className="grid grid-cols-2 gap-3 mt-2">
              <img
                src={h.original_url}
                alt="original"
                className="rounded-md border"
              />
              {h.colorized_url && (
                <img
                  src={h.colorized_url}
                  alt="restored"
                  className="rounded-md border"
                />
              )}
            </div>
          </div>
        ))}
        {history.length === 0 && (
          <p className="text-gray-500 text-sm">No history yet.</p>
        )}
      </div>

      <button
        className="bg-red-500 text-white px-3 py-2 rounded mt-6"
        onClick={async () => {
          await supabase.auth.signOut();
          router.push("/auth/login");
        }}
      >
        Logout
      </button>
    </div>
  );
}