export default function LoadingInbox() {
  return (
    <div className="animate-pulse space-y-4" aria-label="Cargando bandeja">
      <div className="h-14 rounded-xl bg-slate-200" />
      <div className="h-10 rounded-xl bg-slate-200" />
      <div className="grid h-[38rem] grid-cols-[22rem_1fr] overflow-hidden rounded-2xl border border-slate-200">
        <div className="border-r border-slate-200 bg-slate-100" />
        <div className="bg-slate-50" />
      </div>
    </div>
  );
}
