import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { extractWebsiteFacts } from "./website-extractor";

const fixture = (name: string) =>
  readFileSync(
    join(process.cwd(), "src", "lib", "services", "fixtures", `${name}.html`),
    "utf8",
  );

describe("fixtures HTML de auditoría", () => {
  it.each([
    ["email", "email"],
    ["phone", "phone"],
    ["whatsapp", "whatsapp"],
    ["form", "contact_form"],
  ])("extrae el fixture %s", (name, type) => {
    const facts = extractWebsiteFacts(fixture(name), `https://${name}.test/`);
    expect(facts.contacts.some((contact) => contact.type === type)).toBe(true);
  });

  it("detecta reservas y no inventa contactos", () => {
    expect(
      extractWebsiteFacts(fixture("booking"), "https://booking.test/")
        .hasBooking,
    ).toBe(true);
    expect(
      extractWebsiteFacts(fixture("no-contacts"), "https://empty.test/")
        .contacts,
    ).toEqual([]);
  });

  it("marca el fixture JavaScript para navegador y no extrae scripts", () => {
    const facts = extractWebsiteFacts(
      fixture("javascript"),
      "https://javascript.test/",
    );
    expect(facts.requiresBrowser).toBe(true);
    expect(facts.contacts).toEqual([]);
  });

  it("no convierte enlaces maliciosos en contactos y detecta contenido de redirección", () => {
    expect(
      extractWebsiteFacts(fixture("malicious"), "https://safe.test/")
        .contacts,
    ).toEqual([]);
    expect(
      extractWebsiteFacts(fixture("redirect"), "https://safe.test/")
        .requiresBrowser,
    ).toBe(true);
  });
});
