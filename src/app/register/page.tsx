"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AppShell } from "@/components/app-shell";
import { Button, Card, Input, Label } from "@/components/ui";
import { DEMO_WORKPLACES } from "@/lib/demo-data";
import { registerUser, useSession } from "@/lib/session";

function RegisterForm() {
  const router = useRouter();
  const { user, setUser, loaded } = useSession();

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [workplaceId, setWorkplaceId] = useState(DEMO_WORKPLACES[0].id);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (loaded && user) {
      router.replace("/employee/dashboard");
    }
  }, [loaded, user, router]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim() || !phone.trim()) return;

    setSubmitting(true);
    setError(null);
    try {
      const session = await registerUser({
        name: name.trim(),
        phone: phone.trim(),
        workplaceId,
      });
      setUser(session);
      router.push("/employee/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not create wallet");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <AppShell title="Create your digital Wallet">
      <Card>
        <p className="mb-4 text-sm leading-relaxed text-stone-600">
          Set up your TapTipR wallet to earn digital tips. We&apos;ll generate your
          unique QR code right away so customers can scan and tip you.
        </p>
        <form onSubmit={handleSubmit} className="space-y-4">
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

          <Button type="submit" className="w-full" size="lg" disabled={submitting}>
            {submitting ? "Creating wallet…" : "Create your digital Wallet"}
          </Button>
        </form>
        {error && (
          <p className="mt-3 text-sm text-red-600">{error}</p>
        )}
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
