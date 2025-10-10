"use client";

import { supabase } from "@/lib/supabaseClient";
import { useState } from "react";
import { Session } from "@supabase/supabase-js";

export default function Providers({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);

  supabase.auth.onAuthStateChange((_event, session) => {
    setSession(session);
  });

  return <>{children}</>;
}
