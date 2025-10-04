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
          id: string;
          email: string;
          trial_count?: number;
          is_premium?: boolean;
          created_at?: string;
        };
        Update: {
          email?: string;
          trial_count?: number;
          is_premium?: boolean;
          created_at?: string;
        };
      };
    };
  };
};