"use client";

import { useState } from "react";
import { Database } from "lucide-react";

import { importDemoDataAction } from "@/app/actions/data";

export function DemoImportButton() {
  const [message, setMessage] = useState("");
  const [pending, setPending] = useState(false);
  async function run() {
    if (!window.confirm("¿Importar los prospectos demo en tu cuenta?")) return;
    setPending(true);
    const result = await importDemoDataAction();
    setPending(false);
    setMessage(
      result.ok
        ? result.data === 0
          ? "Los datos demo ya estaban importados."
          : `${result.data} prospectos demo importados.`
        : result.error,
    );
  }
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <h2 className="font-semibold text-slate-950">Datos de desarrollo</h2>
      <p className="mt-1 text-sm text-slate-500">
        Importación explícita e idempotente para la cuenta autenticada. Nunca se
        ejecuta automáticamente.
      </p>
      <button
        type="button"
        disabled={pending}
        onClick={() => void run()}
        className="mt-4 inline-flex min-h-11 items-center gap-2 rounded-xl bg-blue-600 px-4 text-sm font-semibold text-white disabled:opacity-60"
      >
        <Database className="size-4" />
        {pending ? "Importando…" : "Importar datos demo"}
      </button>
      {message ? (
        <p role="status" className="mt-3 text-sm text-slate-700">
          {message}
        </p>
      ) : null}
    </div>
  );
}
