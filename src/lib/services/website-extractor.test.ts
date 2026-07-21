import { describe, expect, it } from "vitest";

import { extractWebsiteFacts } from "./website-extractor";

const HTML = `<!doctype html><html lang="es"><head><title>Clínica Nova</title><meta name="description" content="Atención dental"><meta name="viewport" content="width=device-width"></head><body><h1>Tu sonrisa es nuestra prioridad</h1><h2>Nuestros servicios</h2><a href="mailto:citas@clinicanova.example">Correo</a><a href="tel:+507 6000-0000">Llamar</a><a href="https://wa.me/50760000000">WhatsApp</a><a href="/contacto">Contacto</a><form action="/contacto"><label>Mensaje<input name="mensaje"></label></form><footer>© 2026 Clínica Nova</footer></body></html>`;

describe("extracción factual de sitios", () => {
  it("extrae metadatos, capacidades y contactos sin inventar valores", () => {
    const facts = extractWebsiteFacts(HTML, "https://clinicanova.example/");
    expect(facts).toMatchObject({
      title: "Clínica Nova",
      hasMobileViewport: true,
      hasContactForm: true,
      hasWhatsapp: true,
      hasServicesContent: true,
      contactPageUrl: "https://clinicanova.example/contacto",
    });
    expect(facts.contacts).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          type: "email",
          value: "citas@clinicanova.example",
          sourceUrl: "https://clinicanova.example/",
        }),
        expect.objectContaining({
          type: "phone",
          normalizedValue: "+50760000000",
        }),
        expect.objectContaining({ type: "whatsapp" }),
      ]),
    );
  });

  it("no clasifica un teléfono normal como WhatsApp", () => {
    const facts = extractWebsiteFacts(
      '<a href="tel:+5071234567">Teléfono</a>',
      "https://empresa.example/",
    );
    expect(facts.hasWhatsapp).toBe(false);
    expect(facts.contacts.some((contact) => contact.type === "whatsapp")).toBe(
      false,
    );
  });
});
