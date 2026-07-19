import { FilePlus2, Inbox, Search, Users } from "lucide-react";
import Link from "next/link";

import { SectionCard } from "@/components/ui/section-card";

const quickActions = [
  { href: "/busquedas", label: "Buscar nicho", icon: Search },
  { href: "/prospectos", label: "Ver prospectos", icon: Users },
  { href: "/propuestas", label: "Crear borradores", icon: FilePlus2 },
  { href: "/bandeja", label: "Revisar bandeja", icon: Inbox },
];

export function QuickActions() {
  return (
    <SectionCard
      title="Acciones rápidas"
      contentClassName="grid gap-2 p-3 sm:grid-cols-2"
    >
      {quickActions.map((action) => {
        const Icon = action.icon;

        return (
          <Link
            key={action.href}
            href={action.href}
            className="flex min-h-11 items-center gap-2 rounded-xl border border-slate-200 px-3 text-sm font-medium text-slate-700 hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
          >
            <Icon className="size-4 text-blue-600" aria-hidden="true" />
            {action.label}
          </Link>
        );
      })}
    </SectionCard>
  );
}
