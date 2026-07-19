"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Plus, X } from "lucide-react";
import { useEffect, useRef, type ReactNode } from "react";
import { useForm } from "react-hook-form";

import {
  prospectFormSchema,
  type ProspectFormInput,
  type ProspectFormValues,
} from "@/lib/validation";

type AddProspectModalProps = {
  open: boolean;
  onClose: () => void;
  onAdd: (values: ProspectFormValues) => Promise<void>;
};

const fieldClassName =
  "mt-1.5 h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-900 outline-none focus:border-blue-400 focus:ring-3 focus:ring-blue-100";

export function AddProspectModal({
  open,
  onClose,
  onAdd,
}: AddProspectModalProps) {
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const dialogRef = useRef<HTMLElement>(null);
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ProspectFormInput, unknown, ProspectFormValues>({
    resolver: zodResolver(prospectFormSchema),
    defaultValues: {
      businessName: "",
      niche: "",
      location: "",
      websiteUrl: "",
      websiteStatus: "sin-sitio",
      publicEmail: "",
      publicPhone: "",
      publicWhatsapp: "",
      contactSourceUrl: "",
      opportunityScore: 50,
    },
  });

  useEffect(() => {
    if (!open) return;
    const previousElement =
      document.activeElement instanceof HTMLElement
        ? document.activeElement
        : null;
    closeButtonRef.current?.focus();
    document.body.style.overflow = "hidden";

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
      if (event.key === "Tab") {
        const focusableElements =
          dialogRef.current?.querySelectorAll<HTMLElement>(
            'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])',
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
  }, [onClose, open]);

  if (!open) return null;

  async function submit(values: ProspectFormValues) {
    await onAdd(values);
    reset();
  }

  return (
    <div className="fixed inset-0 z-[60] grid place-items-center p-4">
      <button
        type="button"
        className="absolute inset-0 bg-slate-950/35 backdrop-blur-[1px]"
        aria-label="Cerrar formulario"
        onClick={onClose}
      />
      <section
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="add-prospect-title"
        className="relative max-h-[calc(100vh-2rem)] w-full max-w-3xl overflow-y-auto rounded-2xl bg-white shadow-2xl"
      >
        <header className="sticky top-0 z-10 flex items-start justify-between gap-4 border-b border-slate-100 bg-white px-5 py-4 sm:px-6">
          <div>
            <h2
              id="add-prospect-title"
              className="text-lg font-bold text-slate-950"
            >
              Añadir prospecto
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Registra solo información empresarial pública y conserva su
              fuente.
            </p>
          </div>
          <button
            ref={closeButtonRef}
            type="button"
            onClick={onClose}
            className="grid size-11 shrink-0 place-items-center rounded-xl border border-slate-200 text-slate-500 hover:bg-slate-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
            aria-label="Cerrar modal"
          >
            <X className="size-5" aria-hidden="true" />
          </button>
        </header>

        <form onSubmit={handleSubmit(submit)} noValidate className="p-5 sm:p-6">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field
              label="Nombre del negocio"
              error={errors.businessName?.message}
            >
              <input className={fieldClassName} {...register("businessName")} />
            </Field>
            <Field label="Nicho" error={errors.niche?.message}>
              <input className={fieldClassName} {...register("niche")} />
            </Field>
            <Field label="Ubicación" error={errors.location?.message}>
              <input className={fieldClassName} {...register("location")} />
            </Field>
            <Field label="Estado web" error={errors.websiteStatus?.message}>
              <select className={fieldClassName} {...register("websiteStatus")}>
                <option value="sin-sitio">Sin web</option>
                <option value="desactualizado">Web antigua</option>
                <option value="solo-redes">Solo Instagram</option>
                <option value="basico">Web básica</option>
                <option value="optimizado">Optimizada</option>
              </select>
            </Field>
            <Field label="URL del sitio" error={errors.websiteUrl?.message}>
              <input
                type="url"
                className={fieldClassName}
                {...register("websiteUrl")}
              />
            </Field>
            <Field
              label="Puntaje de oportunidad"
              error={errors.opportunityScore?.message}
            >
              <input
                type="number"
                min={0}
                max={100}
                className={fieldClassName}
                {...register("opportunityScore")}
              />
            </Field>
            <Field label="Correo público" error={errors.publicEmail?.message}>
              <input
                type="email"
                className={fieldClassName}
                {...register("publicEmail")}
              />
            </Field>
            <Field label="Teléfono público" error={errors.publicPhone?.message}>
              <input className={fieldClassName} {...register("publicPhone")} />
            </Field>
            <Field
              label="WhatsApp público"
              error={errors.publicWhatsapp?.message}
            >
              <input
                className={fieldClassName}
                {...register("publicWhatsapp")}
              />
            </Field>
            <Field
              label="URL de origen del contacto"
              error={errors.contactSourceUrl?.message}
            >
              <input
                type="url"
                className={fieldClassName}
                {...register("contactSourceUrl")}
              />
            </Field>
          </div>

          <div className="mt-6 flex flex-col-reverse gap-2 border-t border-slate-100 pt-5 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={onClose}
              className="min-h-11 rounded-xl border border-slate-200 px-4 text-sm font-semibold text-slate-700 hover:bg-slate-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 text-sm font-semibold text-white hover:bg-blue-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 disabled:opacity-60"
            >
              <Plus className="size-4" aria-hidden="true" />
              {isSubmitting ? "Guardando…" : "Añadir prospecto"}
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}

function Field({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: ReactNode;
}) {
  return (
    <label className="text-xs font-semibold text-slate-700">
      {label}
      {children}
      {error ? (
        <span
          className="mt-1.5 block text-xs font-normal text-red-600"
          role="alert"
        >
          {error}
        </span>
      ) : null}
    </label>
  );
}
