import type { SessionUser, TipRecord, WalletTransaction } from "@/lib/types";
import type { ProfileRow, ProfileWithWorkplace, TipRow, TransactionRow, WorkplaceRow } from "@/lib/supabase/types";
import { getSupabaseAdmin } from "@/lib/supabase/server";

export function generateWalletCode(name: string): string {
  const prefix = name.trim().split(/\s+/)[0]?.toUpperCase().slice(0, 5) || "WALLET";
  const suffix = Math.random().toString(36).slice(2, 6).toUpperCase();
  return `${prefix}-${suffix}`;
}

export function profileToSessionUser(profile: ProfileRow): SessionUser {
  return {
    id: profile.id,
    name: profile.name,
    phone: profile.phone,
    role: profile.role,
    walletBalanceCents: profile.wallet_balance_cents,
    workplaceId: profile.workplace_id ?? undefined,
    employeeCode: profile.employee_code ?? undefined,
    verified: profile.verified,
  };
}

export function tipRowToRecord(tip: TipRow, toName: string, workplaceName: string): TipRecord {
  return {
    id: tip.id,
    fromName: tip.from_name,
    toEmployeeId: tip.to_profile_id,
    toEmployeeName: toName,
    workplaceName,
    amountCents: tip.amount_cents,
    npsScore: tip.nps_score ?? undefined,
    createdAt: tip.created_at,
  };
}

export function transactionRowToRecord(tx: TransactionRow): WalletTransaction {
  return {
    id: tx.id,
    type: tx.type,
    amountCents: tx.amount_cents,
    label: tx.label,
    createdAt: tx.created_at,
  };
}

export async function createEmployeeWallet(input: {
  name: string;
  phone: string;
  workplaceId?: string;
}): Promise<SessionUser> {
  const supabase = getSupabaseAdmin();
  let employeeCode = generateWalletCode(input.name);

  for (let attempt = 0; attempt < 5; attempt++) {
    const { data, error } = await supabase
      .from("profiles")
      .insert({
        name: input.name.trim(),
        phone: input.phone.trim(),
        role: "employee",
        employee_code: employeeCode,
        workplace_id: input.workplaceId ?? null,
        wallet_balance_cents: 0,
        verified: false,
      })
      .select("*")
      .single();

    if (!error && data) return profileToSessionUser(data);
    if (error?.code !== "23505") throw new Error(error?.message ?? "Failed to create wallet");
    employeeCode = generateWalletCode(input.name);
  }

  throw new Error("Could not generate a unique employee code");
}

export async function createCustomerWallet(name: string): Promise<SessionUser> {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("profiles")
    .insert({
      name: name.trim() || "Guest",
      phone: "guest",
      role: "customer",
      wallet_balance_cents: 0,
    })
    .select("*")
    .single();

  if (error || !data) throw new Error(error?.message ?? "Failed to create customer wallet");
  return profileToSessionUser(data);
}

export async function getProfileById(id: string): Promise<SessionUser | null> {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase.from("profiles").select("*").eq("id", id).maybeSingle();
  if (error) throw new Error(error.message);
  return data ? profileToSessionUser(data) : null;
}

export async function getProfileByCode(code: string): Promise<ProfileWithWorkplace | null> {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("profiles")
    .select("*, workplaces(*)")
    .ilike("employee_code", code)
    .maybeSingle();

  if (error) throw new Error(error.message);
  return data as ProfileWithWorkplace | null;
}

export async function getWorkplaceByCode(code: string): Promise<WorkplaceRow | null> {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("workplaces")
    .select("*")
    .or(`business_code.eq.${code},slug.eq.${code}`)
    .maybeSingle();

  if (error) throw new Error(error.message);
  if (data) return data as WorkplaceRow;

  const { data: ilike, error: err2 } = await supabase
    .from("workplaces")
    .select("*")
    .ilike("business_code", code)
    .maybeSingle();

  if (err2) throw new Error(err2.message);
  return (ilike as WorkplaceRow | null) ?? null;
}

export async function getEmployeesForWorkplace(workplaceId: string) {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("profiles")
    .select("id, name, employee_code, verified")
    .eq("workplace_id", workplaceId)
    .eq("role", "employee")
    .order("name");

  if (error) throw new Error(error.message);
  return (data ?? []).map((row) => ({
    id: row.id,
    name: row.name,
    employeeCode: row.employee_code!,
    verified: row.verified,
  }));
}

export async function adjustWalletBalance(
  profileId: string,
  deltaCents: number,
  tx: { type: WalletTransaction["type"]; label: string }
): Promise<SessionUser> {
  const supabase = getSupabaseAdmin();
  const profile = await getProfileById(profileId);
  if (!profile) throw new Error("Profile not found");

  const nextBalance = Math.max(0, profile.walletBalanceCents + deltaCents);
  const { data, error } = await supabase
    .from("profiles")
    .update({ wallet_balance_cents: nextBalance })
    .eq("id", profileId)
    .select("*")
    .single();

  if (error || !data) throw new Error(error?.message ?? "Failed to update balance");

  const { error: txError } = await supabase.from("wallet_transactions").insert({
    profile_id: profileId,
    type: tx.type,
    amount_cents: deltaCents,
    label: tx.label,
  });

  if (txError) throw new Error(txError.message);
  return profileToSessionUser(data);
}

export async function sendTip(input: {
  fromProfileId: string | null;
  fromName: string;
  toProfileId: string;
  amountCents: number;
  npsScore?: number;
  workplaceId?: string;
}) {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase.rpc("send_tip", {
    p_from_profile_id: input.fromProfileId,
    p_from_name: input.fromName,
    p_to_profile_id: input.toProfileId,
    p_amount_cents: input.amountCents,
    p_nps_score: input.npsScore ?? null,
    p_workplace_id: input.workplaceId ?? null,
  });

  if (error) throw new Error(error.message);
  return data;
}

export async function getTipsForProfile(profileId: string): Promise<TipRecord[]> {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("tips")
    .select("*")
    .eq("to_profile_id", profileId)
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);

  const profile = await getProfileById(profileId);

  return (data ?? []).map((tip) =>
    tipRowToRecord(tip, profile?.name ?? "Employee", "TapTipR Partner")
  );
}

export async function getTransactionsForProfile(profileId: string): Promise<WalletTransaction[]> {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("wallet_transactions")
    .select("*")
    .eq("profile_id", profileId)
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);
  return (data ?? []).map(transactionRowToRecord);
}

export function getWalletTipUrl(employeeCode: string, origin = "https://taptipr.com"): string {
  return `${origin}/tip/e/${employeeCode}`;
}
