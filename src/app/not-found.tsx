import { ArrowLeft, SearchX } from "lucide-react";
import Link from "next/link";

export default function NotFound() {
  return (
    <main className="grid min-h-[60vh] place-items-center p-6">
      <section className="max-w-lg text-center">
        <span className="mx-auto grid size-12 place-items-center rounded-2xl bg-blue-50 text-blue-600">
          <SearchX className="size-6" aria-hidden="true" />
        </span>
        <h1 className="mt-4 text-2xl font-bold text-slate-950">
          Página no encontrada
        </h1>
        <p className="mt-2 text-sm leading-6 text-slate-600">
          La ruta solicitada no existe en Prospector AI.
        </p>
        <Link
          href="/"
          className="mt-5 inline-flex min-h-11 items-center gap-2 rounded-xl bg-blue-600 px-4 text-sm font-semibold text-white hover:bg-blue-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
        >
          <ArrowLeft className="size-4" aria-hidden="true" /> Volver al inicio
        </Link>
      </section>
    </main>
  );
}
