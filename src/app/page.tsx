import Link from "next/link";
import { AppShell } from "@/components/app-shell";
import { Badge, Button, Card } from "@/components/ui";
import { DEMO_EMPLOYEES, DEMO_WORKPLACES } from "@/lib/demo-data";
import { ArrowRight, Coffee, HeartHandshake, QrCode, Wallet } from "lucide-react";

export default function HomePage() {
  const demoEmployee = DEMO_EMPLOYEES[0];
  const demoWorkplace = DEMO_WORKPLACES[0];

  return (
    <AppShell>
      <section className="mb-8">
        <Badge tone="success" className="mb-3">
          Stored-value tipping wallet
        </Badge>
        <h1 className="text-3xl font-semibold tracking-tight text-stone-900">
          Tip service workers when there&apos;s no jar or terminal
        </h1>
        <p className="mt-3 text-base leading-relaxed text-stone-600">
          Employees share a QR code. Customers scan, optionally rate their experience,
          load a TapTipR wallet, and send a digital tip in seconds.
        </p>
        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
          <Link href="/register?role=employee" className="flex-1">
            <Button className="w-full" size="lg">
              I receive tips
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
          <Link href={`/tip/e/${demoEmployee.employeeCode}`} className="flex-1">
            <Button variant="secondary" className="w-full" size="lg">
              Try demo tip flow
            </Button>
          </Link>
        </div>
      </section>

      <section className="mb-8 grid gap-3">
        <Card className="flex gap-4">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700">
            <QrCode className="h-5 w-5" />
          </div>
          <div>
            <h2 className="font-semibold text-stone-900">Employee or business QR</h2>
            <p className="mt-1 text-sm text-stone-600">
              Personal code for waitstaff and baristas, or a generic code for the whole
              location.
            </p>
          </div>
        </Card>
        <Card className="flex gap-4">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700">
            <HeartHandshake className="h-5 w-5" />
          </div>
          <div>
            <h2 className="font-semibold text-stone-900">Rate & tip</h2>
            <p className="mt-1 text-sm text-stone-600">
              Optional NPS rating, preset amounts, and wallet top-up when balance is low.
            </p>
          </div>
        </Card>
        <Card className="flex gap-4">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700">
            <Wallet className="h-5 w-5" />
          </div>
          <div>
            <h2 className="font-semibold text-stone-900">Spend or withdraw</h2>
            <p className="mt-1 text-sm text-stone-600">
              Employees keep tips in TapTipR, spend at merchants, or transfer to bank via
              Visa Direct.
            </p>
          </div>
        </Card>
      </section>

      <section>
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-stone-500">
          Demo scan links
        </h2>
        <div className="grid gap-3">
          <Link href={`/tip/e/${demoEmployee.employeeCode}`}>
            <Card className="transition hover:border-emerald-300 hover:shadow-md">
              <div className="flex items-center gap-3">
                <Coffee className="h-5 w-5 text-emerald-700" />
                <div>
                  <p className="font-medium">{demoEmployee.name}</p>
                  <p className="text-sm text-stone-500">
                    Employee QR · {demoWorkplace.name}
                  </p>
                </div>
              </div>
            </Card>
          </Link>
          <Link href={`/tip/b/${demoWorkplace.businessCode}`}>
            <Card className="transition hover:border-emerald-300 hover:shadow-md">
              <div className="flex items-center gap-3">
                <span className="text-xl">{demoWorkplace.logoEmoji}</span>
                <div>
                  <p className="font-medium">{demoWorkplace.name}</p>
                  <p className="text-sm text-stone-500">Generic business QR</p>
                </div>
              </div>
            </Card>
          </Link>
        </div>
      </section>
    </AppShell>
  );
}
