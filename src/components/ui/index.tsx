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
            "bg-emerald-600 text-white hover:bg-emerald-700 shadow-sm shadow-emerald-600/20",
          variant === "secondary" &&
            "bg-emerald-50 text-emerald-800 hover:bg-emerald-100 border border-emerald-100",
          variant === "ghost" && "text-stone-600 hover:bg-stone-100",
          variant === "outline" &&
            "border border-stone-200 bg-white text-stone-800 hover:bg-stone-50",
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
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-stone-200/80 bg-white p-5 shadow-sm shadow-stone-200/40",
        className
      )}
    >
      {children}
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
        "h-11 w-full rounded-xl border border-stone-200 bg-white px-3 text-sm text-stone-900 placeholder:text-stone-400 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20",
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
    <label className={cn("mb-1.5 block text-sm font-medium text-stone-700", className)}>
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
  tone?: "default" | "success" | "warning";
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
        tone === "default" && "bg-stone-100 text-stone-700",
        tone === "success" && "bg-emerald-100 text-emerald-800",
        tone === "warning" && "bg-amber-100 text-amber-800",
        className
      )}
    >
      {children}
    </span>
  );
}
