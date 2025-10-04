export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          email: string;
          full_name: string;
          credits: number;
          is_premium: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          email: string;
          full_name: string;
          credits?: number;
          is_premium?: boolean;
          created_at?: string;
        };
        Update: {
          email?: string;
          full_name?: string;
          credits?: number;
          is_premium?: boolean;
          created_at?: string;
        };
      };
    };
  };
};