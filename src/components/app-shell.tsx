"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Home, QrCode, Wallet, UserCircle } from "lucide-react";

const links = [
  { href: "/", icon: Home, label: "Home" },
  { href: "/employee/dashboard", icon: QrCode, label: "My QR" },
  { href: "/wallet", icon: Wallet, label: "Wallet" },
  { href: "/register", icon: UserCircle, label: "Account" },
];

export function MobileNav() {
  const pathname = usePathname();
  if (pathname.startsWith("/tip/")) return null;

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-stone-200 bg-white/95 backdrop-blur md:hidden">
      <div className="mx-auto flex max-w-lg items-stretch justify-around px-2 pb-[env(safe-area-inset-bottom)]">
        {links.map(({ href, icon: Icon, label }) => {
          const active = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex flex-1 flex-col items-center gap-1 py-3 text-[11px] font-medium",
                active ? "text-emerald-700" : "text-stone-500"
              )}
            >
              <Icon className="h-5 w-5" />
              {label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

export function AppShell({
  children,
  title,
  subtitle,
}: {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
}) {
  return (
    <div className="min-h-full bg-[linear-gradient(180deg,#f0fdf4_0%,#fafaf9_28%)]">
      <header className="border-b border-emerald-100/80 bg-white/70 backdrop-blur">
        <div className="mx-auto flex max-w-lg items-center justify-between px-4 py-4">
          <div>
            <Link href="/" className="text-lg font-semibold tracking-tight text-emerald-900">
              TapTip<span className="text-emerald-600">R</span>
            </Link>
            {title && (
              <p className="mt-0.5 text-sm text-stone-500">
                {title}
                {subtitle ? ` · ${subtitle}` : ""}
              </p>
            )}
          </div>
          <span className="rounded-full bg-emerald-100 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-emerald-800">
            Prototype
          </span>
        </div>
      </header>
      <main className="mx-auto max-w-lg px-4 py-6 pb-28">{children}</main>
      <MobileNav />
    </div>
  );
}
