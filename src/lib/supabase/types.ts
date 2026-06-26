export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      workplaces: {
        Row: WorkplaceRow;
        Insert: {
          id?: string;
          name: string;
          slug: string;
          business_code: string;
          logo_emoji?: string;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["workplaces"]["Insert"]>;
        Relationships: [];
      };
      profiles: {
        Row: ProfileRow;
        Insert: {
          id?: string;
          name: string;
          phone: string;
          role: "employee" | "customer";
          employee_code?: string | null;
          workplace_id?: string | null;
          wallet_balance_cents?: number;
          verified?: boolean;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["profiles"]["Insert"]>;
        Relationships: [];
      };
      tips: {
        Row: TipRow;
        Insert: {
          id?: string;
          from_profile_id?: string | null;
          from_name: string;
          to_profile_id: string;
          workplace_id?: string | null;
          amount_cents: number;
          nps_score?: number | null;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["tips"]["Insert"]>;
        Relationships: [];
      };
      wallet_transactions: {
        Row: TransactionRow;
        Insert: {
          id?: string;
          profile_id: string;
          type: "top_up" | "tip_sent" | "tip_received" | "withdraw";
          amount_cents: number;
          label: string;
          reference_id?: string | null;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["wallet_transactions"]["Insert"]>;
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: {
      send_tip: {
        Args: {
          p_from_profile_id: string | null;
          p_from_name: string;
          p_to_profile_id: string;
          p_amount_cents: number;
          p_nps_score?: number | null;
          p_workplace_id?: string | null;
        };
        Returns: TipRow;
      };
    };
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
}

export type WorkplaceRow = {
  id: string;
  name: string;
  slug: string;
  business_code: string;
  logo_emoji: string;
  created_at: string;
};

export type ProfileRow = {
  id: string;
  name: string;
  phone: string;
  role: "employee" | "customer";
  employee_code: string | null;
  workplace_id: string | null;
  wallet_balance_cents: number;
  verified: boolean;
  created_at: string;
};

export type TipRow = {
  id: string;
  from_profile_id: string | null;
  from_name: string;
  to_profile_id: string;
  workplace_id: string | null;
  amount_cents: number;
  nps_score: number | null;
  created_at: string;
};

export type TransactionRow = {
  id: string;
  profile_id: string;
  type: "top_up" | "tip_sent" | "tip_received" | "withdraw";
  amount_cents: number;
  label: string;
  reference_id: string | null;
  created_at: string;
};

export type ProfileWithWorkplace = ProfileRow & {
  workplaces: WorkplaceRow | null;
};
