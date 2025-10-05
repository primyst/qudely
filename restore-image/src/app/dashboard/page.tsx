"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabaseClient";

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
  colorized: string;
  created_at: string;
}

export default function DashboardPage() {
  const supabase = createClient();
  const router = useRouter();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [history, setHistory] = useState<HistoryItem[]>([]);

  // Fetch profile and history
  useEffect(() => {
    const fetchProfileAndHistory = async () => {
      const { data, error } = await supabase.auth.getUser();
      if (error || !data.user) return router.push("/auth/login");

      const userId = data.user.id;

      // --- Fetch profile ---
      const { data: profileData, error: profileError } = await supabase
        .from<Profile, Profile>("profiles") // row type, insert/update type
        .select("*")
        .eq("id", userId)
        .single();
      if (profileError || !profileData) return;
      setProfile(profileData);

      // --- Fetch history ---
      const { data: historyData } = await supabase
        .from<HistoryItem, HistoryItem>("history")
        .select("*")
        .eq("user_id", userId);
      setHistory(historyData || []);
    };

    fetchProfileAndHistory();
  }, []);

  // --- Handle image upload ---
  const handleProcessImage = () => {
    if (!profile) return;

    if (!profile.is_premium && profile.trial_count >= 2) {
      alert("Trial limit reached! Subscribe to premium.");
      return;
    }

    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";
    input.onchange = async (e: Event) => {
      const target = e.target as HTMLInputElement;
      if (!target.files || target.files.length === 0) return;
      const file = target.files[0];

      // Upload to Supabase storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from("images")
        .upload(`uploads/${file.name}`, file, { upsert: true });
      if (uploadError || !uploadData) return alert(uploadError.message);

      const imageUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/images/${uploadData.path}`;

      // Call AI pipeline
      const res = await fetch("/api/pipeline", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: profile.id, imageUrl }),
      });
      const result = await res.json();
      if (result.error) return alert(result.error);

      // Update trial count if free
      if (!profile.is_premium) {
        const { data: updatedProfile } = await supabase
          .from<Profile, Partial<Profile>>("profiles")
          .update({ trial_count: profile.trial_count + 1 })
          .eq("id", profile.id)
          .select()
          .single();
        if (updatedProfile) setProfile(updatedProfile);
      }

      // Add to history immediately
      setHistory((prev) => [
        ...prev,
        {
          id: crypto.randomUUID(),
          user_id: profile.id,
          original: imageUrl,
          restored: result.restored,
          colorized: result.colorized,
          created_at: new Date().toISOString(),
        },
      ]);
    };
    input.click();
  };

  // --- Upgrade to premium ---
  const handleUpgrade = async () => {
    if (!profile) return;

    const { data: updatedProfile } = await supabase
      .from<Profile, Partial<Profile>>("profiles")
      .update({ is_premium: true })
      .eq("id", profile.id)
      .select()
      .single();

    if (updatedProfile) setProfile(updatedProfile);
    alert("Upgraded to premium! Unlimited access unlocked.");
  };

  if (!profile) return <p>Loading...</p>;

  return (
    <div className="p-6 space-y-4">
      <h1 className="text-xl font-bold">Welcome {profile.email}</h1>
      <p>Trial used: {profile.trial_count} / 2</p>
      <p>Status: {profile.is_premium ? "Premium" : "Free"}</p>

      <button className="bg-blue-500 text-white px-3 py-2 rounded" onClick={handleProcessImage}>
        Process Image
      </button>

      {!profile.is_premium && profile.trial_count >= 2 && (
        <button className="bg-green-500 text-white px-3 py-2 rounded" onClick={handleUpgrade}>
          Upgrade to Premium
        </button>
      )}

      <button
        className="bg-red-500 text-white px-3 py-2 rounded mt-4"
        onClick={async () => {
          await supabase.auth.signOut();
          router.push("/auth/login");
        }}
      >
        Logout
      </button>

      <div className="mt-6">
        <h2 className="text-lg font-bold mb-2">History</h2>
        {history.length === 0 ? (
          <p>No processed images yet.</p>
        ) : (
          <div className="grid grid-cols-3 gap-4">
            {history.map((h) => (
              <div key={h.id} className="space-y-1">
                <img src={h.original} className="w-full h-32 object-cover rounded" />
                <img src={h.restored} className="w-full h-32 object-cover rounded" />
                <img src={h.colorized} className="w-full h-32 object-cover rounded" />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}