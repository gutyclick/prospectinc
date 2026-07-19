"use client";

import { Bell, ChevronDown, Menu, Search, UserRound } from "lucide-react";

type TopbarProps = {
  onOpenMobile: () => void;
};

export function Topbar({ onOpenMobile }: TopbarProps) {
  return (
    <header className="sticky top-0 z-30 flex h-[4.5rem] items-center gap-3 border-b border-[var(--border-subtle)] bg-white/95 px-4 backdrop-blur sm:px-6 lg:px-8">
      <button
        type="button"
        className="grid size-11 shrink-0 place-items-center rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 lg:hidden"
        onClick={onOpenMobile}
        aria-label="Abrir menú"
      >
        <Menu className="size-5" aria-hidden="true" />
      </button>

      <div className="relative max-w-xl min-w-0 flex-1">
        <Search
          className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-slate-400"
          aria-hidden="true"
        />
        <label htmlFor="busqueda-global" className="sr-only">
          Buscar negocio, ciudad o nicho
        </label>
        <input
          id="busqueda-global"
          type="search"
          placeholder="Buscar negocio, ciudad o nicho…"
          className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50/70 pr-4 pl-10 text-sm text-slate-900 transition outline-none placeholder:text-slate-400 focus:border-blue-400 focus:bg-white focus:ring-3 focus:ring-blue-100"
        />
      </div>

      <div className="ml-auto flex items-center gap-2 sm:gap-3">
        <button
          type="button"
          className="relative grid size-11 place-items-center rounded-xl text-slate-600 hover:bg-slate-50 hover:text-slate-950 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
          aria-label="Notificaciones, 3 nuevas"
        >
          <Bell className="size-5" strokeWidth={1.8} aria-hidden="true" />
          <span className="absolute top-1.5 right-1.5 grid min-w-4 place-items-center rounded-full bg-blue-600 px-1 text-[0.62rem] leading-4 font-bold text-white">
            3
          </span>
        </button>

        <details className="group relative">
          <summary className="flex min-h-11 cursor-pointer list-none items-center gap-2 rounded-xl px-1.5 hover:bg-slate-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 [&::-webkit-details-marker]:hidden">
            <span className="grid size-9 place-items-center rounded-full bg-gradient-to-br from-slate-700 to-slate-950 text-sm font-semibold text-white ring-2 ring-slate-100">
              G
            </span>
            <span className="hidden min-w-0 text-left sm:block">
              <span className="block text-sm font-semibold text-slate-900">
                Guzz
              </span>
              <span className="block text-xs text-slate-500">
                Plan Profesional
              </span>
            </span>
            <ChevronDown
              className="hidden size-4 text-slate-400 transition-transform group-open:rotate-180 sm:block"
              aria-hidden="true"
            />
          </summary>
          <div className="absolute top-[calc(100%+0.5rem)] right-0 w-56 rounded-2xl border border-slate-200 bg-white p-2 shadow-[var(--shadow-popover)]">
            <div className="border-b border-slate-100 px-3 py-2">
              <p className="text-sm font-semibold text-slate-900">Guzz</p>
              <p className="text-xs text-slate-500">Plan Profesional</p>
            </div>
            <button
              type="button"
              className="mt-1 flex min-h-10 w-full items-center gap-2 rounded-xl px-3 text-left text-sm text-slate-600 hover:bg-slate-50 focus-visible:outline-2 focus-visible:outline-blue-600"
            >
              <UserRound className="size-4" aria-hidden="true" />
              Ver perfil
            </button>
          </div>
        </details>
      </div>
    </header>
  );
}
