import { createBrowserClient } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";

// define the Database type if you have your Supabase types generated,
// else keep it minimal for now:
type Database = {
  public: {
    Tables: {
      history: {
        Row: {
          id: string;
          user_id: string;
          original_url: string;
          restored_url: string;
          colorized_url: string;
          created_at: string;
        };
      };
    };
  };
};

export const createClient = (): SupabaseClient<Database> =>
  createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );