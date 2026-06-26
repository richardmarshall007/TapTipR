"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AppShell } from "@/components/app-shell";
import { Alert, Button, Card, Input, Label, Select } from "@/components/ui";
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
    <AppShell title="Initialize wallet">
      <Card glow>
        <p className="mb-4 text-sm leading-relaxed text-muted">
          Deploy your TapTipR wallet to receive digital tips. A unique QR address is
          generated instantly for customer scans.
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
            <Label>Workplace</Label>
            <Select
              value={workplaceId}
              onChange={(e) => setWorkplaceId(e.target.value)}
            >
              {DEMO_WORKPLACES.map((wp) => (
                <option key={wp.id} value={wp.id}>
                  {wp.logoEmoji} {wp.name}
                </option>
              ))}
            </Select>
            <p className="mt-2 text-xs text-dim">
              Employer verification unlocks a verified badge on your QR profile.
            </p>
          </div>

          <Button type="submit" className="w-full" size="lg" disabled={submitting}>
            {submitting ? "Generating wallet…" : "Create your digital Wallet"}
          </Button>
        </form>
        {error && <Alert tone="error" className="mt-3 mb-0">{error}</Alert>}
      </Card>

      <p className="mt-4 text-center font-mono text-[10px] uppercase tracking-widest text-dim">
        Testnet · No real payments yet
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
