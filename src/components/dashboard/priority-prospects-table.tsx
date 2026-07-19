"use client";

import { ExternalLink, Mail, MessageCircle, Phone, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";

import { DataTableShell } from "@/components/ui/data-table-shell";
import { EmptyState } from "@/components/ui/empty-state";
import { StatusBadge } from "@/components/ui/status-badge";
import type { Prospect } from "@/lib/domain";
import {
  commercialStatusLabels,
  websiteStatusLabels,
} from "@/lib/domain/prospect-presentation";

type PriorityProspectsTableProps = {
  prospects: Prospect[];
};

function getContact(prospect: Prospect) {
  if (prospect.publicWhatsapp) {
    return { label: "WhatsApp", icon: MessageCircle };
  }
  if (prospect.publicEmail) {
    return { label: "Correo", icon: Mail };
  }
  return { label: "Teléfono", icon: Phone };
}

function ProspectDetailPanel({
  prospect,
  onClose,
}: {
  prospect: Prospect;
  onClose: () => void;
}) {
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const previousElement =
      document.activeElement instanceof HTMLElement
        ? document.activeElement
        : null;
    closeButtonRef.current?.focus();
    document.body.style.overflow = "hidden";

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        onClose();
      }

      if (event.key === "Tab") {
        const focusableElements =
          panelRef.current?.querySelectorAll<HTMLElement>(
            'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])',
          );
        const firstElement = focusableElements?.item(0);
        const lastElement = focusableElements?.item(
          (focusableElements?.length ?? 1) - 1,
        );

        if (event.shiftKey && document.activeElement === firstElement) {
          event.preventDefault();
          lastElement?.focus();
        } else if (!event.shiftKey && document.activeElement === lastElement) {
          event.preventDefault();
          firstElement?.focus();
        }
      }
    }

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
      previousElement?.focus();
    };
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-[60] flex justify-end" role="presentation">
      <button
        type="button"
        className="absolute inset-0 bg-slate-950/30 backdrop-blur-[1px]"
        aria-label="Cerrar detalle"
        onClick={onClose}
      />
      <section
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="prospect-detail-title"
        className="relative h-full w-full max-w-lg overflow-y-auto bg-white p-6 shadow-2xl sm:p-8"
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm font-medium text-blue-600">
              Detalle del prospecto
            </p>
            <h2
              id="prospect-detail-title"
              className="mt-1 text-2xl font-bold text-slate-950"
            >
              {prospect.businessName}
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              {prospect.niche} · {prospect.location}
            </p>
          </div>
          <button
            ref={closeButtonRef}
            type="button"
            onClick={onClose}
            className="grid size-11 shrink-0 place-items-center rounded-xl border border-slate-200 text-slate-500 hover:bg-slate-50 hover:text-slate-900 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
            aria-label="Cerrar panel"
          >
            <X className="size-5" aria-hidden="true" />
          </button>
        </div>

        <div className="mt-6 flex flex-wrap items-center gap-2">
          <StatusBadge tone="blue">{prospect.opportunityScore}/100</StatusBadge>
          <StatusBadge tone="green">
            {commercialStatusLabels[prospect.commercialStatus]}
          </StatusBadge>
          <StatusBadge tone="orange">
            {websiteStatusLabels[prospect.websiteStatus]}
          </StatusBadge>
        </div>

        <div className="mt-8 space-y-7">
          <section>
            <h3 className="text-sm font-semibold text-slate-950">Resumen</h3>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              {prospect.aiSummary}
            </p>
          </section>
          <section>
            <h3 className="text-sm font-semibold text-slate-950">
              Oferta recomendada
            </h3>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              {prospect.recommendedOffer}
            </p>
          </section>
          <section>
            <h3 className="text-sm font-semibold text-slate-950">
              Oportunidades detectadas
            </h3>
            <ul className="mt-3 space-y-2 text-sm text-slate-600">
              {prospect.detectedOpportunities.map((opportunity) => (
                <li key={opportunity} className="flex gap-2">
                  <span
                    className="mt-2 size-1.5 shrink-0 rounded-full bg-blue-600"
                    aria-hidden="true"
                  />
                  <span>{opportunity}</span>
                </li>
              ))}
            </ul>
          </section>
          {prospect.contactSourceUrl ? (
            <section>
              <h3 className="text-sm font-semibold text-slate-950">
                Fuente del contacto
              </h3>
              <a
                href={prospect.contactSourceUrl}
                target="_blank"
                rel="noreferrer"
                className="mt-2 inline-flex min-h-11 items-center gap-2 text-sm font-medium text-blue-700 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
              >
                Abrir fuente pública
                <ExternalLink className="size-4" aria-hidden="true" />
              </a>
            </section>
          ) : null}
        </div>
      </section>
    </div>
  );
}

export function PriorityProspectsTable({
  prospects,
}: PriorityProspectsTableProps) {
  const [selectedProspect, setSelectedProspect] = useState<Prospect | null>(
    null,
  );

  if (prospects.length === 0) {
    return (
      <EmptyState
        title="No hay oportunidades prioritarias"
        description="Cuando un prospecto alcance una prioridad alta aparecerá en este espacio."
        icon={MessageCircle}
      />
    );
  }

  return (
    <>
      <DataTableShell title="Oportunidades prioritarias" minimumWidth="54rem">
        <table className="w-full border-collapse text-left text-sm">
          <caption className="sr-only">
            Prospectos prioritarios ordenados por puntaje de oportunidad
          </caption>
          <thead className="bg-slate-50/80 text-xs font-semibold text-slate-500">
            <tr>
              {[
                "Negocio",
                "Nicho",
                "Estado web",
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
              const contact = getContact(prospect);
              const ContactIcon = contact.icon;

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
                  <td className="px-4 py-3">
                    <StatusBadge
                      tone={
                        prospect.websiteStatus === "sin-sitio"
                          ? "red"
                          : "orange"
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
                      {contact.label}
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
                      onClick={() => setSelectedProspect(prospect)}
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
      </DataTableShell>

      {selectedProspect ? (
        <ProspectDetailPanel
          prospect={selectedProspect}
          onClose={() => setSelectedProspect(null)}
        />
      ) : null}
    </>
  );
}
