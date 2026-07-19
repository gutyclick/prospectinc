"use client";

import { useState, type ReactNode } from "react";

import { Sidebar } from "./sidebar";
import { Topbar } from "./topbar";

type AppShellProps = {
  children: ReactNode;
};

export function AppShell({ children }: AppShellProps) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="min-h-screen overflow-x-clip bg-[var(--app-background)]">
      <a
        href="#contenido-principal"
        className="fixed top-3 left-3 z-[70] -translate-y-20 rounded-lg bg-blue-700 px-4 py-2 text-sm font-semibold text-white transition-transform focus:translate-y-0"
      >
        Saltar al contenido
      </a>
      <Sidebar
        collapsed={collapsed}
        mobileOpen={mobileOpen}
        onCloseMobile={() => setMobileOpen(false)}
        onToggle={() => setCollapsed((current) => !current)}
      />
      <div
        className={`min-h-screen min-w-0 transition-[padding] duration-200 motion-reduce:transition-none ${
          collapsed ? "lg:pl-[5.25rem]" : "lg:pl-[15rem]"
        }`}
      >
        <Topbar onOpenMobile={() => setMobileOpen(true)} />
        <main
          id="contenido-principal"
          className="min-w-0 px-4 py-7 sm:px-6 lg:px-8 lg:py-8"
        >
          <div className="mx-auto w-[calc(100vw-2rem)] max-w-[90rem] min-w-0 sm:w-[calc(100vw-3rem)] lg:w-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
