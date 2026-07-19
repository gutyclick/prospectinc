import { Mail, MessageCircle, Phone } from "lucide-react";

import { EmptyState } from "@/components/ui/empty-state";
import { StatusBadge } from "@/components/ui/status-badge";
import type { InboxItem } from "@/lib/domain";
import { conversationStatusLabels } from "@/lib/domain/prospect-presentation";

const relative = new Intl.RelativeTimeFormat("es", { numeric: "auto" });
function relativeTime(iso: string) {
  const hours = Math.round((new Date(iso).getTime() - Date.now()) / 3_600_000);
  return Math.abs(hours) < 24
    ? relative.format(hours, "hour")
    : relative.format(Math.round(hours / 24), "day");
}
const channelIcons = {
  correo: Mail,
  whatsapp: MessageCircle,
  telefono: Phone,
} as const;

export function ConversationList({
  items,
  selectedId,
  onSelect,
}: {
  items: InboxItem[];
  selectedId: string | null;
  onSelect: (id: string) => void;
}) {
  if (items.length === 0)
    return (
      <EmptyState
        icon={MessageCircle}
        title="No hay conversaciones"
        description="No existen conversaciones que coincidan con este filtro."
      />
    );
  return (
    <div
      className="divide-y divide-slate-100"
      role="list"
      aria-label="Conversaciones"
    >
      {items.map((item) => {
        const last = item.messages.at(-1);
        const Icon = channelIcons[item.channel];
        const unread =
          last?.direction === "entrante" && item.status === "respondio";
        return (
          <div key={item.id} role="listitem">
            <button
              type="button"
              onClick={() => onSelect(item.id)}
              aria-current={selectedId === item.id ? "true" : undefined}
              className={`w-full p-4 text-left transition focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:outline-none focus-visible:ring-inset ${selectedId === item.id ? "bg-blue-50" : "hover:bg-slate-50"}`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="truncate font-semibold text-slate-950">
                      {item.prospect.businessName}
                    </p>
                    {unread ? (
                      <span
                        className="size-2 rounded-full bg-blue-600"
                        aria-label="No leído"
                      />
                    ) : null}
                  </div>
                  <p className="mt-1 line-clamp-2 text-sm text-slate-500">
                    {last?.body ?? "Sin mensajes todavía"}
                  </p>
                </div>
                <span className="shrink-0 text-xs text-slate-400">
                  {relativeTime(item.lastActivityAt)}
                </span>
              </div>
              <div className="mt-3 flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-1 text-xs text-slate-500">
                  <Icon className="size-3.5" aria-hidden="true" />
                  {item.channel}
                </span>
                <StatusBadge
                  tone={
                    item.status === "respondio"
                      ? "green"
                      : item.status === "seguimiento"
                        ? "purple"
                        : "blue"
                  }
                >
                  {conversationStatusLabels[item.status]}
                </StatusBadge>
              </div>
              {item.nextAction ? (
                <p className="mt-2 truncate text-xs text-slate-500">
                  <span className="font-semibold">Próxima:</span>{" "}
                  {item.nextAction}
                </p>
              ) : null}
            </button>
          </div>
        );
      })}
    </div>
  );
}
