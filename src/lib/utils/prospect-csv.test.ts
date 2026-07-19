import { describe, expect, it } from "vitest";

import { mockProspects } from "@/lib/mock-data";

import { createProspectsCsv } from "./prospect-csv";

describe("CSV de prospectos", () => {
  it("incluye encabezados, contactos y URL de origen", () => {
    const csv = createProspectsCsv([mockProspects[0]]);

    expect(csv).toContain('"Negocio"');
    expect(csv).toContain('"Clínica Dental Nova"');
    expect(csv).toContain('"contacto@clinicadentalnova.example"');
    expect(csv).toContain('"https://clinicadentalnova.example/perfil-publico"');
  });
});
