"use client";

import { ChevronLeft, ChevronRight, Sparkles, X } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { navigationItems } from "./navigation-items";

type SidebarProps = {
  collapsed: boolean;
  mobileOpen: boolean;
  onCloseMobile: () => void;
  onToggle: () => void;
};

function isRouteActive(pathname: string, href: string) {
  return href === "/" ? pathname === href : pathname.startsWith(href);
}

export function Sidebar({
  collapsed,
  mobileOpen,
  onCloseMobile,
  onToggle,
}: SidebarProps) {
  const pathname = usePathname();

  return (
    <>
      {mobileOpen ? (
        <button
          type="button"
          className="fixed inset-0 z-40 bg-slate-950/25 backdrop-blur-[1px] lg:hidden"
          aria-label="Cerrar navegación"
          onClick={onCloseMobile}
        />
      ) : null}

      <aside
        className={`fixed inset-y-0 left-0 z-50 flex border-r border-[var(--border-subtle)] bg-white transition-[width,transform] duration-200 motion-reduce:transition-none lg:translate-x-0 ${
          collapsed ? "lg:w-[5.25rem]" : "lg:w-[15rem]"
        } ${mobileOpen ? "translate-x-0" : "-translate-x-full"} w-[17rem]`}
        aria-label="Navegación principal"
      >
        <div className="flex min-w-0 flex-1 flex-col px-3 py-4">
          <div className="flex h-12 items-center gap-3 px-2">
            <span
              className="relative grid size-9 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-blue-500 to-blue-700 text-lg font-black text-white shadow-[var(--shadow-brand)]"
              aria-hidden="true"
            >
              P
              <span className="absolute right-1.5 bottom-1.5 size-1.5 rounded-full bg-cyan-300" />
            </span>
            <span
              className={`truncate text-[1.05rem] font-bold tracking-tight text-slate-950 ${collapsed ? "lg:hidden" : ""}`}
            >
              Prospector <span className="text-blue-600">AI</span>
            </span>
            <button
              type="button"
              className="ml-auto grid size-10 place-items-center rounded-xl text-slate-500 hover:bg-slate-100 hover:text-slate-900 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 lg:hidden"
              onClick={onCloseMobile}
              aria-label="Cerrar menú"
            >
              <X className="size-5" aria-hidden="true" />
            </button>
          </div>

          <nav className="mt-8" aria-label="Secciones de Prospector AI">
            <ul className="space-y-1.5">
              {navigationItems.map((item) => {
                const active = isRouteActive(pathname, item.href);
                const Icon = item.icon;

                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      aria-current={active ? "page" : undefined}
                      title={collapsed ? item.label : undefined}
                      onClick={onCloseMobile}
                      className={`group flex min-h-11 items-center gap-3 rounded-xl px-3 text-sm font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 ${
                        active
                          ? "bg-blue-50 text-blue-700"
                          : "text-slate-600 hover:bg-slate-50 hover:text-slate-950"
                      } ${collapsed ? "lg:justify-center" : ""}`}
                    >
                      <Icon
                        className={`size-5 shrink-0 ${active ? "text-blue-600" : "text-slate-500 group-hover:text-slate-700"}`}
                        strokeWidth={1.8}
                        aria-hidden="true"
                      />
                      <span className={collapsed ? "lg:sr-only" : ""}>
                        {item.label}
                      </span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>

          <div className="mt-auto space-y-3 pt-8">
            <div
              className={`rounded-2xl border border-blue-100 bg-gradient-to-br from-blue-50 to-white p-3 ${collapsed ? "lg:grid lg:place-items-center" : ""}`}
            >
              <div className="flex items-center gap-3">
                <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-white text-blue-600 shadow-sm ring-1 ring-blue-100">
                  <Sparkles className="size-4" aria-hidden="true" />
                </span>
                <div className={`min-w-0 ${collapsed ? "lg:hidden" : ""}`}>
                  <p className="truncate text-xs font-semibold text-blue-700">
                    Plan Profesional
                  </p>
                  <p className="mt-0.5 truncate text-[0.7rem] text-slate-500">
                    Cuenta activa
                  </p>
                </div>
              </div>
            </div>

            <button
              type="button"
              className="hidden min-h-10 w-full items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white text-xs font-medium text-slate-600 hover:bg-slate-50 hover:text-slate-950 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 lg:flex"
              onClick={onToggle}
              aria-label={
                collapsed ? "Expandir barra lateral" : "Contraer barra lateral"
              }
            >
              {collapsed ? (
                <ChevronRight className="size-4" aria-hidden="true" />
              ) : (
                <>
                  <ChevronLeft className="size-4" aria-hidden="true" />
                  Contraer
                </>
              )}
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
