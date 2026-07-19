import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

type SectionCardProps = {
  title?: string;
  description?: string;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
  contentClassName?: string;
};

export function SectionCard({
  title,
  description,
  action,
  children,
  className,
  contentClassName,
}: SectionCardProps) {
  const hasHeader = title || description || action;

  return (
    <section
      className={cn(
        "overflow-hidden rounded-[var(--radius-card)] border border-[var(--border-subtle)] bg-white shadow-[var(--shadow-card)]",
        className,
      )}
    >
      {hasHeader ? (
        <header className="flex min-h-14 items-start justify-between gap-4 border-b border-[var(--border-subtle)] px-5 py-4">
          <div>
            {title ? (
              <h2 className="text-sm font-semibold text-slate-950">{title}</h2>
            ) : null}
            {description ? (
              <p className="mt-1 text-xs leading-5 text-slate-500">
                {description}
              </p>
            ) : null}
          </div>
          {action ? <div className="shrink-0">{action}</div> : null}
        </header>
      ) : null}
      <div className={cn("p-5", contentClassName)}>{children}</div>
    </section>
  );
}
