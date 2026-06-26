import type { SessionUser, TipRecord, WalletTransaction } from "@/lib/types";

async function parseJson<T>(response: Response): Promise<T> {
  const data = await response.json();
  if (!response.ok) {
    throw new Error((data as { error?: string }).error ?? "Request failed");
  }
  return data as T;
}

export async function apiCreateEmployeeWallet(input: {
  name: string;
  phone: string;
  workplaceId?: string;
}): Promise<SessionUser> {
  const response = await fetch("/api/wallets", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  const data = await parseJson<{ profile: SessionUser }>(response);
  return data.profile;
}

export async function apiGetProfile(id: string): Promise<SessionUser | null> {
  const response = await fetch(`/api/wallets/${id}`);
  if (response.status === 404) return null;
  const data = await parseJson<{ profile: SessionUser }>(response);
  return data.profile;
}

export async function apiUpdateBalance(
  profileId: string,
  deltaCents: number,
  type: WalletTransaction["type"],
  label: string
): Promise<SessionUser> {
  const response = await fetch(`/api/wallets/${profileId}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ deltaCents, type, label }),
  });
  const data = await parseJson<{ profile: SessionUser }>(response);
  return data.profile;
}

export async function apiGetTips(profileId: string): Promise<TipRecord[]> {
  const response = await fetch(`/api/wallets/${profileId}/tips`);
  const data = await parseJson<{ tips: TipRecord[] }>(response);
  return data.tips;
}

export async function apiGetTransactions(profileId: string): Promise<WalletTransaction[]> {
  const response = await fetch(`/api/wallets/${profileId}/transactions`);
  const data = await parseJson<{ transactions: WalletTransaction[] }>(response);
  return data.transactions;
}

export type EmployeeLookup = {
  id: string;
  name: string;
  employeeCode: string;
  verified: boolean;
  workplace: {
    id: string;
    name: string;
    slug: string;
    businessCode: string;
    logoEmoji: string;
  };
};

export async function apiLookupEmployeeByCode(code: string): Promise<EmployeeLookup | null> {
  const response = await fetch(`/api/wallets/code/${encodeURIComponent(code)}`);
  if (response.status === 404) return null;
  const data = await parseJson<{ employee: EmployeeLookup }>(response);
  return data.employee;
}

export type WorkplaceLookup = {
  workplace: EmployeeLookup["workplace"];
  employees: Array<{
    id: string;
    name: string;
    employeeCode: string;
    verified: boolean;
  }>;
};

export async function apiLookupWorkplaceByCode(code: string): Promise<WorkplaceLookup | null> {
  const response = await fetch(`/api/workplaces/code/${encodeURIComponent(code)}`);
  if (response.status === 404) return null;
  return parseJson<WorkplaceLookup>(response);
}

export async function apiSendTip(input: {
  fromProfileId?: string | null;
  fromName: string;
  toProfileId: string;
  amountCents: number;
  npsScore?: number;
  workplaceId?: string;
  topUpCents?: number;
}): Promise<{
  tip: TipRecord;
  sender: SessionUser | null;
  recipient: SessionUser | null;
  requiresTopUp?: boolean;
}> {
  const response = await fetch("/api/tips", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });

  const data = await response.json();

  if (response.status === 402) {
    return {
      tip: {} as TipRecord,
      sender: data.profile ?? null,
      recipient: null,
      requiresTopUp: true,
    };
  }

  if (!response.ok) {
    throw new Error(data.error ?? "Failed to send tip");
  }

  return data;
}

export function isApiUnavailableError(error: unknown): boolean {
  return error instanceof Error && error.message.includes("Supabase is not configured");
}
