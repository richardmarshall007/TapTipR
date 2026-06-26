"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AppShell } from "@/components/app-shell";
import { Badge, Button, Card, Input } from "@/components/ui";
import {
  getEmployeeByCode,
  getEmployeesForWorkplace,
  getWorkplaceByCode,
} from "@/lib/demo-data";
import {
  registerUser,
  useSession,
  useTipHistory,
  useWalletHistory,
} from "@/lib/session";
import { formatCurrency } from "@/lib/utils";
import { CheckCircle2, Star } from "lucide-react";

type Step = "intro" | "employee" | "rating" | "amount" | "topup" | "success";

const TIP_PRESETS = [300, 500, 1000, 1500, 2000];

export function TipFlowClient({
  mode,
  code,
}: {
  mode: "employee" | "business";
  code: string;
}) {
  const router = useRouter();
  const { user, setUser, updateBalance, loaded } = useSession();
  const { addTip } = useTipHistory();
  const { addTransaction } = useWalletHistory();

  const employeeMatch = mode === "employee" ? getEmployeeByCode(code) : undefined;
  const workplaceMatch =
    mode === "business" ? getWorkplaceByCode(code) : employeeMatch?.workplace;

  const [step, setStep] = useState<Step>(mode === "business" ? "employee" : "intro");
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string | null>(
    employeeMatch?.id ?? null
  );
  const [npsScore, setNpsScore] = useState<number | null>(null);
  const [skipRating, setSkipRating] = useState(false);
  const [tipCents, setTipCents] = useState(500);
  const [customTip, setCustomTip] = useState("");
  const [guestName, setGuestName] = useState("");

  const employeesOnShift = useMemo(() => {
    if (!workplaceMatch) return [];
    return getEmployeesForWorkplace(workplaceMatch.id);
  }, [workplaceMatch]);

  const selectedEmployee =
    employeeMatch ??
    employeesOnShift.find((e) => e.id === selectedEmployeeId) ??
    null;

  if (!workplaceMatch && !employeeMatch) {
    return (
      <AppShell title="Invalid code">
        <Card>
          <p className="text-stone-600">This QR code is not recognized.</p>
          <Link href="/" className="mt-4 inline-block">
            <Button>Back home</Button>
          </Link>
        </Card>
      </AppShell>
    );
  }

  const displayName = selectedEmployee?.name ?? workplaceMatch?.name ?? "Team member";
  const workplaceName = workplaceMatch?.name ?? "Location";

  function ensureCustomerSession(): boolean {
    if (user) return true;
    const name = guestName.trim() || "Guest";
    const session = registerUser({
      name,
      phone: "demo",
      role: "customer",
    });
    setUser(session);
    return true;
  }

  function proceedToAmount() {
    setStep("amount");
  }

  function selectedTipAmount(): number {
    if (customTip) {
      const parsed = Math.round(parseFloat(customTip) * 100);
      return parsed > 0 ? parsed : tipCents;
    }
    return tipCents;
  }

  function handleSendTip() {
    if (!selectedEmployee) return;
    ensureCustomerSession();

    const amount = selectedTipAmount();
    const currentUser = user ?? registerUser({ name: guestName || "Guest", phone: "demo", role: "customer" });

    if (currentUser.walletBalanceCents < amount) {
      setStep("topup");
      return;
    }

    completeTip(amount, currentUser.name);
  }

  function completeTip(amount: number, fromName: string) {
    if (!selectedEmployee) return;

    updateBalance(-amount);
    addTransaction({
      type: "tip_sent",
      amountCents: -amount,
      label: `Tip to ${selectedEmployee.name}`,
    });
    addTip({
      fromName,
      toEmployeeId: selectedEmployee.id,
      toEmployeeName: selectedEmployee.name,
      workplaceName,
      amountCents: amount,
      npsScore: skipRating ? undefined : npsScore ?? undefined,
    });
    setStep("success");
  }

  function handleTopUpAndTip() {
    const amount = selectedTipAmount();
    const deficit = amount - (user?.walletBalanceCents ?? 0);
    const topUp = Math.max(deficit, 1000);
    updateBalance(topUp);
    addTransaction({
      type: "top_up",
      amountCents: topUp,
      label: "Wallet top-up during tip (demo)",
    });
    completeTip(amount, (user?.name ?? guestName) || "Guest");
  }

  return (
    <AppShell title="Send a tip" subtitle={workplaceName}>
      {!user && step !== "success" && (
        <Card className="mb-4">
          <p className="mb-2 text-sm text-stone-600">Your name (optional)</p>
          <Input
            value={guestName}
            onChange={(e) => setGuestName(e.target.value)}
            placeholder="Alex"
          />
        </Card>
      )}

      {step === "intro" && selectedEmployee && (
        <Card>
          <div className="mb-4 flex items-center gap-3">
            <span className="text-3xl">{workplaceMatch?.logoEmoji ?? "☕"}</span>
            <div>
              <h1 className="text-xl font-semibold">{selectedEmployee.name}</h1>
              <p className="text-sm text-stone-500">{workplaceName}</p>
              {selectedEmployee.verified && (
                <Badge tone="success" className="mt-1">
                  Verified employee
                </Badge>
              )}
            </div>
          </div>
          <p className="mb-6 text-sm leading-relaxed text-stone-600">
            Would you like to rate your service at {workplaceName}, or leave a tip for{" "}
            {selectedEmployee.name}?
          </p>
          <div className="grid gap-2">
            <Button size="lg" className="w-full" onClick={() => setStep("rating")}>
              Rate & tip
            </Button>
            <Button
              variant="secondary"
              size="lg"
              className="w-full"
              onClick={() => {
                setSkipRating(true);
                proceedToAmount();
              }}
            >
              Skip rating · Tip only
            </Button>
          </div>
        </Card>
      )}

      {step === "employee" && workplaceMatch && (
        <Card>
          <h2 className="mb-1 text-lg font-semibold">Who served you today?</h2>
          <p className="mb-4 text-sm text-stone-600">
            Select your barista or server at {workplaceMatch.name}.
          </p>
          <div className="space-y-2">
            {employeesOnShift.map((emp) => (
              <button
                key={emp.id}
                type="button"
                onClick={() => {
                  setSelectedEmployeeId(emp.id);
                  setStep("rating");
                }}
                className="flex w-full items-center justify-between rounded-xl border border-stone-200 px-4 py-3 text-left transition hover:border-emerald-300 hover:bg-emerald-50/50"
              >
                <span className="font-medium">{emp.name}</span>
                {emp.verified ? (
                  <Badge tone="success">Verified</Badge>
                ) : (
                  <Badge tone="warning">Unverified</Badge>
                )}
              </button>
            ))}
          </div>
          <Button
            variant="ghost"
            className="mt-3 w-full"
            onClick={() => {
              setSkipRating(true);
              setSelectedEmployeeId(employeesOnShift[0]?.id ?? null);
              proceedToAmount();
            }}
          >
            Skip · Tip the team
          </Button>
        </Card>
      )}

      {step === "rating" && (
        <Card>
          <h2 className="mb-1 text-lg font-semibold">Rate your experience</h2>
          <p className="mb-4 text-sm text-stone-600">
            NPS: How likely are you to recommend {displayName} at {workplaceName}? (0–10)
          </p>
          <div className="mb-4 grid grid-cols-6 gap-2 sm:grid-cols-11">
            {Array.from({ length: 11 }, (_, i) => i).map((score) => (
              <button
                key={score}
                type="button"
                onClick={() => setNpsScore(score)}
                className={`flex h-10 items-center justify-center rounded-lg border text-sm font-medium transition ${
                  npsScore === score
                    ? "border-emerald-600 bg-emerald-600 text-white"
                    : "border-stone-200 hover:border-emerald-300"
                }`}
              >
                {score}
              </button>
            ))}
          </div>
          <div className="grid gap-2">
            <Button
              className="w-full"
              disabled={npsScore === null}
              onClick={proceedToAmount}
            >
              Continue to tip
            </Button>
            <Button
              variant="ghost"
              className="w-full"
              onClick={() => {
                setSkipRating(true);
                proceedToAmount();
              }}
            >
              Skip rating
            </Button>
          </div>
        </Card>
      )}

      {step === "amount" && (
        <Card>
          <h2 className="mb-1 text-lg font-semibold">Choose tip amount</h2>
          <p className="mb-4 text-sm text-stone-600">
            Sending to {displayName}
            {!skipRating && npsScore !== null ? ` · You rated ${npsScore}/10` : ""}
          </p>
          <div className="mb-4 grid grid-cols-3 gap-2">
            {TIP_PRESETS.map((cents) => (
              <Button
                key={cents}
                variant={tipCents === cents && !customTip ? "primary" : "outline"}
                onClick={() => {
                  setTipCents(cents);
                  setCustomTip("");
                }}
              >
                {formatCurrency(cents)}
              </Button>
            ))}
          </div>
          <Input
            type="number"
            min="0.5"
            step="0.5"
            placeholder="Custom amount"
            value={customTip}
            onChange={(e) => setCustomTip(e.target.value)}
          />
          {loaded && user && (
            <p className="mt-3 text-sm text-stone-500">
              Wallet balance: {formatCurrency(user.walletBalanceCents)}
            </p>
          )}
          <Button className="mt-4 w-full" size="lg" onClick={handleSendTip}>
            Send {formatCurrency(selectedTipAmount())} tip
          </Button>
        </Card>
      )}

      {step === "topup" && (
        <Card>
          <h2 className="mb-1 text-lg font-semibold">Top up to complete tip</h2>
          <p className="mb-4 text-sm text-stone-600">
            Your balance is {formatCurrency(user?.walletBalanceCents ?? 0)}. Add funds
            with a card or bank transfer, then send your{" "}
            {formatCurrency(selectedTipAmount())} tip.
          </p>
          <div className="rounded-xl bg-stone-50 p-4 text-sm text-stone-600">
            <p className="font-medium text-stone-800">Demo top-up</p>
            <p className="mt-1">
              Production uses Stripe Checkout. You can load more than the tip (e.g. $30
              balance, $10 tip).
            </p>
          </div>
          <Button className="mt-4 w-full" size="lg" onClick={handleTopUpAndTip}>
            Add funds & send tip
          </Button>
          <Link href="/wallet" className="mt-2 block">
            <Button variant="ghost" className="w-full">
              Manage wallet
            </Button>
          </Link>
        </Card>
      )}

      {step === "success" && (
        <Card className="text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
            <CheckCircle2 className="h-8 w-8" />
          </div>
          <h2 className="text-xl font-semibold">Tip sent!</h2>
          <p className="mt-2 text-sm text-stone-600">
            {formatCurrency(selectedTipAmount())} was sent to {displayName} at{" "}
            {workplaceName}.
          </p>
          {!skipRating && npsScore !== null && (
            <p className="mt-2 flex items-center justify-center gap-1 text-sm text-amber-700">
              <Star className="h-4 w-4 fill-current" />
              NPS rating recorded: {npsScore}/10
            </p>
          )}
          <div className="mt-6 grid gap-2">
            <Link href="/">
              <Button className="w-full">Done</Button>
            </Link>
            <Link href="/wallet">
              <Button variant="secondary" className="w-full">
                View wallet
              </Button>
            </Link>
          </div>
        </Card>
      )}
    </AppShell>
  );
}
