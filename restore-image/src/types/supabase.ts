export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          email: string;
          trial_count: number | null;
          is_premium: boolean | null;
          created_at: string | null;
        };
        Insert: {
          id: string;
          email: string;
          trial_count?: number | null;
          is_premium?: boolean | null;
          created_at?: string | null;
        };
        Update: {
          trial_count?: number | null;
          is_premium?: boolean | null;
        };
      };

      history: {
        Row: {
          id: string;
          user_id: string;
          original_url: string;
          restored_url: string | null;
          colorized_url: string | null;
          created_at: string | null;
        };
        Insert: {
          id?: string;
          user_id: string;
          original_url: string;
          restored_url?: string | null;
          colorized_url?: string | null;
          created_at?: string | null;
        };
        Update: {
          restored_url?: string | null;
          colorized_url?: string | null;
        };
      };
    };
  };
};