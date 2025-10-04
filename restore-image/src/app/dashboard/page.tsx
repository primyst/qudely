"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";

export default function DashboardPage() {
  const supabase = createClient();
  const router = useRouter();
  const [profile, setProfile] = useState<any>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return router.push("/auth/login");

      const { data: profiles } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();
      setProfile(profiles);
    };
    fetchProfile();
  }, []);

  const handleProcessImage = async () => {
    if (!profile) return;

    if (!profile.is_premium && profile.trial_count >= 2) {
      alert("Trial limit reached! Please subscribe to premium.");
      return;
    }

    // Call your AI pipeline here
    // const result = await fetch('/api/pipeline', { ... });

    // Increment trial count if not premium
    if (!profile.is_premium) {
      const { data } = await supabase
        .from("profiles")
        .update({ trial_count: profile.trial_count + 1 })
        .eq("id", profile.id)
        .select()
        .single();
      setProfile(data);
    }

    alert("Image processed!"); // placeholder
  };

  const handleUpgrade = async () => {
    await supabase.from("profiles").update({ is_premium: true }).eq("id", profile.id);
    setProfile({ ...profile, is_premium: true });
    alert("Upgraded to premium! Unlimited access unlocked.");
  };

  if (!profile) return <p>Loading...</p>;

  return (
    <div className="p-6 space-y-4">
      <h1 className="text-xl font-bold">Welcome {profile.email}</h1>
      <p>Trial used: {profile.trial_count} / 2</p>
      <p>Status: {profile.is_premium ? "Premium" : "Free"}</p>

      <button
        className="bg-blue-500 text-white px-3 py-2 rounded"
        onClick={handleProcessImage}
      >
        Process Image
      </button>

      {!profile.is_premium && profile.trial_count >= 2 && (
        <button
          className="bg-green-500 text-white px-3 py-2 rounded"
          onClick={handleUpgrade}
        >
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
    </div>
  );
}