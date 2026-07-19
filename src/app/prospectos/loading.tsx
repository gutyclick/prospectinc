export default function Loading() {
  return (
    <div role="status" aria-label="Cargando prospectos" className="space-y-6">
      <div className="h-9 w-52 animate-pulse rounded-xl bg-slate-200/70" />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }, (_, index) => (
          <div
            key={index}
            className="h-28 animate-pulse rounded-[var(--radius-card)] bg-white ring-1 ring-slate-200"
          />
        ))}
      </div>
      <div className="grid gap-6 xl:grid-cols-[1.35fr_0.75fr]">
        <div className="h-[34rem] animate-pulse rounded-[var(--radius-card)] bg-white ring-1 ring-slate-200" />
        <div className="h-[34rem] animate-pulse rounded-[var(--radius-card)] bg-white ring-1 ring-slate-200" />
      </div>
      <span className="sr-only">Cargando contenido de prospectos…</span>
    </div>
  );
}
