import {
  Bookmark,
  Ban,
  ExternalLink,
  Mail,
  MessageCircle,
  Send,
  Phone,
  ScanSearch,
} from "lucide-react";
import Link from "next/link";

import { SectionCard } from "@/components/ui/section-card";
import { StatusBadge } from "@/components/ui/status-badge";
import type { CommercialStatus, Prospect } from "@/lib/domain";
import {
  commercialStatusLabels,
  websiteStatusLabels,
} from "@/lib/domain/prospect-presentation";

export function ProspectQuickView({
  prospect,
  onSave,
  onStatusChange,
  onExclude,
  onReanalyze,
  isAnalyzing = false,
}: {
  prospect: Prospect | null;
  onSave: () => void;
  onStatusChange: (status: CommercialStatus) => void;
  onExclude: () => void;
  onReanalyze: () => void;
  isAnalyzing?: boolean;
}) {
  if (!prospect) {
    return (
      <SectionCard title="Vista rápida del prospecto">
        <p className="py-12 text-center text-sm text-slate-500">
          Selecciona un prospecto para revisar su oportunidad.
        </p>
      </SectionCard>
    );
  }

  const contacts = [
    prospect.publicEmail
      ? { type: "email", label: prospect.publicEmail, icon: Mail }
      : null,
    prospect.publicPhone
      ? { type: "phone", label: prospect.publicPhone, icon: Phone }
      : null,
    prospect.publicWhatsapp
      ? {
          type: "whatsapp",
          label: prospect.publicWhatsapp,
          icon: MessageCircle,
        }
      : null,
  ].filter((contact) => contact !== null);

  return (
    <SectionCard
      title="Vista rápida del prospecto"
      contentClassName="space-y-5"
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-950">
            {prospect.businessName}
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            {prospect.niche} · {prospect.location}
          </p>
        </div>
        <p className="shrink-0 text-2xl font-bold text-emerald-700">
          {prospect.opportunityScore}
          <span className="text-base font-medium text-slate-400">/100</span>
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        <StatusBadge tone="orange">
          {websiteStatusLabels[prospect.websiteStatus]}
        </StatusBadge>
        <StatusBadge tone="green">
          {commercialStatusLabels[prospect.commercialStatus]}
        </StatusBadge>
      </div>

      <div>
        <label
          htmlFor="estado-comercial"
          className="mb-2 block text-xs font-semibold tracking-wide text-slate-500 uppercase"
        >
          Estado comercial
        </label>
        <select
          id="estado-comercial"
          value={prospect.commercialStatus}
          onChange={(event) =>
            onStatusChange(event.target.value as CommercialStatus)
          }
          className="min-h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm"
        >
          {Object.entries(commercialStatusLabels).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
      </div>

      <section>
        <h3 className="text-xs font-semibold tracking-wide text-slate-500 uppercase">
          Contacto público
        </h3>
        <div className="mt-2 space-y-2">
          {contacts.length > 0 ? (
            contacts.map((contact) => {
              const Icon = contact.icon;
              return (
                <p
                  key={`${contact.type}-${contact.label}`}
                  className="flex items-center gap-2 text-sm text-slate-700"
                >
                  <Icon className="size-4 text-blue-600" aria-hidden="true" />
                  {contact.label}
                </p>
              );
            })
          ) : (
            <p className="text-sm text-slate-500">
              Sin contacto público registrado.
            </p>
          )}
          {prospect.contactSourceUrl ? (
            <a
              href={prospect.contactSourceUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex min-h-10 items-center gap-2 text-sm font-medium text-blue-700 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
            >
              URL de origen del contacto
              <ExternalLink className="size-4" aria-hidden="true" />
            </a>
          ) : null}
        </div>
      </section>

      <section className="border-t border-slate-100 pt-4">
        <h3 className="text-sm font-semibold text-slate-950">
          Resumen IA simulado
        </h3>
        <p className="mt-2 text-sm leading-6 text-slate-600">
          {prospect.aiSummary}
        </p>
      </section>

      <section>
        <h3 className="text-sm font-semibold text-slate-950">
          Oportunidades detectadas
        </h3>
        <ul className="mt-2 space-y-1.5 text-sm text-slate-600">
          {prospect.detectedOpportunities.map((opportunity) => (
            <li key={opportunity} className="flex gap-2">
              <span
                className="mt-2 size-1.5 shrink-0 rounded-full bg-blue-600"
                aria-hidden="true"
              />
              {opportunity}
            </li>
          ))}
        </ul>
      </section>

      <section>
        <h3 className="text-sm font-semibold text-slate-950">
          Oferta recomendada
        </h3>
        <p className="mt-2 text-sm leading-6 text-slate-600">
          {prospect.recommendedOffer}
        </p>
      </section>

      <div className="grid gap-2 border-t border-slate-100 pt-4 sm:grid-cols-2">
        {prospect.websiteUrl ? (
          <button
            type="button"
            onClick={onReanalyze}
            disabled={isAnalyzing}
            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-violet-200 px-3 text-sm font-semibold text-violet-700 hover:bg-violet-50 disabled:cursor-not-allowed disabled:opacity-60 sm:col-span-2"
          >
            <ScanSearch className="size-4" aria-hidden="true" />
            {isAnalyzing ? "Análisis en curso…" : "Reanalizar sitio web"}
          </button>
        ) : null}
        <button
          type="button"
          onClick={onSave}
          className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-blue-600 px-3 text-sm font-semibold text-blue-700 hover:bg-blue-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
        >
          <Bookmark className="size-4" aria-hidden="true" />
          Guardar
        </button>
        <Link
          href={`/propuestas?prospectId=${encodeURIComponent(prospect.id)}`}
          className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-blue-600 px-3 text-sm font-semibold text-white hover:bg-blue-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
        >
          <Send className="size-4" aria-hidden="true" />
          Crear propuesta
        </Link>
        {contacts.length > 0 ? (
          <button
            type="button"
            onClick={onExclude}
            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-red-200 px-3 text-sm font-semibold text-red-700 hover:bg-red-50 sm:col-span-2"
          >
            <Ban className="size-4" aria-hidden="true" /> Excluir contacto
            principal
          </button>
        ) : null}
      </div>
    </SectionCard>
  );
}
