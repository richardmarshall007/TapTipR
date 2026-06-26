import Link from "next/link";
import { AppShell } from "@/components/app-shell";
import { Button, Card } from "@/components/ui";
import { DEMO_EMPLOYEES, DEMO_WORKPLACES } from "@/lib/demo-data";
import { ArrowRight, Coffee } from "lucide-react";

export default function HomePage() {
  const demoEmployee = DEMO_EMPLOYEES[0];
  const demoWorkplace = DEMO_WORKPLACES[0];

  return (
    <AppShell>
      <section className="mb-10">
        <h1 className="text-3xl font-semibold tracking-tight text-stone-900">
          Welcome to TapTipR!
        </h1>
        <p className="mt-4 text-base leading-relaxed text-stone-600">
          A digital wallet that allows you to earn and be recognized for your great
          service. Simply create an account and start earning digital tips today.
        </p>
        <Link href="/register" className="mt-6 block">
          <Button className="w-full" size="lg">
            Create your digital Wallet
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </Link>
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
