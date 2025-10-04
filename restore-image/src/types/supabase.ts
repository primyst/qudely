export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          email: string;
          trial_count: number;
          is_premium: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          email: string;
          trial_count?: number;
          is_premium?: boolean;
          created_at?: string;
        };
        Update: {
          trial_count?: number;
          is_premium?: boolean;
        };
      };
      history: {
        Row: {
          id: string;
          user_id: string;
          original_url: string;
          restored_url: string | null;
          colorized_url: string | null;
          created_at: string;
        };
        Insert: {
          user_id: string;
          original_url: string;
          restored_url?: string | null;
          colorized_url?: string | null;
          created_at?: string;
        };
        Update: {
          restored_url?: string | null;
          colorized_url?: string | null;
        };
      };
    };
  };
};