"use client";

import { AlertTriangle, RotateCcw } from "lucide-react";
import { useEffect } from "react";

import { Button } from "@/components/ui/button";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main className="grid min-h-[60vh] place-items-center p-6">
      <section
        role="alert"
        className="max-w-lg rounded-2xl border border-red-200 bg-white p-8 text-center shadow-sm"
      >
        <span className="mx-auto grid size-12 place-items-center rounded-2xl bg-red-50 text-red-600">
          <AlertTriangle className="size-6" aria-hidden="true" />
        </span>
        <h1 className="mt-4 text-xl font-bold text-slate-950">
          No pudimos cargar esta sección
        </h1>
        <p className="mt-2 text-sm leading-6 text-slate-600">
          Ocurrió un problema inesperado. Puedes intentar cargar nuevamente el
          contenido.
        </p>
        <Button className="mt-5" onClick={reset}>
          <RotateCcw className="size-4" aria-hidden="true" /> Intentar de nuevo
        </Button>
      </section>
    </main>
  );
}
