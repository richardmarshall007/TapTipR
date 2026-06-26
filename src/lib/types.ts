export type UserRole = "customer" | "employee";

export interface User {
  id: string;
  name: string;
  phone: string;
  role: UserRole;
  walletBalanceCents: number;
  workplaceId?: string;
  employeeCode?: string;
  verified?: boolean;
}

export interface Workplace {
  id: string;
  name: string;
  slug: string;
  businessCode: string;
  logoEmoji: string;
}

export interface EmployeeOnShift {
  id: string;
  name: string;
  employeeCode: string;
  verified: boolean;
}

export interface TipRecord {
  id: string;
  fromName: string;
  toEmployeeId: string;
  toEmployeeName: string;
  workplaceName: string;
  amountCents: number;
  npsScore?: number;
  createdAt: string;
}

export interface WalletTransaction {
  id: string;
  type: "top_up" | "tip_sent" | "tip_received" | "withdraw";
  amountCents: number;
  label: string;
  createdAt: string;
}

export interface SessionUser {
  id: string;
  name: string;
  phone: string;
  role: UserRole;
  walletBalanceCents: number;
  workplaceId?: string;
  employeeCode?: string;
  verified?: boolean;
}
