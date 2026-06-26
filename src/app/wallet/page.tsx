"use client";

import { useState } from "react";
import Link from "next/link";
import { AppShell } from "@/components/app-shell";
import { Badge, Button, Card, Input, Label } from "@/components/ui";
import { useSession, useWalletHistory } from "@/lib/session";
import { formatCurrency } from "@/lib/utils";
import { ArrowDownToLine, CreditCard, Plus } from "lucide-react";

const TOP_UP_PRESETS = [1000, 2000, 3000, 5000];

export default function WalletPage() {
  const { user, setUser, updateBalance, loaded } = useSession();
  const { transactions, addTransaction } = useWalletHistory();
  const [topUpAmount, setTopUpAmount] = useState("3000");
  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [message, setMessage] = useState<string | null>(null);

  function handleTopUp(amountCents: number) {
    if (!user) return;
    updateBalance(amountCents);
    addTransaction({
      type: "top_up",
      amountCents,
      label: "Wallet top-up (demo card)",
    });
    setMessage(`Added ${formatCurrency(amountCents)} to your wallet.`);
  }

  function handleWithdraw() {
    if (!user) return;
    const cents = Math.round(parseFloat(withdrawAmount) * 100);
    if (!cents || cents <= 0 || cents > user.walletBalanceCents) {
      setMessage("Enter a valid amount within your balance.");
      return;
    }
    updateBalance(-cents);
    addTransaction({
      type: "withdraw",
      amountCents: -cents,
      label: "Bank transfer (Visa Direct demo)",
    });
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
        <p className="text-sm text-stone-500">Loading…</p>
      </AppShell>
    );
  }

  if (!user) {
    return (
      <AppShell title="Wallet">
        <Card className="text-center">
          <p className="mb-4 text-stone-600">
            Sign in or create an account to load funds and send tips.
          </p>
          <Link href="/register">
            <Button className="w-full">Create account</Button>
          </Link>
        </Card>
      </AppShell>
    );
  }

  return (
    <AppShell title="Wallet" subtitle={user.name}>
      <Card className="mb-4 bg-gradient-to-br from-emerald-700 to-emerald-900 text-white">
        <p className="text-sm text-emerald-100">Available balance</p>
        <p className="mt-1 text-4xl font-semibold tracking-tight">
          {formatCurrency(user.walletBalanceCents)}
        </p>
        <div className="mt-4 flex gap-2">
          <Badge className="bg-white/15 text-white">Demo mode</Badge>
          {user.role === "employee" && (
            <Badge className="bg-white/15 text-white">Tip receiver</Badge>
          )}
        </div>
      </Card>

      {message && (
        <div className="mb-4 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
          {message}
        </div>
      )}

      <Card className="mb-4">
        <div className="mb-3 flex items-center gap-2">
          <Plus className="h-4 w-4 text-emerald-700" />
          <h2 className="font-semibold">Top up wallet</h2>
        </div>
        <p className="mb-4 text-sm text-stone-600">
          Link a card or bank account once, then add funds anytime. You can load more
          than your tip amount.
        </p>
        <div className="mb-4 grid grid-cols-2 gap-2">
          {TOP_UP_PRESETS.map((cents) => (
            <Button
              key={cents}
              variant="secondary"
              onClick={() => handleTopUp(cents)}
            >
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
            placeholder="Custom amount"
          />
          <Button onClick={() => handleTopUp(parseInt(topUpAmount, 10) || 0)}>
            Add
          </Button>
        </div>
        <p className="mt-3 flex items-center gap-1.5 text-xs text-stone-500">
          <CreditCard className="h-3.5 w-3.5" />
          Production: Stripe Checkout + saved payment methods
        </p>
      </Card>

      {user.role === "employee" && (
        <Card className="mb-4">
          <div className="mb-3 flex items-center gap-2">
            <ArrowDownToLine className="h-4 w-4 text-emerald-700" />
            <h2 className="font-semibold">Withdraw to bank</h2>
          </div>
          <Label>Amount to transfer</Label>
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
              Withdraw
            </Button>
          </div>
          <p className="mt-3 text-xs text-stone-500">
            Production: Visa Direct push-to-debit or ACH via Stripe Connect payouts.
          </p>
        </Card>
      )}

      <section className="mb-6">
        <h3 className="mb-2 text-sm font-semibold text-stone-700">Activity</h3>
        {transactions.length === 0 ? (
          <Card>
            <p className="text-sm text-stone-500">No transactions yet.</p>
          </Card>
        ) : (
          <div className="space-y-2">
            {transactions.slice(0, 8).map((tx) => (
              <Card key={tx.id} className="flex items-center justify-between py-3">
                <div>
                  <p className="text-sm font-medium">{tx.label}</p>
                  <p className="text-xs text-stone-500">
                    {new Date(tx.createdAt).toLocaleString()}
                  </p>
                </div>
                <p
                  className={`font-semibold ${
                    tx.amountCents >= 0 ? "text-emerald-700" : "text-stone-700"
                  }`}
                >
                  {tx.amountCents >= 0 ? "+" : ""}
                  {formatCurrency(tx.amountCents)}
                </p>
              </Card>
            ))}
          </div>
        )}
      </section>

      <Button variant="ghost" className="w-full" onClick={handleSignOut}>
        Sign out
      </Button>
    </AppShell>
  );
}
