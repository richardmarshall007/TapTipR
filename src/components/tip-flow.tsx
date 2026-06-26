"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { AppShell } from "@/components/app-shell";
import type { SessionUser } from "@/lib/types";
import type { Workplace } from "@/lib/types";
import { Badge, Button, Card, Input, Alert } from "@/components/ui";
import {
  apiLookupEmployeeByCode,
  apiLookupWorkplaceByCode,
  apiSendTip,
  isApiUnavailableError,
} from "@/lib/api/client";
import {
  getDemoEmployeeByCode,
  getEmployeesForWorkplace,
  getWorkplaceByCode,
} from "@/lib/demo-data";
import {
  createCustomerSession,
  creditRegisteredWallet,
  sendTipViaApi,
  useSession,
} from "@/lib/session";
import { formatCurrency } from "@/lib/utils";
import { CheckCircle2, Star } from "lucide-react";

type Step = "intro" | "employee" | "rating" | "amount" | "topup" | "success" | "loading";

type EmployeeOption = {
  id: string;
  name: string;
  employeeCode: string;
  verified: boolean;
};

const TIP_PRESETS = [300, 500, 1000, 1500, 2000];

export function TipFlowClient({
  mode,
  code,
}: {
  mode: "employee" | "business";
  code: string;
}) {
  const { user, setUser, updateBalance, loaded } = useSession();

  const [step, setStep] = useState<Step>("loading");
  const [employeeMatch, setEmployeeMatch] = useState<
    (EmployeeOption & { workplace: Workplace }) | null
  >(null);
  const [workplaceMatch, setWorkplaceMatch] = useState<Workplace | null>(null);
  const [employeesOnShift, setEmployeesOnShift] = useState<EmployeeOption[]>([]);
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string | null>(null);
  const [npsScore, setNpsScore] = useState<number | null>(null);
  const [skipRating, setSkipRating] = useState(false);
  const [tipCents, setTipCents] = useState(500);
  const [customTip, setCustomTip] = useState("");
  const [guestName, setGuestName] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      setError(null);

      if (mode === "employee") {
        try {
          const employee = await apiLookupEmployeeByCode(code);
          if (employee) {
            setEmployeeMatch({
              id: employee.id,
              name: employee.name,
              employeeCode: employee.employeeCode,
              verified: employee.verified,
              workplace: {
                id: employee.workplace.id,
                name: employee.workplace.name,
                slug: employee.workplace.slug,
                businessCode: employee.workplace.businessCode,
                logoEmoji: employee.workplace.logoEmoji,
              },
            });
            setWorkplaceMatch({
              id: employee.workplace.id,
              name: employee.workplace.name,
              slug: employee.workplace.slug,
              businessCode: employee.workplace.businessCode,
              logoEmoji: employee.workplace.logoEmoji,
            });
            setSelectedEmployeeId(employee.id);
            setStep("intro");
            return;
          }
        } catch (err) {
          if (!isApiUnavailableError(err)) {
            setError(err instanceof Error ? err.message : "Failed to load employee");
            setStep("intro");
            return;
          }
        }

        const demo = getDemoEmployeeByCode(code);
        if (demo) {
          setEmployeeMatch(demo);
          setWorkplaceMatch(demo.workplace);
          setSelectedEmployeeId(demo.id);
          setStep("intro");
          return;
        }

        setStep("intro");
        return;
      }

      try {
        const result = await apiLookupWorkplaceByCode(code);
        if (result) {
          setWorkplaceMatch({
            id: result.workplace.id,
            name: result.workplace.name,
            slug: result.workplace.slug,
            businessCode: result.workplace.businessCode,
            logoEmoji: result.workplace.logoEmoji,
          });
          setEmployeesOnShift(result.employees);
          setStep("employee");
          return;
        }
      } catch (err) {
        if (!isApiUnavailableError(err)) {
          setError(err instanceof Error ? err.message : "Failed to load workplace");
          setStep("employee");
          return;
        }
      }

      const demoWorkplace = getWorkplaceByCode(code);
      if (demoWorkplace) {
        setWorkplaceMatch(demoWorkplace);
        setEmployeesOnShift(getEmployeesForWorkplace(demoWorkplace.id));
        setStep("employee");
        return;
      }

      setStep("employee");
    }

    load();
  }, [mode, code]);

  const selectedEmployee =
    employeeMatch ??
    employeesOnShift.find((e) => e.id === selectedEmployeeId) ??
    null;

  if (step === "loading") {
    return (
      <AppShell title="Send a tip">
        <Card>
          <p className="font-mono text-sm text-dim">Loading tip page…</p>
        </Card>
      </AppShell>
    );
  }

  if (!workplaceMatch && !employeeMatch) {
    return (
      <AppShell title="Invalid code">
        <Card>
          <p className="text-muted">This QR code is not recognized.</p>
          <Link href="/" className="mt-4 inline-block">
            <Button>Back home</Button>
          </Link>
        </Card>
      </AppShell>
    );
  }

  const displayName = selectedEmployee?.name ?? workplaceMatch?.name ?? "Team member";
  const workplaceName = workplaceMatch?.name ?? "Location";

  function ensureCustomerSession(): SessionUser {
    if (user && user.role === "customer") return user;
    const name = guestName.trim() || "Guest";
    const session = createCustomerSession(name);
    setUser(session);
    return session;
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

  async function completeTipLocal(amount: number, fromName: string, sender: SessionUser) {
    if (!selectedEmployee) return;

    await updateBalance(-amount, "tip_sent", `Tip to ${selectedEmployee.name}`);
    creditRegisteredWallet(selectedEmployee.id, amount);
    if (sender.id === user?.id) {
      const updated = { ...sender, walletBalanceCents: sender.walletBalanceCents - amount };
      setUser(updated);
    }
    setStep("success");
  }

  async function handleSendTip() {
    if (!selectedEmployee) return;
    setSubmitting(true);
    setError(null);

    const amount = selectedTipAmount();
    const currentUser = user?.role === "customer" ? user : ensureCustomerSession();

    try {
      const result = await sendTipViaApi({
        fromProfileId: currentUser.role === "customer" ? currentUser.id : null,
        fromName: currentUser.name,
        toProfileId: selectedEmployee.id,
        amountCents: amount,
        npsScore: skipRating ? undefined : npsScore ?? undefined,
        workplaceId: workplaceMatch?.id,
      });

      if (result === null) {
        if (currentUser.walletBalanceCents < amount) {
          setStep("topup");
          return;
        }
        await completeTipLocal(amount, currentUser.name, currentUser);
        return;
      }

      if (result.requiresTopUp) {
        setStep("topup");
        return;
      }

      if (result.sender) setUser(result.sender);
      setStep("success");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to send tip");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleTopUpAndTip() {
    if (!selectedEmployee) return;
    setSubmitting(true);
    setError(null);

    const amount = selectedTipAmount();
    const currentUser = user?.role === "customer" ? user : ensureCustomerSession();
    const deficit = amount - currentUser.walletBalanceCents;
    const topUp = Math.max(deficit, 1000);

    try {
      const result = await apiSendTip({
        fromProfileId: currentUser.role === "customer" ? currentUser.id : null,
        fromName: currentUser.name,
        toProfileId: selectedEmployee.id,
        amountCents: amount,
        npsScore: skipRating ? undefined : npsScore ?? undefined,
        workplaceId: workplaceMatch?.id,
        topUpCents: topUp,
      });

      if (result.sender) setUser(result.sender);
      setStep("success");
    } catch (err) {
      if (isApiUnavailableError(err)) {
        await updateBalance(topUp, "top_up", "Wallet top-up during tip (demo)");
        await completeTipLocal(amount, currentUser.name, {
          ...currentUser,
          walletBalanceCents: currentUser.walletBalanceCents + topUp,
        });
        return;
      }
      setError(err instanceof Error ? err.message : "Failed to send tip");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <AppShell title="Send a tip" subtitle={workplaceName}>
      {error && <Alert tone="error">{error}</Alert>}

      {!user && step !== "success" && (
        <Card className="mb-4">
          <p className="mb-2 text-sm text-muted">Your name (optional)</p>
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
              <h1 className="text-xl font-semibold text-white">{selectedEmployee.name}</h1>
              <p className="font-mono text-xs text-dim">{workplaceName}</p>
              {selectedEmployee.verified && (
                <Badge tone="success" className="mt-1">
                  Verified employee
                </Badge>
              )}
            </div>
          </div>
          <p className="mb-6 text-sm leading-relaxed text-muted">
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
          <h2 className="mb-1 text-lg font-semibold text-white">Who served you today?</h2>
          <p className="mb-4 text-sm text-muted">
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
                className="flex w-full items-center justify-between rounded-xl border border-zinc-700/80 bg-zinc-900/50 px-4 py-3 text-left transition hover:border-cyan-500/30 hover:bg-cyan-500/5"
              >
                <span className="font-medium text-zinc-100">{emp.name}</span>
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
          <h2 className="mb-1 text-lg font-semibold text-white">Rate your experience</h2>
          <p className="mb-4 text-sm text-muted">
            NPS: How likely are you to recommend {displayName} at {workplaceName}? (0–10)
          </p>
          <div className="mb-4 grid grid-cols-6 gap-2 sm:grid-cols-11">
            {Array.from({ length: 11 }, (_, i) => i).map((score) => (
              <button
                key={score}
                type="button"
                onClick={() => setNpsScore(score)}
                className={`flex h-10 items-center justify-center rounded-lg border font-mono text-sm font-medium transition ${
                  npsScore === score
                    ? "border-cyan-400 bg-cyan-500 text-black glow-accent"
                    : "border-zinc-700 text-zinc-400 hover:border-cyan-500/40"
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
          <h2 className="mb-1 text-lg font-semibold text-white">Choose tip amount</h2>
          <p className="mb-4 text-sm text-muted">
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
            <p className="mt-3 font-mono text-sm text-dim">
              Balance: {formatCurrency(user.walletBalanceCents)}
            </p>
          )}
          <Button
            className="mt-4 w-full"
            size="lg"
            onClick={handleSendTip}
            disabled={submitting}
          >
            {submitting ? "Sending…" : `Send ${formatCurrency(selectedTipAmount())} tip`}
          </Button>
        </Card>
      )}

      {step === "topup" && (
        <Card>
          <h2 className="mb-1 text-lg font-semibold text-white">Top up to complete tip</h2>
          <p className="mb-4 text-sm text-muted">
            Your balance is {formatCurrency(user?.walletBalanceCents ?? 0)}. Add funds
            with a card or bank transfer, then send your{" "}
            {formatCurrency(selectedTipAmount())} tip.
          </p>
          <div className="rounded-xl border border-zinc-700/80 bg-zinc-900/60 p-4 text-sm text-muted">
            <p className="font-medium text-zinc-200">Demo top-up</p>
            <p className="mt-1">
              Production uses Stripe Checkout. You can load more than the tip (e.g. $30
              balance, $10 tip).
            </p>
          </div>
          <Button
            className="mt-4 w-full"
            size="lg"
            onClick={handleTopUpAndTip}
            disabled={submitting}
          >
            {submitting ? "Processing…" : "Add funds & send tip"}
          </Button>
          <Link href="/wallet" className="mt-2 block">
            <Button variant="ghost" className="w-full">
              Manage wallet
            </Button>
          </Link>
        </Card>
      )}

      {step === "success" && (
        <Card className="text-center" glow>
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full border border-emerald-500/30 bg-emerald-500/10 text-emerald-400 glow-accent">
            <CheckCircle2 className="h-8 w-8" />
          </div>
          <h2 className="text-xl font-semibold text-white">Tip confirmed</h2>
          <p className="mt-2 font-mono text-sm text-muted">
            {formatCurrency(selectedTipAmount())} was sent to {displayName} at{" "}
            {workplaceName}.
          </p>
          {!skipRating && npsScore !== null && (
            <p className="mt-2 flex items-center justify-center gap-1 text-sm text-amber-400">
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
