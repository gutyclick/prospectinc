"use client";

import { useActionState, useState } from "react";

import { loginAction, recoverPasswordAction } from "./actions";

function SubmitButton({ label }: { label: string }) {
  return (
    <button
      type="submit"
      className="min-h-11 w-full rounded-xl bg-blue-600 px-4 text-sm font-semibold text-white transition hover:bg-blue-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 disabled:opacity-60"
    >
      {label}
    </button>
  );
}

export function LoginForm() {
  const [recovering, setRecovering] = useState(false);
  const [loginState, loginFormAction] = useActionState(loginAction, null);
  const [recoveryState, recoveryFormAction] = useActionState(
    recoverPasswordAction,
    null,
  );
  const state = recovering ? recoveryState : loginState;

  return (
    <div className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-6 shadow-[var(--shadow-card)] sm:p-8">
      <div className="mb-7">
        <div className="mb-5 inline-flex items-center gap-2 text-blue-700">
          <span className="grid size-10 place-items-center rounded-xl bg-blue-600 font-bold text-white">
            P
          </span>
          <span className="text-lg font-bold">Prospector AI</span>
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-950">
          {recovering ? "Recuperar contraseña" : "Iniciar sesión"}
        </h1>
        <p className="mt-2 text-sm leading-6 text-slate-500">
          {recovering
            ? "Te enviaremos un enlace seguro si el correo corresponde a la cuenta autorizada."
            : "Accede a tu espacio personal de prospección."}
        </p>
      </div>

      <form
        action={recovering ? recoveryFormAction : loginFormAction}
        className="space-y-5"
      >
        <div>
          <label
            htmlFor="email"
            className="mb-2 block text-sm font-medium text-slate-700"
          >
            Correo
          </label>
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            required
            className="min-h-11 w-full rounded-xl border border-slate-200 px-3 text-sm outline-none focus:border-blue-500 focus:ring-3 focus:ring-blue-100"
          />
        </div>
        {!recovering && (
          <div>
            <label
              htmlFor="password"
              className="mb-2 block text-sm font-medium text-slate-700"
            >
              Contraseña
            </label>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              required
              className="min-h-11 w-full rounded-xl border border-slate-200 px-3 text-sm outline-none focus:border-blue-500 focus:ring-3 focus:ring-blue-100"
            />
          </div>
        )}

        {state && (
          <p
            role="status"
            className={`rounded-xl px-3 py-2 text-sm ${state.ok ? "bg-emerald-50 text-emerald-800" : "bg-red-50 text-red-700"}`}
          >
            {state.ok
              ? "Si la cuenta es válida, recibirás un correo de recuperación."
              : state.message}
          </p>
        )}
        <SubmitButton label={recovering ? "Enviar enlace" : "Entrar"} />
      </form>

      <button
        type="button"
        onClick={() => setRecovering((value) => !value)}
        className="mt-5 w-full text-sm font-medium text-blue-700 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
      >
        {recovering ? "Volver al inicio de sesión" : "Olvidé mi contraseña"}
      </button>
    </div>
  );
}
