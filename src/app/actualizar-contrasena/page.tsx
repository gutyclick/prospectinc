"use client";

import { useActionState } from "react";

import { updatePasswordAction } from "./actions";

export default function UpdatePasswordPage() {
  const [state, action] = useActionState(updatePasswordAction, null);
  return (
    <main className="grid min-h-screen place-items-center bg-slate-50 px-4 py-10">
      <form
        action={action}
        className="w-full max-w-md space-y-5 rounded-3xl border border-slate-200 bg-white p-8 shadow-[var(--shadow-card)]"
      >
        <div>
          <h1 className="text-2xl font-bold text-slate-950">
            Crear nueva contraseña
          </h1>
          <p className="mt-2 text-sm text-slate-500">
            Usa al menos 10 caracteres.
          </p>
        </div>
        <div>
          <label htmlFor="password" className="mb-2 block text-sm font-medium">
            Nueva contraseña
          </label>
          <input
            id="password"
            name="password"
            type="password"
            autoComplete="new-password"
            minLength={10}
            required
            className="min-h-11 w-full rounded-xl border border-slate-200 px-3"
          />
        </div>
        <div>
          <label
            htmlFor="confirmation"
            className="mb-2 block text-sm font-medium"
          >
            Confirmar contraseña
          </label>
          <input
            id="confirmation"
            name="confirmation"
            type="password"
            autoComplete="new-password"
            minLength={10}
            required
            className="min-h-11 w-full rounded-xl border border-slate-200 px-3"
          />
        </div>
        {state && (
          <p
            role="alert"
            className="rounded-xl bg-red-50 px-3 py-2 text-sm text-red-700"
          >
            {state.message}
          </p>
        )}
        <button
          type="submit"
          className="min-h-11 w-full rounded-xl bg-blue-600 px-4 text-sm font-semibold text-white"
        >
          Guardar contraseña
        </button>
      </form>
    </main>
  );
}
