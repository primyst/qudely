export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          email: string;
          trial_count?: number | null;
          is_premium?: boolean | null;
          created_at?: string | null;
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
    };
  };
};