"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";

export default function DashboardPage() {
  const supabase = createClient();
  const router = useRouter();
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (!data.user) router.push("/auth/login");
      else setUser(data.user);
    });
  }, []);

  return (
    <div className="p-6">
      <h1 className="text-xl font-bold">Welcome {user?.email}</h1>
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
