"use client";

import { Copy, ExternalLink, Mail, MessageCircle, X } from "lucide-react";
import { useMemo, useState } from "react";

import { recordManualContactAction } from "@/app/actions/data";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  buildMailtoLink,
  buildWhatsappLink,
  type PreparedContact,
} from "@/lib/domain/manual-contact";

export function ContactPreparationModal({
  prepared,
  onClose,
  onRecorded,
}: {
  prepared: PreparedContact;
  onClose: () => void;
  onRecorded: (message: string) => void;
}) {
  const [subject, setSubject] = useState(prepared.subject);
  const [body, setBody] = useState(prepared.body);
  const [followUpAt, setFollowUpAt] = useState("");
  const [opened, setOpened] = useState(false);
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState("");
  const href = useMemo(() => {
    try {
      return prepared.channel === "correo"
        ? buildMailtoLink(prepared.recipient, subject, body)
        : buildWhatsappLink(prepared.recipient, body);
    } catch {
      return "#";
    }
  }, [body, prepared, subject]);
  const contact = prepared;
  const isEmail = contact.channel === "correo";

  async function copyMessage() {
    await navigator.clipboard.writeText(
      isEmail ? `${subject}\n\n${body}` : body,
    );
    setNotice("Contenido copiado.");
  }
  async function record() {
    const allowRepeat =
      contact.recentContact &&
      window.confirm(
        "Existe un contacto por este canal durante los últimos 7 días. ¿Confirmas que deseas registrar otro mensaje individual?",
      );
    if (contact.recentContact && !allowRepeat) return;
    setBusy(true);
    const result = await recordManualContactAction({
      proposalId: contact.proposalId,
      contactPointId: contact.contactPointId,
      channel: contact.channel,
      subject,
      body,
      allowRepeat,
      followUpAt: followUpAt ? new Date(followUpAt).toISOString() : null,
    });
    setBusy(false);
    if (!result.ok) return setNotice(result.error);
    onRecorded(
      "Contacto marcado manualmente como enviado. El enlace abierto no se tomó como confirmación automática.",
    );
    onClose();
  }

  return (
    <div
      className="fixed inset-0 z-50 grid place-items-center bg-slate-950/40 p-4"
      onMouseDown={(event) => event.target === event.currentTarget && onClose()}
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="contact-title"
        className="max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white p-5 shadow-2xl"
      >
        <header className="flex items-start justify-between gap-4">
          <div>
            <h2 id="contact-title" className="text-lg font-bold">
              {isEmail ? "Preparar correo" : "Preparar WhatsApp"}
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              El envío es individual y completamente manual.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar preparación"
            className="grid size-11 place-items-center rounded-xl hover:bg-slate-100"
          >
            <X className="size-5" />
          </button>
        </header>
        {prepared.recentContact ? (
          <p
            role="alert"
            className="mt-4 rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900"
          >
            Ya registraste un contacto por este canal durante los últimos 7
            días.
          </p>
        ) : null}
        <dl className="mt-4 grid gap-2 text-sm">
          <div>
            <dt className="font-semibold">Destinatario público</dt>
            <dd>{prepared.recipient}</dd>
          </div>
          <div>
            <dt className="font-semibold">Fuente</dt>
            <dd>
              <a
                href={prepared.sourceUrl}
                target="_blank"
                rel="noreferrer"
                className="text-blue-700 underline"
              >
                {prepared.sourceUrl}
              </a>
            </dd>
          </div>
        </dl>
        {isEmail ? (
          <label className="mt-4 block text-sm font-semibold">
            Asunto
            <input
              value={subject}
              onChange={(event) => setSubject(event.target.value)}
              className="mt-1 min-h-11 w-full rounded-xl border border-slate-200 px-3 font-normal"
            />
          </label>
        ) : null}
        <label className="mt-4 block text-sm font-semibold">
          Mensaje
          <textarea
            value={body}
            onChange={(event) => setBody(event.target.value)}
            rows={9}
            className="mt-1 w-full rounded-xl border border-slate-200 p-3 font-normal"
          />
        </label>
        <label className="mt-4 block text-sm font-semibold">
          Seguimiento opcional
          <input
            type="datetime-local"
            value={followUpAt}
            onChange={(event) => setFollowUpAt(event.target.value)}
            className="mt-1 min-h-11 w-full rounded-xl border border-slate-200 px-3 font-normal"
          />
        </label>
        {!isEmail ? (
          <p className="mt-3 rounded-xl bg-blue-50 p-3 text-sm text-blue-900">
            WhatsApp se abrirá con el mensaje preparado. Debes revisarlo y
            pulsar Enviar personalmente.
          </p>
        ) : null}
        <div aria-live="polite" className="mt-3 text-sm text-slate-600">
          {notice}
        </div>
        <footer className="mt-5 flex flex-wrap justify-end gap-2">
          <Button variant="outline" onClick={() => void copyMessage()}>
            <Copy className="size-4" /> Copiar
          </Button>
          <a
            className={buttonVariants()}
            href={href}
            target="_blank"
            rel="noreferrer"
            onClick={() => setOpened(true)}
          >
            {isEmail ? (
              <Mail className="size-4" />
            ) : (
              <MessageCircle className="size-4" />
            )}{" "}
            {isEmail ? "Abrir cliente de correo" : "Abrir WhatsApp"}
            <ExternalLink className="size-4" />
          </a>
          {opened ? (
            <Button onClick={() => void record()} disabled={busy}>
              {busy ? "Registrando…" : "Marcar como enviado"}
            </Button>
          ) : null}
        </footer>
      </section>
    </div>
  );
}
