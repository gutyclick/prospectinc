"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Sparkles, X } from "lucide-react";
import { useEffect, useRef, type ReactNode } from "react";
import { useForm, useWatch } from "react-hook-form";

import { Button } from "@/components/ui/button";
import {
  generateProposalContent,
  proposalTemplates,
} from "@/lib/domain/proposal-tools";
import type { Prospect } from "@/lib/domain";
import {
  proposalFormSchema,
  type ProposalFormInput,
  type ProposalFormValues,
  type ProposalTemplate,
} from "@/lib/validation";

const inputClass =
  "mt-1.5 min-h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none focus:border-blue-400 focus:ring-3 focus:ring-blue-100";

export function ProposalFormModal({
  open,
  prospects,
  initialProspectId,
  onClose,
  onCreate,
}: {
  open: boolean;
  prospects: Prospect[];
  initialProspectId?: string;
  onClose: () => void;
  onCreate: (values: ProposalFormValues) => Promise<void>;
}) {
  const closeRef = useRef<HTMLButtonElement>(null);
  const dialogRef = useRef<HTMLElement>(null);
  const {
    control,
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<ProposalFormInput, unknown, ProposalFormValues>({
    resolver: zodResolver(proposalFormSchema),
    defaultValues: {
      prospectId: initialProspectId ?? "",
      template: "web-basica",
      service: "",
      price: 490,
      currency: "USD",
      deliveryTime: "7 días hábiles",
      summary: "",
      includedItems: "",
      callToAction: "",
    },
  });
  const prospectId = useWatch({ control, name: "prospectId" });
  const template = useWatch({ control, name: "template" });

  useEffect(() => {
    if (open) {
      reset({
        prospectId: initialProspectId ?? "",
        template: "web-basica",
        service: "",
        price: 490,
        currency: "USD",
        deliveryTime: "7 días hábiles",
        summary: "",
        includedItems: "",
        callToAction: "",
      });
      setTimeout(() => closeRef.current?.focus(), 0);
    }
  }, [initialProspectId, open, reset]);
  useEffect(() => {
    if (!open) return;
    const previousElement =
      document.activeElement instanceof HTMLElement
        ? document.activeElement
        : null;
    document.body.style.overflow = "hidden";
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
      if (event.key === "Tab") {
        const focusable = dialogRef.current?.querySelectorAll<HTMLElement>(
          'button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',
        );
        const first = focusable?.item(0);
        const last = focusable?.item((focusable?.length ?? 1) - 1);
        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault();
          last?.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault();
          first?.focus();
        }
      }
    };
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
      previousElement?.focus();
    };
  }, [onClose, open]);
  if (!open) return null;

  function generate() {
    const prospect = prospects.find((item) => item.id === prospectId);
    if (!prospect) return;
    const content = generateProposalContent(
      prospect,
      template as ProposalTemplate,
    );
    for (const [key, value] of Object.entries(content))
      setValue(key as keyof ProposalFormInput, value, { shouldValidate: true });
  }

  return (
    <div
      className="fixed inset-0 z-50 grid place-items-center bg-slate-950/40 p-4"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <section
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="proposal-form-title"
        className="max-h-[92vh] w-full max-w-3xl overflow-y-auto rounded-2xl bg-white shadow-2xl"
      >
        <header className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-200 bg-white px-5 py-4">
          <div>
            <h2 id="proposal-form-title" className="text-lg font-bold">
              Nueva propuesta
            </h2>
            <p className="text-sm text-slate-500">
              Prepara un borrador simulado y editable.
            </p>
          </div>
          <button
            ref={closeRef}
            type="button"
            onClick={onClose}
            className="grid size-11 place-items-center rounded-xl hover:bg-slate-100"
            aria-label="Cerrar formulario"
          >
            <X className="size-5" />
          </button>
        </header>
        <form
          onSubmit={handleSubmit(onCreate)}
          className="grid gap-4 p-5 sm:grid-cols-2"
        >
          <Field label="Prospecto" error={errors.prospectId?.message}>
            <select {...register("prospectId")} className={inputClass}>
              <option value="">Seleccionar prospecto</option>
              {prospects.map((prospect) => (
                <option key={prospect.id} value={prospect.id}>
                  {prospect.businessName}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Plantilla" error={errors.template?.message}>
            <select {...register("template")} className={inputClass}>
              {proposalTemplates.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.name}
                </option>
              ))}
            </select>
          </Field>
          <div className="sm:col-span-2">
            <Button
              type="button"
              variant="outline"
              onClick={generate}
              disabled={!prospectId}
            >
              <Sparkles className="size-4" /> Generar contenido con IA
            </Button>
            <p className="mt-1 text-xs text-slate-500">
              Generación simulada y determinística; revisa el contenido antes de
              usarlo.
            </p>
          </div>
          <Field label="Servicio" error={errors.service?.message}>
            <input {...register("service")} className={inputClass} />
          </Field>
          <Field label="Precio" error={errors.price?.message}>
            <input
              {...register("price")}
              type="number"
              min="1"
              step="1"
              className={inputClass}
            />
          </Field>
          <Field label="Moneda" error={errors.currency?.message}>
            <select {...register("currency")} className={inputClass}>
              <option value="USD">USD</option>
            </select>
          </Field>
          <Field label="Plazo" error={errors.deliveryTime?.message}>
            <input {...register("deliveryTime")} className={inputClass} />
          </Field>
          <Field label="Resumen" error={errors.summary?.message} wide>
            <textarea
              {...register("summary")}
              rows={4}
              className={`${inputClass} py-3`}
            />
          </Field>
          <Field
            label="Elementos incluidos (uno por línea)"
            error={errors.includedItems?.message}
            wide
          >
            <textarea
              {...register("includedItems")}
              rows={5}
              className={`${inputClass} py-3`}
            />
          </Field>
          <Field
            label="Llamado a la acción"
            error={errors.callToAction?.message}
            wide
          >
            <input {...register("callToAction")} className={inputClass} />
          </Field>
          <footer className="flex justify-end gap-2 border-t border-slate-200 pt-4 sm:col-span-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Creando..." : "Crear borrador"}
            </Button>
          </footer>
        </form>
      </section>
    </div>
  );
}

function Field({
  label,
  error,
  wide,
  children,
}: {
  label: string;
  error?: string;
  wide?: boolean;
  children: ReactNode;
}) {
  return (
    <label className={wide ? "sm:col-span-2" : undefined}>
      <span className="text-sm font-semibold text-slate-700">{label}</span>
      {children}
      {error ? (
        <span role="alert" className="mt-1 block text-xs text-red-600">
          {error}
        </span>
      ) : null}
    </label>
  );
}
