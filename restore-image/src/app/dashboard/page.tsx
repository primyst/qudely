"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";

// Define the shape of the profile from Supabase
interface Profile {
  id: string;
  email: string;
  trial_count: number;
  is_premium: boolean;
  created_at: string;
}

export default function DashboardPage() {
  const supabase = createClient();
  const router = useRouter();
  const [profile, setProfile] = useState<Profile | null>(null);

  // Helper for cleaner .from usage
  const profiles = () => supabase.from<Profile, Profile>("profiles");

  useEffect(() => {
    const fetchProfile = async () => {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) {
        router.push("/auth/login");
        return;
      }

      const { data, error: profileError } = await profiles()
        .select("*")
        .eq("id", user.id)
        .single();

      if (profileError) {
        console.error(profileError);
        return;
      }

      setProfile(data);
    };

    fetchProfile();
  }, [supabase, router]);

  const handleProcessImage = async () => {
    if (!profile) return;

    if (!profile.is_premium && profile.trial_count >= 2) {
      alert("Trial limit reached! Please subscribe to premium.");
      return;
    }

    // TODO: Call your AI pipeline here
    // const result = await fetch('/api/pipeline', { ... });

    // Increment trial count if not premium
    if (!profile.is_premium) {
      const { data, error } = await profiles()
        .update({ trial_count: profile.trial_count + 1 })
        .eq("id", profile.id)
        .select()
        .single();

      if (error) {
        console.error(error);
        return;
      }

      setProfile(data);
    }

    alert("Image processed!"); // placeholder
  };

  const handleUpgrade = async () => {
    if (!profile) return;

    const { data, error } = await profiles()
      .update({ is_premium: true })
      .eq("id", profile.id)
      .select()
      .single();

    if (error) {
      console.error(error);
      return;
    }

    setProfile(data);
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