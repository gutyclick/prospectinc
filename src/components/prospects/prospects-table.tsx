import { Mail, MessageCircle, Phone, Search } from "lucide-react";

import { EmptyState } from "@/components/ui/empty-state";
import { StatusBadge } from "@/components/ui/status-badge";
import type { Prospect } from "@/lib/domain";
import {
  commercialStatusLabels,
  contactChannelLabels,
  getProspectContactChannel,
  websiteStatusLabels,
} from "@/lib/domain/prospect-presentation";

export function ProspectsTable({
  prospects,
  onSelect,
}: {
  prospects: Prospect[];
  onSelect: (id: string) => void;
}) {
  if (prospects.length === 0) {
    return (
      <div className="p-5">
        <EmptyState
          title="No hay prospectos visibles"
          description="Ajusta los filtros para volver a mostrar oportunidades."
          icon={Search}
        />
      </div>
    );
  }

  return (
    <div
      className="overflow-x-auto"
      tabIndex={0}
      aria-label="Tabla de prospectos desplazable"
    >
      <table className="w-full min-w-[62rem] border-collapse text-left text-sm">
        <caption className="sr-only">Lista de prospectos filtrados</caption>
        <thead className="bg-slate-50/80 text-xs font-semibold text-slate-500">
          <tr>
            {[
              "Negocio",
              "Nicho",
              "Ubicación",
              "Web",
              "Contacto",
              "Puntaje",
              "Estado",
              "Acción",
            ].map((heading) => (
              <th key={heading} scope="col" className="px-4 py-3">
                {heading}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {prospects.map((prospect) => {
            const channel = getProspectContactChannel(prospect);
            const ContactIcon =
              channel === "whatsapp"
                ? MessageCircle
                : channel === "correo"
                  ? Mail
                  : Phone;
            return (
              <tr
                key={prospect.id}
                className="text-slate-600 hover:bg-slate-50/60"
              >
                <th
                  scope="row"
                  className="px-4 py-3 font-semibold whitespace-nowrap text-slate-900"
                >
                  {prospect.businessName}
                </th>
                <td className="px-4 py-3 whitespace-nowrap">
                  {prospect.niche}
                </td>
                <td className="px-4 py-3 whitespace-nowrap">
                  {prospect.location}
                </td>
                <td className="px-4 py-3">
                  <StatusBadge
                    tone={
                      prospect.websiteStatus === "sin-sitio" ? "red" : "orange"
                    }
                  >
                    {websiteStatusLabels[prospect.websiteStatus]}
                  </StatusBadge>
                </td>
                <td className="px-4 py-3">
                  <span className="inline-flex items-center gap-1.5 whitespace-nowrap">
                    <ContactIcon
                      className="size-4 text-emerald-600"
                      aria-hidden="true"
                    />
                    {contactChannelLabels[channel]}
                  </span>
                </td>
                <td className="px-4 py-3 font-bold text-emerald-700">
                  {prospect.opportunityScore}
                </td>
                <td className="px-4 py-3">
                  <StatusBadge tone="green">
                    {commercialStatusLabels[prospect.commercialStatus]}
                  </StatusBadge>
                </td>
                <td className="px-4 py-3">
                  <button
                    type="button"
                    onClick={() => onSelect(prospect.id)}
                    className="min-h-10 rounded-lg px-2 font-semibold text-blue-700 hover:bg-blue-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
                    aria-label={`Ver ${prospect.businessName}`}
                  >
                    Ver
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
