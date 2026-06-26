"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { AppShell } from "@/components/app-shell";
import { Badge, Button, Card, Input, Label } from "@/components/ui";
import { DEMO_WORKPLACES } from "@/lib/demo-data";
import { registerUser, useSession } from "@/lib/session";

function RegisterForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, setUser, loaded } = useSession();

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [role, setRole] = useState<"customer" | "employee">(
    searchParams.get("role") === "employee" ? "employee" : "customer"
  );
  const [workplaceId, setWorkplaceId] = useState(DEMO_WORKPLACES[0].id);

  useEffect(() => {
    if (loaded && user) {
      router.replace(user.role === "employee" ? "/employee/dashboard" : "/wallet");
    }
  }, [loaded, user, router]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim() || !phone.trim()) return;

    const session = registerUser({
      name: name.trim(),
      phone: phone.trim(),
      role,
      workplaceId: role === "employee" ? workplaceId : undefined,
    });
    setUser(session);
    router.push(role === "employee" ? "/employee/dashboard" : "/wallet");
  }

  return (
    <AppShell title="Create account">
      <Card>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex gap-2 rounded-xl bg-stone-100 p-1">
            {(["customer", "employee"] as const).map((r) => (
              <button
                key={r}
                type="button"
                onClick={() => setRole(r)}
                className={`flex-1 rounded-lg py-2 text-sm font-medium transition ${
                  role === r
                    ? "bg-white text-emerald-800 shadow-sm"
                    : "text-stone-600"
                }`}
              >
                {r === "customer" ? "Send tips" : "Receive tips"}
              </button>
            ))}
          </div>

          <div>
            <Label>Full name</Label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Maria Santos"
              required
            />
          </div>

          <div>
            <Label>Phone number</Label>
            <Input
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+1 (555) 123-4567"
              type="tel"
              required
            />
          </div>

          {role === "employee" && (
            <div>
              <Label>Where do you work?</Label>
              <select
                value={workplaceId}
                onChange={(e) => setWorkplaceId(e.target.value)}
                className="h-11 w-full rounded-xl border border-stone-200 bg-white px-3 text-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
              >
                {DEMO_WORKPLACES.map((wp) => (
                  <option key={wp.id} value={wp.id}>
                    {wp.logoEmoji} {wp.name}
                  </option>
                ))}
              </select>
              <p className="mt-2 text-xs text-stone-500">
                Your employer can verify you later to show a verified badge to customers.
              </p>
            </div>
          )}

          <Button type="submit" className="w-full" size="lg">
            Create TapTipR account
          </Button>
        </form>
      </Card>

      <p className="mt-4 text-center text-xs text-stone-500">
        Prototype only — no real payments or SMS verification yet.
      </p>
    </AppShell>
  );
}

export default function RegisterPage() {
  return (
    <Suspense>
      <RegisterForm />
    </Suspense>
  );
}
