"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Home, QrCode, Wallet, UserCircle } from "lucide-react";

const links = [
  { href: "/", icon: Home, label: "Home" },
  { href: "/employee/dashboard", icon: QrCode, label: "QR" },
  { href: "/wallet", icon: Wallet, label: "Wallet" },
  { href: "/register", icon: UserCircle, label: "Account" },
];

export function MobileNav() {
  const pathname = usePathname();
  if (pathname.startsWith("/tip/")) return null;

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-zinc-800/80 bg-zinc-950/90 backdrop-blur-xl md:hidden">
      <div className="mx-auto flex max-w-lg items-stretch justify-around px-2 pb-[env(safe-area-inset-bottom)]">
        {links.map(({ href, icon: Icon, label }) => {
          const active = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex flex-1 flex-col items-center gap-1 py-3 text-[10px] font-medium uppercase tracking-wider",
                active ? "text-cyan-400" : "text-zinc-500"
              )}
            >
              <Icon className={cn("h-5 w-5", active && "drop-shadow-[0_0_8px_rgba(34,211,238,0.6)]")} />
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
    <div className="relative min-h-full crypto-bg">
      <div className="crypto-grid-overlay" />
      <header className="relative z-10 border-b border-zinc-800/80 bg-zinc-950/60 backdrop-blur-xl">
        <div className="mx-auto flex max-w-lg items-center justify-between px-4 py-4">
          <div>
            <Link
              href="/"
              className="flex items-center gap-2 text-lg font-semibold tracking-tight text-white"
            >
              <span className="flex h-8 w-8 items-center justify-center rounded-lg border border-cyan-500/30 bg-cyan-500/10 font-mono text-xs text-cyan-400 glow-accent">
                T
              </span>
              TapTip<span className="text-cyan-400">R</span>
            </Link>
            {title && (
              <p className="mt-1 font-mono text-[11px] uppercase tracking-wider text-zinc-500">
                {title}
                {subtitle ? ` · ${subtitle}` : ""}
              </p>
            )}
          </div>
          <span className="rounded-full border border-cyan-500/20 bg-cyan-500/10 px-2.5 py-1 font-mono text-[9px] font-semibold uppercase tracking-widest text-cyan-400">
            v0.1
          </span>
        </div>
      </header>
      <main className="relative z-10 mx-auto max-w-lg px-4 py-6 pb-28">{children}</main>
      <MobileNav />
    </div>
  );
}
