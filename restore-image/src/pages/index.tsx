'use client';

import { useSupabaseClient, useUser } from '@supabase/auth-helpers-react';
import { Auth } from '@supabase/auth-ui-react';
import { ThemeSupa } from '@supabase/auth-ui-shared';

export default function Home() {
  const supabase = useSupabaseClient();
  const user = useUser();

  if (!user) {
    return (
      <Auth supabaseClient={supabase} appearance={{ theme: ThemeSupa }} />
    );
  }

  return (
    <div>
      <h1>Welcome, {user.email}</h1>
      {/* UploadBox & photo restore UI here */}
    </div>
  );
}
