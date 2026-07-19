function SkeletonBlock({ className }: { className: string }) {
  return (
    <div
      className={`animate-pulse rounded-xl bg-slate-200/70 ${className}`}
      aria-hidden="true"
    />
  );
}

export function DashboardSkeleton() {
  return (
    <div
      role="status"
      aria-label="Cargando panel principal"
      className="space-y-6"
    >
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-3">
          <SkeletonBlock className="h-8 w-64" />
          <SkeletonBlock className="h-4 w-80 max-w-full" />
        </div>
        <SkeletonBlock className="hidden h-11 w-40 sm:block" />
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }, (_, index) => (
          <div
            key={index}
            className="rounded-[var(--radius-card)] border border-[var(--border-subtle)] bg-white p-5"
          >
            <div className="flex gap-4">
              <SkeletonBlock className="size-12 shrink-0" />
              <div className="flex-1 space-y-2">
                <SkeletonBlock className="h-4 w-28" />
                <SkeletonBlock className="h-7 w-16" />
                <SkeletonBlock className="h-3 w-24" />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.55fr)_minmax(21rem,0.85fr)]">
        <SkeletonBlock className="h-[28rem] w-full bg-white ring-1 ring-slate-200" />
        <div className="space-y-6">
          <SkeletonBlock className="h-72 w-full bg-white ring-1 ring-slate-200" />
          <SkeletonBlock className="h-40 w-full bg-white ring-1 ring-slate-200" />
        </div>
      </div>
      <span className="sr-only">Cargando datos del panel…</span>
    </div>
  );
}
