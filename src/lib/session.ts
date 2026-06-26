"use client";

import { useCallback, useEffect, useState } from "react";
import type { SessionUser, TipRecord, WalletTransaction } from "./types";
import {
  apiCreateEmployeeWallet,
  apiGetProfile,
  apiGetTips,
  apiGetTransactions,
  apiSendTip,
  apiUpdateBalance,
  isApiUnavailableError,
} from "./api/client";
import { getDemoEmployeeByCode } from "./demo-data";
import { generateId } from "./utils";

const SESSION_KEY = "taptipr_session";
const TIPS_KEY = "taptipr_tips";
const TX_KEY = "taptipr_transactions";
const WALLETS_KEY = "taptipr_wallets";

export interface RegisteredWallet {
  id: string;
  name: string;
  phone: string;
  employeeCode: string;
  workplaceId?: string;
  walletBalanceCents: number;
  verified: boolean;
}

function readJson<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function writeJson<T>(key: string, value: T) {
  localStorage.setItem(key, JSON.stringify(value));
}

// --- Local fallback (used when Supabase env vars are not set) ---

export function getRegisteredWallets(): RegisteredWallet[] {
  return readJson<RegisteredWallet[]>(WALLETS_KEY, []);
}

function saveRegisteredWallet(wallet: RegisteredWallet) {
  const wallets = getRegisteredWallets().filter((w) => w.id !== wallet.id);
  wallets.push(wallet);
  writeJson(WALLETS_KEY, wallets);
}

export function getRegisteredWalletByCode(code: string): RegisteredWallet | undefined {
  return getRegisteredWallets().find(
    (w) => w.employeeCode.toLowerCase() === code.toLowerCase()
  );
}

export function creditRegisteredWallet(employeeId: string, amountCents: number) {
  const wallets = getRegisteredWallets();
  const index = wallets.findIndex((w) => w.id === employeeId);
  if (index === -1) return;

  wallets[index] = {
    ...wallets[index],
    walletBalanceCents: wallets[index].walletBalanceCents + amountCents,
  };
  writeJson(WALLETS_KEY, wallets);

  const session = readJson<SessionUser | null>(SESSION_KEY, null);
  if (session?.id === employeeId) {
    writeJson(SESSION_KEY, {
      ...session,
      walletBalanceCents: session.walletBalanceCents + amountCents,
    });
  }
}

export function generateWalletCode(name: string): string {
  const prefix = name.trim().split(/\s+/)[0]?.toUpperCase().slice(0, 5) || "WALLET";
  const suffix = Math.random().toString(36).slice(2, 6).toUpperCase();
  return `${prefix}-${suffix}`;
}

function registerUserLocal(input: {
  name: string;
  phone: string;
  workplaceId?: string;
}): SessionUser {
  const employeeCode = generateWalletCode(input.name);
  const user: SessionUser = {
    id: generateId("user"),
    name: input.name.trim(),
    phone: input.phone.trim(),
    role: "employee",
    walletBalanceCents: 0,
    workplaceId: input.workplaceId,
    employeeCode,
    verified: false,
  };

  saveRegisteredWallet({
    id: user.id,
    name: user.name,
    phone: user.phone,
    employeeCode: user.employeeCode!,
    workplaceId: user.workplaceId,
    walletBalanceCents: 0,
    verified: false,
  });

  return user;
}

export function createCustomerSessionLocal(name: string): SessionUser {
  return {
    id: generateId("guest"),
    name: name.trim() || "Guest",
    phone: "guest",
    role: "customer",
    walletBalanceCents: 0,
  };
}

// --- Hooks ---

