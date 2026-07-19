"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { MapPin, Search, Sparkles } from "lucide-react";
import { useForm } from "react-hook-form";

import { searchFormSchema, type SearchFormValues } from "@/lib/validation";

type SearchConfigurationFormProps = {
  isProcessing: boolean;
  onStart: (values: SearchFormValues) => Promise<void>;
};

const opportunityOptions = [
  { value: "todos", label: "Todos" },
  { value: "sin-web", label: "Sin web" },
  { value: "web-antigua", label: "Web antigua" },
  { value: "sin-reservas", label: "Sin reservas" },
] as const;

const sourceOptions = [
  { value: "google-places", label: "Google Places" },
  { value: "instagram", label: "Instagram" },
  { value: "directorios", label: "Directorios" },
] as const;

const fieldClassName =
  "h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-400 focus:ring-3 focus:ring-blue-100";

export function SearchConfigurationForm({
  isProcessing,
  onStart,
}: SearchConfigurationFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SearchFormValues>({
    resolver: zodResolver(searchFormSchema),
    defaultValues: {
      query: "",
      location: "",
      resultLimit: 50,
      preferredChannel: "web-whatsapp",
      opportunityLevel: "todos",
      sources: ["google-places", "instagram"],
    },
  });

  return (
    <form onSubmit={handleSubmit(onStart)} noValidate>
      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
        <div>
          <label
            htmlFor="search-query"
            className="text-xs font-semibold text-slate-700"
          >
            Nicho o tipo de negocio
          </label>
          <div className="relative mt-2">
            <Search
              className="pointer-events-none absolute top-1/2 right-3 size-4 -translate-y-1/2 text-slate-400"
              aria-hidden="true"
            />
            <input
              id="search-query"
              className={`${fieldClassName} pr-10`}
              placeholder="Ej. Clínicas dentales"
              aria-invalid={Boolean(errors.query)}
              aria-describedby={errors.query ? "search-query-error" : undefined}
              {...register("query")}
            />
          </div>
          {errors.query ? (
            <p
              id="search-query-error"
              className="mt-1.5 text-xs text-red-600"
              role="alert"
            >
              {errors.query.message}
            </p>
          ) : null}
        </div>

        <div>
          <label
            htmlFor="search-location"
            className="text-xs font-semibold text-slate-700"
          >
            Ubicación
          </label>
          <div className="relative mt-2">
            <MapPin
              className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-slate-400"
              aria-hidden="true"
            />
            <input
              id="search-location"
              className={`${fieldClassName} pl-10`}
              placeholder="Ej. Ciudad de Panamá"
              aria-invalid={Boolean(errors.location)}
              aria-describedby={
                errors.location ? "search-location-error" : undefined
              }
              {...register("location")}
            />
          </div>
          {errors.location ? (
            <p
              id="search-location-error"
              className="mt-1.5 text-xs text-red-600"
              role="alert"
            >
              {errors.location.message}
            </p>
          ) : null}
        </div>

        <div>
          <label
            htmlFor="result-limit"
            className="text-xs font-semibold text-slate-700"
          >
            Cantidad de resultados
          </label>
          <input
            id="result-limit"
            type="number"
            min={1}
            max={100}
            className={`${fieldClassName} mt-2`}
            aria-invalid={Boolean(errors.resultLimit)}
            aria-describedby={
              errors.resultLimit ? "result-limit-error" : undefined
            }
            {...register("resultLimit")}
          />
          {errors.resultLimit ? (
            <p
              id="result-limit-error"
              className="mt-1.5 text-xs text-red-600"
              role="alert"
            >
              {errors.resultLimit.message}
            </p>
          ) : null}
        </div>

        <div>
          <label
            htmlFor="preferred-channel"
            className="text-xs font-semibold text-slate-700"
          >
            Canal preferido
          </label>
          <select
            id="preferred-channel"
            className={`${fieldClassName} mt-2`}
            {...register("preferredChannel")}
          >
            <option value="web-whatsapp">Web + WhatsApp</option>
            <option value="correo">Correo</option>
            <option value="telefono">Teléfono</option>
          </select>
        </div>
      </div>

      <div className="mt-5 grid gap-5 border-t border-slate-100 pt-5 lg:grid-cols-[1fr_1fr_auto] lg:items-end">
        <fieldset>
          <legend className="text-xs font-semibold text-slate-700">
            Nivel de oportunidad
          </legend>
          <div className="mt-2 flex flex-wrap gap-2">
            {opportunityOptions.map((option) => (
              <label key={option.value} className="cursor-pointer">
                <input
                  type="radio"
                  value={option.value}
                  className="peer sr-only"
                  {...register("opportunityLevel")}
                />
                <span className="inline-flex min-h-9 items-center rounded-lg border border-slate-200 px-3 text-xs font-medium text-slate-600 transition peer-checked:border-blue-600 peer-checked:bg-blue-600 peer-checked:text-white peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-blue-600">
                  {option.label}
                </span>
              </label>
            ))}
          </div>
        </fieldset>

        <fieldset
          aria-describedby={errors.sources ? "sources-error" : undefined}
        >
          <legend className="text-xs font-semibold text-slate-700">
            Fuentes
          </legend>
          <div className="mt-2 flex flex-wrap gap-2">
            {sourceOptions.map((option) => (
              <label key={option.value} className="cursor-pointer">
                <input
                  type="checkbox"
                  value={option.value}
                  className="peer sr-only"
                  {...register("sources")}
                />
                <span className="inline-flex min-h-9 items-center gap-2 rounded-lg border border-slate-200 px-3 text-xs font-medium text-slate-600 transition peer-checked:border-blue-200 peer-checked:bg-blue-50 peer-checked:text-blue-700 peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-blue-600">
                  <span
                    className="size-2 rounded-full bg-current opacity-50"
                    aria-hidden="true"
                  />
                  {option.label}
                </span>
              </label>
            ))}
          </div>
          {errors.sources ? (
            <p
              id="sources-error"
              className="mt-1.5 text-xs text-red-600"
              role="alert"
            >
              {errors.sources.message}
            </p>
          ) : null}
        </fieldset>

        <button
          type="submit"
          disabled={isProcessing}
          className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 text-sm font-semibold text-white shadow-[var(--shadow-brand)] hover:bg-blue-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 disabled:cursor-not-allowed disabled:opacity-60"
        >
          <Sparkles className="size-4" aria-hidden="true" />
          {isProcessing ? "Analizando…" : "Iniciar análisis"}
        </button>
      </div>
    </form>
  );
}
