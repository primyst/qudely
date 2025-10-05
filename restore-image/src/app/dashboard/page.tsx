"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabaseClient";
import toast, { Toaster } from "react-hot-toast";

interface Profile {
  id: string;
  email: string;
  trial_count: number;
  is_premium: boolean;
}

interface HistoryItem {
  id: string;
  user_id: string;
  original: string;
  restored: string;
  created_at: string;
}

export default function DashboardPage() {
  const supabase = createClient();
  const router = useRouter();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [loading, setLoading] = useState(false);

  // Fetch profile + history
  useEffect(() => {
    const fetchData = async () => {
      const { data: authData, error: authError } = await supabase.auth.getUser();
      if (authError || !authData.user) return router.push("/auth/login");

      const userId = authData.user.id;

      const { data: profileData, error: profileError } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .single();

      if (profileError || !profileData) {
        toast.error("Failed to fetch profile");
        return;
      }

      setProfile(profileData as Profile);

      const { data: historyData } = await supabase
        .from("history")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false });

      setHistory((historyData || []) as HistoryItem[]);
    };

    fetchData();
  }, []);

  // --- Handle image upload + restore process ---
  const handleProcessImage = () => {
    if (!profile) return;

    if (!profile.is_premium && profile.trial_count >= 2) {
      return toast.error("Trial limit reached! Please upgrade to premium.");
    }

    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";

    input.onchange = async (e: Event) => {
      const target = e.target as HTMLInputElement;
      if (!target.files || target.files.length === 0) return;

      const file = target.files[0];
      setLoading(true);
      toast.loading("Uploading image...");

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from("images")
        .upload(`uploads/${crypto.randomUUID()}-${file.name}`, file, { upsert: true });

      if (uploadError || !uploadData) {
        toast.dismiss();
        setLoading(false);
        return toast.error(`Upload failed: ${uploadError.message}`);
      }

      const imageUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/images/${uploadData.path}`;
      toast.loading("Processing image...");

      const res = await fetch("/api/pipeline", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: profile.id, imageUrl }),
      });

      const result = await res.json();
      toast.dismiss();
      setLoading(false);

      if (result.error) return toast.error(result.error);

      // Update trial count locally
      if (!profile.is_premium) {
        const updatedTrial = profile.trial_count + 1;
        setProfile({ ...profile, trial_count: updatedTrial });
      }

      // Update UI with restored image only
      setHistory((prev) => [
        {
          id: crypto.randomUUID(),
          user_id: profile.id,
          original: imageUrl,
          restored: result.restored,
          created_at: new Date().toISOString(),
        },
        ...prev,
      ]);

      toast.success("Image restored successfully!");
    };

    input.click();
  };

  // --- Upgrade to Premium (mock) ---
  const handleUpgrade = async () => {
    if (!profile) return;

    const { data: updatedProfile, error } = await supabase
      .from("profiles")
      .update({ is_premium: true })
      .eq("id", profile.id)
      .select()
      .single();

    if (error || !updatedProfile) return toast.error("Upgrade failed.");

    setProfile(updatedProfile as Profile);
    toast.success("Upgraded to premium! 🎉 Unlimited access unlocked.");
  };

  // --- Logout ---
  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/auth/login");
  };

  if (!profile) return <p className="p-6 text-gray-500">Loading...</p>;

  return (
    <div className="p-6 space-y-6 max-w-5xl mx-auto">
      <Toaster position="top-right" />
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Welcome, {profile.email}</h1>
          <p className="text-gray-600">
            Trial used: {profile.trial_count} / 2 | Status:{" "}
            {profile.is_premium ? "Premium 🏅" : "Free"}
          </p>
        </div>

        <button
          onClick={handleLogout}
          className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
        >
          Logout
        </button>
      </div>

      <button
        disabled={loading}
        onClick={handleProcessImage}
        className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:bg-blue-300"
      >
        {loading ? "Processing..." : "Upload & Restore Image"}
      </button>

      {!profile.is_premium && profile.trial_count >= 2 && (
        <button
          onClick={handleUpgrade}
          className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
        >
          Upgrade to Premium
        </button>
      )}

      <div className="mt-8">
        <h2 className="text-xl font-bold mb-3">History</h2>

        {history.length === 0 ? (
          <p className="text-gray-500">No images processed yet.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {history.map((h) => (
              <div key={h.id} className="bg-white p-3 rounded-lg shadow space-y-2">
                <img
                  src={h.original}
                  alt="Original"
                  className="w-full h-40 object-cover rounded border"
                />
                <img
                  src={h.restored}
                  alt="Restored"
                  className="w-full h-40 object-cover rounded border"
                />
                <p className="text-xs text-gray-500">
                  {new Date(h.created_at).toLocaleString()}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}