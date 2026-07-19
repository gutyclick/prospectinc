export default function Loading() {
  return (
    <div role="status" aria-label="Cargando búsquedas" className="space-y-6">
      <div className="h-9 w-48 animate-pulse rounded-xl bg-slate-200/70" />
      <div className="h-72 animate-pulse rounded-[var(--radius-card)] bg-white ring-1 ring-slate-200" />
      <div className="grid gap-4 md:grid-cols-3">
        {Array.from({ length: 3 }, (_, index) => (
          <div
            key={index}
            className="h-28 animate-pulse rounded-[var(--radius-card)] bg-white ring-1 ring-slate-200"
          />
        ))}
      </div>
      <span className="sr-only">Cargando contenido de búsquedas…</span>
    </div>
  );
}
