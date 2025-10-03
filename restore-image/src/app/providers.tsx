"use client";

import { createClient } from "@/lib/supabaseClient";
import { useState } from "react";
import { Session } from "@supabase/supabase-js";

export default function Providers({ children }: { children: React.ReactNode }) {
  const supabase = createClient();
  const [session, setSession] = useState<Session | null>(null);

  supabase.auth.onAuthStateChange((_event, session) => {
    setSession(session);
  });

  return <>{children}</>;
}