export function useSession() {
  const [user, setUserState] = useState<SessionUser | null>(null);
  const [loaded, setLoaded] = useState(false);

  const refreshFromStorage = useCallback(async () => {
    const session = readJson<SessionUser | null>(SESSION_KEY, null);
    if (!session) {
      setUserState(null);
      return;
    }

    try {
      const profile = await apiGetProfile(session.id);
      if (profile) {
        setUserState(profile);
        writeJson(SESSION_KEY, profile);
        return;
      }
    } catch {
      // fall through to local cache
    }

    const registered = getRegisteredWallets().find((w) => w.id === session.id);
    if (registered) {
      setUserState({ ...session, walletBalanceCents: registered.walletBalanceCents });
    } else {
      setUserState(session);
    }
  }, []);

  useEffect(() => {
    refreshFromStorage().finally(() => setLoaded(true));
  }, [refreshFromStorage]);

  const setUser = useCallback((next: SessionUser | null) => {
    setUserState(next);
    if (next) writeJson(SESSION_KEY, next);
    else localStorage.removeItem(SESSION_KEY);
  }, []);

  const updateBalance = useCallback(
    async (
      deltaCents: number,
      type: WalletTransaction["type"],
      label: string
    ): Promise<SessionUser | null> => {
      const session = readJson<SessionUser | null>(SESSION_KEY, null);
      if (!session) return null;

      try {
        const profile = await apiUpdateBalance(session.id, deltaCents, type, label);
        setUserState(profile);
        writeJson(SESSION_KEY, profile);
        return profile;
      } catch (error) {
        if (!isApiUnavailableError(error)) throw error;

        const updated = {
          ...session,
          walletBalanceCents: Math.max(0, session.walletBalanceCents + deltaCents),
        };
        writeJson(SESSION_KEY, updated);
        if (updated.role === "employee" && updated.employeeCode) {
          saveRegisteredWallet({
            id: updated.id,
            name: updated.name,
            phone: updated.phone,
            employeeCode: updated.employeeCode,
            workplaceId: updated.workplaceId,
            walletBalanceCents: updated.walletBalanceCents,
            verified: updated.verified ?? false,
          });
        }
        setUserState(updated);
        return updated;
      }
    },
    []
  );

  return { user, setUser, updateBalance, loaded, refreshFromStorage };
}

export function useWalletHistory(profileId?: string) {
  const [transactions, setTransactions] = useState<WalletTransaction[]>([]);

  const refresh = useCallback(async () => {
    if (!profileId) {
      setTransactions(readJson(TX_KEY, []));
      return;
    }

    try {
      const rows = await apiGetTransactions(profileId);
      setTransactions(rows);
    } catch (error) {
      if (isApiUnavailableError(error)) {
        setTransactions(readJson(TX_KEY, []));
      }
    }
  }, [profileId]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const addTransaction = useCallback(
    (tx: Omit<WalletTransaction, "id" | "createdAt">) => {
      const entry: WalletTransaction = {
        ...tx,
        id: generateId("tx"),
        createdAt: new Date().toISOString(),
      };
      setTransactions((prev) => {
        const next = [entry, ...prev];
        writeJson(TX_KEY, next);
        return next;
      });
      return entry;
    },
    []
  );

  return { transactions, addTransaction, refresh };
}

export function useTipHistory(profileId?: string) {
  const [tips, setTips] = useState<TipRecord[]>([]);

  const refresh = useCallback(async () => {
    if (!profileId) {
      setTips(readJson(TIPS_KEY, []));
      return;
    }

    try {
      const rows = await apiGetTips(profileId);
      setTips(rows);
    } catch (error) {
      if (isApiUnavailableError(error)) {
        setTips(readJson(TIPS_KEY, []));
      }
    }
  }, [profileId]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const addTip = useCallback((tip: Omit<TipRecord, "id" | "createdAt">) => {
    const entry: TipRecord = {
      ...tip,
      id: generateId("tip"),
      createdAt: new Date().toISOString(),
    };
    setTips((prev) => {
      const next = [entry, ...prev];
      writeJson(TIPS_KEY, next);
      return next;
    });
    return entry;
  }, []);

  return { tips, addTip, refresh };
}

export async function registerUser(input: {
  name: string;
  phone: string;
  workplaceId?: string;
}): Promise<SessionUser> {
  try {
    return await apiCreateEmployeeWallet(input);
  } catch (error) {
    if (isApiUnavailableError(error)) {
      return registerUserLocal(input);
    }
    throw error;
  }
}

export function createCustomerSession(name: string): SessionUser {
  return createCustomerSessionLocal(name);
}

export async function sendTipViaApi(input: {
  fromProfileId?: string | null;
  fromName: string;
  toProfileId: string;
  amountCents: number;
  npsScore?: number;
  workplaceId?: string;
  topUpCents?: number;
}) {
  try {
    return await apiSendTip(input);
  } catch (error) {
    if (isApiUnavailableError(error)) {
      return null;
    }
    throw error;
  }
}

export function getWalletTipUrl(employeeCode: string, origin = "https://taptipr.com"): string {
  return `${origin}/tip/e/${employeeCode}`;
}

export function lookupEmployeeLocal(code: string) {
  const registered = getRegisteredWalletByCode(code);
  if (registered) {
    return {
      id: registered.id,
      name: registered.name,
      employeeCode: registered.employeeCode,
      verified: registered.verified,
    };
  }
  const demo = getDemoEmployeeByCode(code);
  if (!demo) return null;
  return {
    id: demo.id,
    name: demo.name,
    employeeCode: demo.employeeCode,
    verified: demo.verified,
  };
}
