"use client";

import { useCallback, useEffect, useState } from "react";
import type { SessionUser, TipRecord, WalletTransaction } from "./types";
import { generateId } from "./utils";

const SESSION_KEY = "taptipr_session";
const TIPS_KEY = "taptipr_tips";
const TX_KEY = "taptipr_transactions";

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

export function useSession() {
  const [user, setUserState] = useState<SessionUser | null>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    setUserState(readJson<SessionUser | null>(SESSION_KEY, null));
    setLoaded(true);
  }, []);

  const setUser = useCallback((next: SessionUser | null) => {
    setUserState(next);
    if (next) writeJson(SESSION_KEY, next);
    else localStorage.removeItem(SESSION_KEY);
  }, []);

  const updateBalance = useCallback((deltaCents: number) => {
    setUserState((prev) => {
      if (!prev) return prev;
      const updated = {
        ...prev,
        walletBalanceCents: Math.max(0, prev.walletBalanceCents + deltaCents),
      };
      writeJson(SESSION_KEY, updated);
      return updated;
    });
  }, []);

  return { user, setUser, updateBalance, loaded };
}

export function useWalletHistory() {
  const [transactions, setTransactions] = useState<WalletTransaction[]>([]);

  useEffect(() => {
    setTransactions(readJson<WalletTransaction[]>(TX_KEY, []));
  }, []);

  const addTransaction = useCallback((tx: Omit<WalletTransaction, "id" | "createdAt">) => {
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
  }, []);

  return { transactions, addTransaction };
}

export function useTipHistory() {
  const [tips, setTips] = useState<TipRecord[]>([]);

  useEffect(() => {
    setTips(readJson<TipRecord[]>(TIPS_KEY, []));
  }, []);

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

  return { tips, addTip };
}

export function registerUser(input: {
  name: string;
  phone: string;
  role: SessionUser["role"];
  workplaceId?: string;
}): SessionUser {
  const employeeCode =
    input.role === "employee"
      ? `${input.name.split(" ")[0].toUpperCase().slice(0, 5)}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`
      : undefined;

  return {
    id: generateId("user"),
    name: input.name,
    phone: input.phone,
    role: input.role,
    walletBalanceCents: input.role === "customer" ? 0 : 0,
    workplaceId: input.workplaceId,
    employeeCode,
    verified: false,
  };
}
