import {
  getInboxCounts,
  inboxFilterLabels,
  type InboxFilter,
} from "@/lib/domain/inbox-filters";
import type { InboxItem } from "@/lib/domain";

export function InboxFilterBar({
  items,
  active,
  onChange,
}: {
  items: InboxItem[];
  active: InboxFilter;
  onChange: (filter: InboxFilter) => void;
}) {
  const counts = getInboxCounts(items);
  return (
    <div
      className="flex gap-2 overflow-x-auto pb-1"
      aria-label="Filtros de conversaciones"
    >
      {(Object.keys(inboxFilterLabels) as InboxFilter[]).map((filter) => (
        <button
          key={filter}
          type="button"
          aria-pressed={active === filter}
          onClick={() => onChange(filter)}
          className={`inline-flex min-h-10 shrink-0 items-center gap-2 rounded-xl border px-3 text-sm font-medium focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:outline-none ${active === filter ? "border-blue-600 bg-blue-600 text-white" : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"}`}
        >
          {inboxFilterLabels[filter]}
          <span
            className={`rounded-full px-1.5 py-0.5 text-xs ${active === filter ? "bg-white/20" : "bg-slate-100"}`}
          >
            {counts[filter]}
          </span>
        </button>
      ))}
    </div>
  );
}
