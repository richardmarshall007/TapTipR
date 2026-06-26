import Link from "next/link";
import { AppShell } from "@/components/app-shell";
import { Badge, Button, Card, SectionTitle } from "@/components/ui";
import { DEMO_EMPLOYEES, DEMO_WORKPLACES } from "@/lib/demo-data";
import { ArrowRight, Coffee, ScanLine, Wallet } from "lucide-react";

export default function HomePage() {
  const demoEmployee = DEMO_EMPLOYEES[0];
  const demoWorkplace = DEMO_WORKPLACES[0];

  return (
    <AppShell>
      <section className="mb-10">
        <Badge tone="accent" className="mb-4">
          Digital tip wallet
        </Badge>
        <h1 className="text-3xl font-semibold tracking-tight text-white">
          Welcome to TapTipR
        </h1>
        <p className="mt-4 text-base leading-relaxed text-muted">
          A digital wallet that allows you to earn and be recognized for your great
          service. Create your wallet, share your QR, and start receiving tips on-chain
          style — instantly.
        </p>
        <Link href="/register" className="mt-6 block">
          <Button className="w-full" size="lg">
            Create your digital Wallet
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </Link>
      </section>

      <section className="mb-8 grid grid-cols-2 gap-3">
        <Card className="py-4">
          <ScanLine className="mb-2 h-5 w-5 text-cyan-400" />
          <p className="text-sm font-medium text-zinc-200">Scan & tip</p>
          <p className="mt-1 text-xs text-dim">QR-powered payouts</p>
        </Card>
        <Card className="py-4">
          <Wallet className="mb-2 h-5 w-5 text-cyan-400" />
          <p className="text-sm font-medium text-zinc-200">Stored value</p>
          <p className="mt-1 text-xs text-dim">Top up · send · withdraw</p>
        </Card>
      </section>

      <section>
        <SectionTitle>Demo scan links</SectionTitle>
        <div className="grid gap-3">
          <Link href={`/tip/e/${demoEmployee.employeeCode}`}>
            <Card className="transition hover:border-cyan-500/30 hover:glow-accent">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-cyan-500/20 bg-cyan-500/10">
                  <Coffee className="h-5 w-5 text-cyan-400" />
                </div>
                <div>
                  <p className="font-medium text-zinc-100">{demoEmployee.name}</p>
                  <p className="font-mono text-xs text-dim">
                    {demoEmployee.employeeCode} · {demoWorkplace.name}
                  </p>
                </div>
              </div>
            </Card>
          </Link>
          <Link href={`/tip/b/${demoWorkplace.businessCode}`}>
            <Card className="transition hover:border-cyan-500/30 hover:glow-accent">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-cyan-500/20 bg-cyan-500/10 text-lg">
                  {demoWorkplace.logoEmoji}
                </div>
                <div>
                  <p className="font-medium text-zinc-100">{demoWorkplace.name}</p>
                  <p className="font-mono text-xs text-dim">{demoWorkplace.businessCode}</p>
                </div>
              </div>
            </Card>
          </Link>
        </div>
      </section>
    </AppShell>
  );
}
