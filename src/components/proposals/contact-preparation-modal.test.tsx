import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { recordManualContactAction } from "@/app/actions/data";
import { ContactPreparationModal } from "./contact-preparation-modal";

vi.mock("@/app/actions/data", () => ({ recordManualContactAction: vi.fn() }));

const prepared = {
  proposalId: "11111111-1111-4111-8111-111111111111",
  contactPointId: "22222222-2222-4222-8222-222222222222",
  channel: "correo" as const,
  recipient: "ventas@empresa.com",
  sourceUrl: "https://empresa.com/contacto",
  subject: "Propuesta",
  body: "Mensaje individual",
  href: "mailto:test",
  recentContact: false,
};

describe("preparación manual de contacto", () => {
  beforeEach(() =>
    vi
      .mocked(recordManualContactAction)
      .mockResolvedValue({
        ok: true,
        data: { conversationId: "33333333-3333-4333-8333-333333333333" },
      }),
  );
  it("no marca enviado hasta abrir el canal y conserva el seguimiento", async () => {
    const user = userEvent.setup();
    render(
      <ContactPreparationModal
        prepared={prepared}
        onClose={vi.fn()}
        onRecorded={vi.fn()}
      />,
    );
    expect(
      screen.queryByRole("button", { name: "Marcar como enviado" }),
    ).not.toBeInTheDocument();
    await user.click(
      screen.getByRole("link", { name: /Abrir cliente de correo/ }),
    );
    await user.type(
      screen.getByLabelText("Seguimiento opcional"),
      "2026-07-25T14:00",
    );
    await user.click(
      screen.getByRole("button", { name: "Marcar como enviado" }),
    );
    expect(recordManualContactAction).toHaveBeenCalledWith(
      expect.objectContaining({
        channel: "correo",
        followUpAt: expect.stringContaining("2026-07-25"),
      }),
    );
  });
});
