"use client";

import { useState } from "react";
import Link from "next/link";
import { AppShell } from "@/components/app-shell";
import {
  Alert,
  Badge,
  BalanceCard,
  Button,
  Card,
  Input,
  Label,
  ListRow,
  SectionTitle,
} from "@/components/ui";
import { useSession, useWalletHistory } from "@/lib/session";
import { formatCurrency } from "@/lib/utils";
import { ArrowDownToLine, CreditCard, Plus } from "lucide-react";

const TOP_UP_PRESETS = [1000, 2000, 3000, 5000];

export default function WalletPage() {
  const { user, setUser, updateBalance, loaded } = useSession();
  const { transactions, refresh } = useWalletHistory(user?.id);
  const [topUpAmount, setTopUpAmount] = useState("3000");
  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [message, setMessage] = useState<string | null>(null);

  async function handleTopUp(amountCents: number) {
    if (!user) return;
    await updateBalance(amountCents, "top_up", "Wallet top-up (demo card)");
    await refresh();
    setMessage(`Added ${formatCurrency(amountCents)} to your wallet.`);
  }

  async function handleWithdraw() {
    if (!user) return;
    const cents = Math.round(parseFloat(withdrawAmount) * 100);
    if (!cents || cents <= 0 || cents > user.walletBalanceCents) {
      setMessage("Enter a valid amount within your balance.");
      return;
    }
    await updateBalance(-cents, "withdraw", "Bank transfer (Visa Direct demo)");
    await refresh();
    setWithdrawAmount("");
    setMessage(`Withdrew ${formatCurrency(cents)} to linked bank account.`);
  }

  function handleSignOut() {
    setUser(null);
    setMessage("Signed out.");
  }

  if (!loaded) {
    return (
      <AppShell title="Wallet">
        <p className="font-mono text-sm text-dim">Syncing wallet…</p>
      </AppShell>
    );
  }

  if (!user) {
    return (
      <AppShell title="Wallet">
        <Card className="text-center" glow>
          <p className="mb-4 text-muted">
            Connect your wallet to load funds and send tips.
          </p>
          <Link href="/register">
            <Button className="w-full">Initialize wallet</Button>
          </Link>
        </Card>
      </AppShell>
    );
  }

  return (
    <AppShell title="Wallet" subtitle={user.name}>
      <BalanceCard label="Available balance" amount={formatCurrency(user.walletBalanceCents)}>
        <Badge tone="accent">Demo net</Badge>
        {user.role === "employee" && <Badge tone="success">Receiver</Badge>}
      </BalanceCard>

      {message && <Alert>{message}</Alert>}

      <Card className="mb-4">
        <div className="mb-3 flex items-center gap-2">
          <Plus className="h-4 w-4 text-cyan-400" />
          <h2 className="font-medium text-zinc-100">Top up</h2>
        </div>
        <p className="mb-4 text-sm text-muted">
          Link a card or bank account once, then add funds anytime.
        </p>
        <div className="mb-4 grid grid-cols-2 gap-2">
          {TOP_UP_PRESETS.map((cents) => (
            <Button key={cents} variant="secondary" onClick={() => handleTopUp(cents)}>
              {formatCurrency(cents)}
            </Button>
          ))}
        </div>
        <div className="flex gap-2">
          <Input
            type="number"
            min="1"
            step="0.01"
            value={(parseInt(topUpAmount, 10) / 100).toFixed(2)}
            onChange={(e) =>
              setTopUpAmount(String(Math.round(parseFloat(e.target.value || "0") * 100)))
            }
            placeholder="0.00"
          />
          <Button onClick={() => handleTopUp(parseInt(topUpAmount, 10) || 0)}>Add</Button>
        </div>
        <p className="mt-3 flex items-center gap-1.5 text-xs text-dim">
          <CreditCard className="h-3.5 w-3.5" />
          Stripe Checkout in production
        </p>
      </Card>

      {user.role === "employee" && (
        <Card className="mb-4">
          <div className="mb-3 flex items-center gap-2">
            <ArrowDownToLine className="h-4 w-4 text-cyan-400" />
            <h2 className="font-medium text-zinc-100">Withdraw</h2>
          </div>
          <Label>Amount</Label>
          <div className="mt-1.5 flex gap-2">
            <Input
              type="number"
              min="0"
              step="0.01"
              value={withdrawAmount}
              onChange={(e) => setWithdrawAmount(e.target.value)}
              placeholder="0.00"
            />
            <Button variant="outline" onClick={handleWithdraw}>
              Send
            </Button>
          </div>
          <p className="mt-3 text-xs text-dim">Visa Direct · ACH via Stripe Connect</p>
        </Card>
      )}

      <section className="mb-6">
        <SectionTitle>Transaction log</SectionTitle>
        {transactions.length === 0 ? (
          <Card>
            <p className="font-mono text-sm text-dim">No transactions yet.</p>
          </Card>
        ) : (
          <div className="space-y-2">
            {transactions.slice(0, 8).map((tx) => (
              <ListRow key={tx.id} className="flex items-center justify-between py-3">
                <div>
                  <p className="text-sm font-medium text-zinc-200">{tx.label}</p>
                  <p className="font-mono text-[10px] text-dim">
                    {new Date(tx.createdAt).toLocaleString()}
                  </p>
                </div>
                <p
                  className={`font-mono text-sm font-semibold font-tabular ${
                    tx.amountCents >= 0 ? "text-emerald-400" : "text-zinc-400"
                  }`}
                >
                  {tx.amountCents >= 0 ? "+" : ""}
                  {formatCurrency(tx.amountCents)}
                </p>
              </ListRow>
            ))}
          </div>
        )}
      </section>

      <Button variant="ghost" className="w-full" onClick={handleSignOut}>
        Disconnect wallet
      </Button>
    </AppShell>
  );
}
