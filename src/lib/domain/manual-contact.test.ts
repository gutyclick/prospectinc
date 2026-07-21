import { describe, expect, it } from "vitest";
import {
  assertManualContactPolicy,
  buildMailtoLink,
  buildWhatsappLink,
  internationalWhatsappSchema,
  recordManualContactSchema,
} from "./manual-contact";

describe("enlaces de contacto manual", () => {
  it("codifica destinatario, asunto y cuerpo para mailto", () => {
    expect(
      buildMailtoLink(
        "ventas@empresa.com",
        "Propuesta & revisión",
        "Hola, ¿cómo está?",
      ),
    ).toBe(
      "mailto:ventas@empresa.com?subject=Propuesta%20%26%20revisi%C3%B3n&body=Hola%2C%20%C2%BFc%C3%B3mo%20est%C3%A1%3F",
    );
  });
  it("crea wa.me sin inventar ni conservar el signo +", () => {
    expect(buildWhatsappLink("+50760000000", "Hola & gracias")).toBe(
      "https://wa.me/50760000000?text=Hola%20%26%20gracias",
    );
  });
  it.each(["60000000", "+012345678", "+507 6000-0000"])(
    "rechaza WhatsApp no internacional: %s",
    (number) => {
      expect(internationalWhatsappSchema.safeParse(number).success).toBe(false);
    },
  );
  it("bloquea exclusión, duplicado no confirmado y límite diario", () => {
    const base = {
      proposalReviewed: true,
      hasSource: true,
      isExcluded: false,
      sentToday: 0,
      dailyLimit: 25,
      recentContact: false,
      allowRepeat: false,
    };
    expect(() =>
      assertManualContactPolicy({ ...base, isExcluded: true }),
    ).toThrow("excluido");
    expect(() =>
      assertManualContactPolicy({ ...base, recentContact: true }),
    ).toThrow("reciente");
    expect(() => assertManualContactPolicy({ ...base, sentToday: 25 })).toThrow(
      "límite diario",
    );
    expect(() =>
      assertManualContactPolicy({
        ...base,
        recentContact: true,
        allowRepeat: true,
      }),
    ).not.toThrow();
  });
  it("valida el registro manual y un seguimiento ISO", () => {
    expect(
      recordManualContactSchema.parse({
        proposalId: "11111111-1111-4111-8111-111111111111",
        contactPointId: "22222222-2222-4222-8222-222222222222",
        channel: "correo",
        subject: "Propuesta",
        body: "Mensaje revisado",
        followUpAt: "2026-07-25T14:00:00.000Z",
      }).followUpAt,
    ).toContain("2026-07-25");
  });
});
