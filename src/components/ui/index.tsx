import { cn } from "@/lib/utils";
import { ButtonHTMLAttributes, forwardRef } from "react";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "ghost" | "outline";
  size?: "sm" | "md" | "lg";
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          "inline-flex items-center justify-center rounded-xl font-medium transition-all disabled:opacity-50 disabled:pointer-events-none",
          variant === "primary" &&
            "bg-gradient-to-r from-cyan-500 to-emerald-500 text-black hover:from-cyan-400 hover:to-emerald-400 glow-accent font-semibold",
          variant === "secondary" &&
            "border border-cyan-500/25 bg-cyan-500/10 text-cyan-300 hover:bg-cyan-500/15 hover:border-cyan-400/40",
          variant === "ghost" && "text-zinc-400 hover:bg-white/5 hover:text-zinc-200",
          variant === "outline" &&
            "border border-zinc-700/80 bg-zinc-900/50 text-zinc-200 hover:border-cyan-500/30 hover:bg-zinc-900",
          size === "sm" && "h-9 px-3 text-sm",
          size === "md" && "h-11 px-4 text-sm",
          size === "lg" && "h-12 px-6 text-base",
          className
        )}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export function Card({
  className,
  children,
  glow = false,
}: {
  className?: string;
  children: React.ReactNode;
  glow?: boolean;
}) {
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-2xl border border-zinc-800/80 bg-zinc-950/70 p-5 backdrop-blur-xl",
        glow && "glow-accent border-cyan-500/20",
        className
      )}
    >
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-cyan-500/[0.03] via-transparent to-emerald-500/[0.02]" />
      <div className="relative">{children}</div>
    </div>
  );
}

export function BalanceCard({
  label,
  amount,
  children,
  className,
}: {
  label: string;
  amount: string;
  children?: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "relative mb-4 overflow-hidden rounded-2xl border border-cyan-500/20 bg-gradient-to-br from-zinc-900 via-zinc-950 to-black p-6 glow-accent-strong",
        className
      )}
    >
      <div className="pointer-events-none absolute -right-8 -top-8 h-32 w-32 rounded-full bg-cyan-500/10 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-10 -left-6 h-28 w-28 rounded-full bg-emerald-500/10 blur-3xl" />
      <div className="relative">
        <p className="text-xs font-medium uppercase tracking-[0.2em] text-cyan-400/80">
          {label}
        </p>
        <p className="mt-2 font-mono text-4xl font-semibold tracking-tight text-white font-tabular">
          {amount}
        </p>
        {children && <div className="mt-4 flex flex-wrap gap-2">{children}</div>}
      </div>
    </div>
  );
}

export function Input({
  className,
  ...props
}: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={cn(
        "h-11 w-full rounded-xl border border-zinc-700/80 bg-zinc-900/80 px-3 font-mono text-sm text-zinc-100 placeholder:text-zinc-600 focus:border-cyan-500/50 focus:outline-none focus:ring-2 focus:ring-cyan-500/15",
        className
      )}
      {...props}
    />
  );
}

export function Select({
  className,
  ...props
}: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      className={cn(
        "h-11 w-full rounded-xl border border-zinc-700/80 bg-zinc-900/80 px-3 text-sm text-zinc-100 focus:border-cyan-500/50 focus:outline-none focus:ring-2 focus:ring-cyan-500/15",
        className
      )}
      {...props}
    />
  );
}

export function Label({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <label
      className={cn(
        "mb-1.5 block text-xs font-medium uppercase tracking-wider text-zinc-400",
        className
      )}
    >
      {children}
    </label>
  );
}

export function Badge({
  className,
  children,
  tone = "default",
}: {
  className?: string;
  children: React.ReactNode;
  tone?: "default" | "success" | "warning" | "accent";
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-0.5 font-mono text-[10px] uppercase tracking-wider",
        tone === "default" && "border-zinc-700 bg-zinc-900/80 text-zinc-400",
        tone === "success" && "border-emerald-500/30 bg-emerald-500/10 text-emerald-400",
        tone === "warning" && "border-amber-500/30 bg-amber-500/10 text-amber-400",
        tone === "accent" && "border-cyan-500/30 bg-cyan-500/10 text-cyan-400",
        className
      )}
    >
      {children}
    </span>
  );
}

export function SectionTitle({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <h2
      className={cn(
        "mb-3 text-[11px] font-semibold uppercase tracking-[0.25em] text-zinc-500",
        className
      )}
    >
      {children}
    </h2>
  );
}

export function Alert({
  children,
  tone = "success",
  className,
}: {
  children: React.ReactNode;
  tone?: "success" | "error";
  className?: string;
}) {
  return (
    <div
      className={cn(
        "mb-4 rounded-xl border px-4 py-3 text-sm",
        tone === "success" && "border-cyan-500/20 bg-cyan-500/10 text-cyan-200",
        tone === "error" && "border-red-500/20 bg-red-500/10 text-red-300",
        className
      )}
    >
      {children}
    </div>
  );
}

export function StatTile({
  label,
  value,
  mono = false,
}: {
  label: string;
  value: string;
  mono?: boolean;
}) {
  return (
    <Card className="py-4">
      <p className="text-[10px] uppercase tracking-wider text-zinc-500">{label}</p>
      <p
        className={cn(
          "mt-1 text-2xl font-semibold text-cyan-400",
          mono && "font-mono font-tabular"
        )}
      >
        {value}
      </p>
    </Card>
  );
}

export function ListRow({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <Card
      className={cn(
        "transition hover:border-cyan-500/25 hover:bg-zinc-900/90",
        className
      )}
    >
      {children}
    </Card>
  );
}
