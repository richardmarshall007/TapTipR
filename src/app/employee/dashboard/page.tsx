"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AppShell } from "@/components/app-shell";
import { TipQRCode } from "@/components/tip-qr-code";
import {
  Badge,
  Button,
  Card,
  ListRow,
  SectionTitle,
  StatTile,
} from "@/components/ui";
import { DEMO_WORKPLACES } from "@/lib/demo-data";
import { getWalletTipUrl, useSession, useTipHistory } from "@/lib/session";
import { formatCurrency } from "@/lib/utils";
import { Building2, ShieldCheck } from "lucide-react";

export default function EmployeeDashboardPage() {
  const router = useRouter();
  const { user, loaded, refreshFromStorage } = useSession();
  const { tips, refresh } = useTipHistory(user?.id);

  const workplace = DEMO_WORKPLACES.find((w) => w.id === user?.workplaceId);
  const employeeTips = tips.filter(
    (t) => t.toEmployeeId === user?.id || t.toEmployeeName === user?.name
  );

  useEffect(() => {
    if (loaded && !user) {
      router.replace("/register");
    }
  }, [loaded, user, router]);

  useEffect(() => {
    refreshFromStorage();
    refresh();
  }, [tips, refreshFromStorage, refresh]);

  if (!loaded || !user) {
    return (
      <AppShell title="Your wallet">
        <p className="font-mono text-sm text-dim">Syncing…</p>
      </AppShell>
    );
  }

  if (!user.employeeCode) {
    return (
      <AppShell title="Your wallet">
        <Card glow>
          <p className="text-sm text-muted">
            Wallet address missing. Re-initialize to generate a QR code.
          </p>
          <Link href="/register" className="mt-4 inline-block">
            <Button>Create your digital Wallet</Button>
          </Link>
        </Card>
      </AppShell>
    );
  }

  const origin =
    typeof window !== "undefined" ? window.location.origin : "https://taptipr.com";
  const employeeUrl = getWalletTipUrl(user.employeeCode, origin);

  return (
    <AppShell title="Your wallet" subtitle={user.name}>
      <div className="mb-4 flex flex-wrap gap-2">
        {user.verified ? (
          <Badge tone="success">
            <ShieldCheck className="mr-1 inline h-3 w-3" />
            Verified
          </Badge>
        ) : (
          <Badge tone="warning">Unverified</Badge>
        )}
        {workplace && (
          <Badge tone="accent">
            {workplace.logoEmoji} {workplace.name}
          </Badge>
        )}
      </div>

      <Card className="mb-4 text-center" glow>
        <p className="mb-1 font-mono text-[10px] uppercase tracking-[0.25em] text-cyan-400/80">
          Receive address · QR
        </p>
        <h2 className="mb-4 text-sm text-muted">
          Customers scan to rate service and send tips
        </h2>
        <TipQRCode value={employeeUrl} label={user.employeeCode} size={220} />
        <p className="mt-4 break-all font-mono text-[10px] text-dim">{employeeUrl}</p>
      </Card>

      <div className="mb-4 grid grid-cols-2 gap-3">
        <StatTile
          label="Balance"
          value={formatCurrency(user.walletBalanceCents)}
          mono
        />
        <StatTile label="Tips in" value={String(employeeTips.length)} mono />
      </div>

      {workplace && (
        <Card className="mb-4">
          <div className="flex items-start gap-3">
            <Building2 className="mt-0.5 h-5 w-5 text-cyan-400" />
            <div>
              <p className="font-medium text-zinc-100">Business QR pool</p>
              <p className="mt-1 text-sm text-muted">
                Shared location code — customers pick who served them.
              </p>
              <Link
                href={`/tip/b/${workplace.businessCode}`}
                className="mt-2 inline-block font-mono text-xs text-cyan-400 hover:text-cyan-300"
              >
                Preview {workplace.businessCode} →
              </Link>
            </div>
          </div>
        </Card>
      )}

      <section className="mb-4">
        <SectionTitle>Recent tips</SectionTitle>
        {employeeTips.length === 0 ? (
          <Card>
            <p className="font-mono text-sm text-dim">
              No inbound tips. Share your QR to receive.
            </p>
          </Card>
        ) : (
          <div className="space-y-2">
            {employeeTips.slice(0, 5).map((tip) => (
              <ListRow key={tip.id} className="flex items-center justify-between py-3">
                <div>
                  <p className="font-mono font-semibold text-emerald-400 font-tabular">
                    {formatCurrency(tip.amountCents)}
                  </p>
                  <p className="font-mono text-[10px] text-dim">
                    from {tip.fromName}
                    {tip.npsScore !== undefined ? ` · NPS ${tip.npsScore}` : ""}
                  </p>
                </div>
                <p className="font-mono text-[10px] text-dim">
                  {new Date(tip.createdAt).toLocaleDateString()}
                </p>
              </ListRow>
            ))}
          </div>
        )}
      </section>

      <Link href="/wallet">
        <Button variant="outline" className="w-full">
          Open wallet dashboard
        </Button>
      </Link>
    </AppShell>
  );
}
