import { load } from "cheerio";

export type ExtractedContact = {
  type:
    "email" | "phone" | "whatsapp" | "contact_form" | "instagram" | "facebook";
  value: string;
  normalizedValue: string;
  sourceUrl: string;
};

export type WebsiteFacts = {
  title: string | null;
  metaDescription: string | null;
  hasMobileViewport: boolean;
  language: string | null;
  hasContactForm: boolean;
  hasWhatsapp: boolean;
  hasBooking: boolean;
  hasServicesContent: boolean;
  hasMetaDescription: boolean;
  copyright: string | null;
  mainCommercialText: string | null;
  visibleServices: string[];
  contactPageUrl: string | null;
  socialLinks: string[];
  contacts: ExtractedContact[];
  requiresBrowser: boolean;
};

const EMAIL_PATTERN = /\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/gi;
const BUSINESS_WORDS =
  /contact|empresa|negocio|servicio|reserva|cita|cotiza|ventas/i;

function normalizePhone(value: string) {
  return value.replace(/[^\d+]/g, "").replace(/(?!^)\+/g, "");
}

export function extractWebsiteFacts(
  html: string,
  sourceUrl: string,
): WebsiteFacts {
  const $ = load(html);
  $("script,style,noscript,svg").remove();
  const text = $("body").text().replace(/\s+/g, " ").trim();
  const links = $("a[href]")
    .toArray()
    .map((node) => ({
      href: ($(node).attr("href") ?? "").trim(),
      text: $(node).text().replace(/\s+/g, " ").trim(),
    }));
  const contacts: ExtractedContact[] = [];
  const add = (contact: ExtractedContact) => {
    if (
      contact.normalizedValue &&
      !contacts.some(
        (item) =>
          item.type === contact.type &&
          item.normalizedValue === contact.normalizedValue,
      )
    )
      contacts.push(contact);
  };
  for (const link of links) {
    const lower = link.href.toLowerCase();
    if (lower.startsWith("mailto:")) {
      const value = decodeURIComponent(link.href.slice(7).split("?")[0]).trim();
      add({
        type: "email",
        value,
        normalizedValue: value.toLowerCase(),
        sourceUrl,
      });
    } else if (lower.startsWith("tel:")) {
      const value = decodeURIComponent(link.href.slice(4).split("?")[0]).trim();
      add({
        type: "phone",
        value,
        normalizedValue: normalizePhone(value),
        sourceUrl,
      });
    } else if (
      /https?:\/\/(wa\.me|api\.whatsapp\.com|www\.whatsapp\.com)\//i.test(
        link.href,
      )
    ) {
      add({
        type: "whatsapp",
        value: link.href,
        normalizedValue: link.href.toLowerCase(),
        sourceUrl,
      });
    } else if (/instagram\.com\//i.test(link.href)) {
      add({
        type: "instagram",
        value: link.href,
        normalizedValue: link.href.toLowerCase(),
        sourceUrl,
      });
    } else if (/facebook\.com\//i.test(link.href)) {
      add({
        type: "facebook",
        value: link.href,
        normalizedValue: link.href.toLowerCase(),
        sourceUrl,
      });
    }
  }
  if (BUSINESS_WORDS.test(text)) {
    for (const value of text.match(EMAIL_PATTERN) ?? [])
      add({
        type: "email",
        value,
        normalizedValue: value.toLowerCase(),
        sourceUrl,
      });
  }
  const forms = $("form");
  const hasContactForm = forms
    .toArray()
    .some((form) =>
      /contact|mensaje|message|consulta|correo|email/i.test(
        $(form).text() + " " + ($(form).attr("action") ?? ""),
      ),
    );
  if (hasContactForm)
    add({
      type: "contact_form",
      value: sourceUrl,
      normalizedValue: sourceUrl,
      sourceUrl,
    });
  const contactLink = links.find((link) =>
    /contact|contacto/i.test(link.text + " " + link.href),
  );
  const booking = links.some((link) =>
    /reserv|booking|appointment|cita|agenda/i.test(link.text + " " + link.href),
  );
  const serviceHeadings = $("h2,h3")
    .toArray()
    .map((node) => $(node).text().replace(/\s+/g, " ").trim())
    .filter((value) => value.length >= 3 && value.length <= 100)
    .filter((value) =>
      /servicio|tratamiento|soluci[oó]n|especialidad/i.test(value),
    )
    .slice(0, 8);
  const copyright =
    text.match(/(?:©|copyright)\s*(?:\d{4})?[^.]{0,100}/i)?.[0] ?? null;
  const metaDescription =
    $('meta[name="description"]').attr("content")?.trim() || null;
  const socialLinks = contacts
    .filter((item) => item.type === "instagram" || item.type === "facebook")
    .map((item) => item.value);
  return {
    title: $("title").first().text().trim() || null,
    metaDescription,
    hasMobileViewport: Boolean($('meta[name="viewport"]').attr("content")),
    language: $("html").attr("lang")?.trim() || null,
    hasContactForm,
    hasWhatsapp: contacts.some((item) => item.type === "whatsapp"),
    hasBooking: booking,
    hasServicesContent:
      serviceHeadings.length > 0 ||
      /nuestros servicios|tratamientos|soluciones/i.test(text),
    hasMetaDescription: Boolean(metaDescription),
    copyright,
    mainCommercialText:
      $("h1").first().text().replace(/\s+/g, " ").trim().slice(0, 300) || null,
    visibleServices: serviceHeadings,
    contactPageUrl: contactLink
      ? new URL(contactLink.href, sourceUrl).href
      : null,
    socialLinks,
    contacts,
    requiresBrowser:
      text.length < 120 ||
      (/id=["'](?:root|app|__next)["']/i.test(html) && text.length < 500),
  };
}
