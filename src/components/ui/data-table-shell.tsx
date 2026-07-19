import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

type DataTableShellProps = {
  title?: string;
  toolbar?: ReactNode;
  children: ReactNode;
  footer?: ReactNode;
  className?: string;
  minimumWidth?: string;
};

export function DataTableShell({
  title,
  toolbar,
  children,
  footer,
  className,
  minimumWidth = "42rem",
}: DataTableShellProps) {
  return (
    <section
      className={cn(
        "overflow-hidden rounded-[var(--radius-card)] border border-[var(--border-subtle)] bg-white shadow-[var(--shadow-card)]",
        className,
      )}
    >
      {title || toolbar ? (
        <header className="flex flex-col gap-3 border-b border-[var(--border-subtle)] px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
          {title ? (
            <h2 className="text-sm font-semibold text-slate-950">{title}</h2>
          ) : null}
          {toolbar ? <div>{toolbar}</div> : null}
        </header>
      ) : null}
      <div
        className="overflow-x-auto"
        tabIndex={0}
        aria-label="Tabla con desplazamiento horizontal"
      >
        <div style={{ minWidth: minimumWidth }}>{children}</div>
      </div>
      {footer ? (
        <footer className="border-t border-[var(--border-subtle)] px-5 py-3">
          {footer}
        </footer>
      ) : null}
    </section>
  );
}
