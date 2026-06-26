"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AppShell } from "@/components/app-shell";
import { TipQRCode } from "@/components/tip-qr-code";
import { Badge, Button, Card } from "@/components/ui";
import { DEMO_WORKPLACES } from "@/lib/demo-data";
import { useSession, useTipHistory } from "@/lib/session";
import { formatCurrency } from "@/lib/utils";
import { Building2, ShieldCheck } from "lucide-react";

export default function EmployeeDashboardPage() {
  const router = useRouter();
  const { user, loaded } = useSession();
  const { tips } = useTipHistory();

  const workplace = DEMO_WORKPLACES.find((w) => w.id === user?.workplaceId);
  const employeeTips = tips.filter((t) => t.toEmployeeName === user?.name);
  const totalEarned = employeeTips.reduce((sum, t) => sum + t.amountCents, 0);

  useEffect(() => {
    if (loaded && (!user || user.role !== "employee")) {
      router.replace("/register?role=employee");
    }
  }, [loaded, user, router]);

  if (!loaded || !user) {
    return (
      <AppShell title="Employee dashboard">
        <p className="text-sm text-stone-500">Loading…</p>
      </AppShell>
    );
  }

  const origin =
    typeof window !== "undefined" ? window.location.origin : "https://taptipr.com";
  const employeeUrl = `${origin}/tip/e/${user.employeeCode}`;

  return (
    <AppShell title="Employee dashboard" subtitle={user.name}>
      <div className="mb-4 flex flex-wrap gap-2">
        {user.verified ? (
          <Badge tone="success">
            <ShieldCheck className="mr-1 inline h-3 w-3" />
            Verified by employer
          </Badge>
        ) : (
          <Badge tone="warning">Pending employer verification</Badge>
        )}
        {workplace && (
          <Badge>
            {workplace.logoEmoji} {workplace.name}
          </Badge>
        )}
      </div>

      <Card className="mb-4 text-center">
        <p className="mb-1 text-sm text-stone-500">Show this to customers</p>
        <h2 className="mb-4 text-lg font-semibold">
          &ldquo;Scan to rate my service or leave a tip&rdquo;
        </h2>
        <TipQRCode value={employeeUrl} label={user.employeeCode} size={220} />
        <p className="mt-4 text-xs text-stone-500 break-all">{employeeUrl}</p>
      </Card>

      <div className="mb-4 grid grid-cols-2 gap-3">
        <Card>
          <p className="text-sm text-stone-500">Wallet balance</p>
          <p className="mt-1 text-2xl font-semibold text-emerald-700">
            {formatCurrency(user.walletBalanceCents + totalEarned)}
          </p>
        </Card>
        <Card>
          <p className="text-sm text-stone-500">Tips received</p>
          <p className="mt-1 text-2xl font-semibold">{employeeTips.length}</p>
        </Card>
      </div>

      {workplace && (
        <Card className="mb-4">
          <div className="flex items-start gap-3">
            <Building2 className="mt-0.5 h-5 w-5 text-emerald-700" />
            <div>
              <p className="font-medium">Generic business QR</p>
              <p className="mt-1 text-sm text-stone-600">
                Your location also has a shared code so customers can pick who served
                them.
              </p>
              <Link
                href={`/tip/b/${workplace.businessCode}`}
                className="mt-2 inline-block text-sm font-medium text-emerald-700"
              >
                Preview {workplace.name} flow →
              </Link>
            </div>
          </div>
        </Card>
      )}

      <section className="mb-4">
        <h3 className="mb-2 text-sm font-semibold text-stone-700">Recent tips</h3>
        {employeeTips.length === 0 ? (
          <Card>
            <p className="text-sm text-stone-500">
              No tips yet. Share your QR when you serve a customer.
            </p>
          </Card>
        ) : (
          <div className="space-y-2">
            {employeeTips.slice(0, 5).map((tip) => (
              <Card key={tip.id} className="flex items-center justify-between py-3">
                <div>
                  <p className="font-medium">{formatCurrency(tip.amountCents)}</p>
                  <p className="text-xs text-stone-500">
                    from {tip.fromName}
                    {tip.npsScore !== undefined ? ` · NPS ${tip.npsScore}` : ""}
                  </p>
                </div>
                <p className="text-xs text-stone-400">
                  {new Date(tip.createdAt).toLocaleDateString()}
                </p>
              </Card>
            ))}
          </div>
        )}
      </section>

      <Link href="/wallet">
        <Button variant="outline" className="w-full">
          Manage wallet & withdrawals
        </Button>
      </Link>
    </AppShell>
  );
}
