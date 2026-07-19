import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

type MetricTone = "blue" | "green" | "orange" | "purple";

const toneStyles: Record<MetricTone, string> = {
  blue: "bg-blue-50 text-blue-600",
  green: "bg-emerald-50 text-emerald-600",
  orange: "bg-orange-50 text-orange-600",
  purple: "bg-violet-50 text-violet-600",
};

type MetricCardProps = {
  label: string;
  value: ReactNode;
  icon: LucideIcon;
  helperText?: ReactNode;
  tone?: MetricTone;
  className?: string;
};

export function MetricCard({
  label,
  value,
  icon: Icon,
  helperText,
  tone = "blue",
  className,
}: MetricCardProps) {
  return (
    <article
      className={cn(
        "rounded-[var(--radius-card)] border border-[var(--border-subtle)] bg-white p-5 shadow-[var(--shadow-card)]",
        className,
      )}
    >
      <div className="flex items-start gap-4">
        <span
          className={cn(
            "grid size-12 shrink-0 place-items-center rounded-2xl",
            toneStyles[tone],
          )}
        >
          <Icon className="size-6" strokeWidth={1.8} aria-hidden="true" />
        </span>
        <div className="min-w-0">
          <p className="text-sm font-medium text-slate-600">{label}</p>
          <p className="mt-1 text-2xl font-bold tracking-tight text-slate-950">
            {value}
          </p>
          {helperText ? (
            <div className="mt-1.5 text-xs text-slate-500">{helperText}</div>
          ) : null}
        </div>
      </div>
    </article>
  );
}
