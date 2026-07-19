import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it } from "vitest";

import {
  conversationRepository,
  proposalRepository,
  prospectRepository,
} from "@/lib/repositories";

import { InboxView } from "./inbox-view";

async function renderInbox() {
  const [items, proposals] = await Promise.all([
    conversationRepository.getInboxItems(50),
    proposalRepository.getAll(),
  ]);
  render(<InboxView initialItems={items} proposals={proposals} />);
}

describe("bandeja unificada", () => {
  beforeEach(() => {
    conversationRepository.reset();
    prospectRepository.reset();
  });

  it("filtra y selecciona conversaciones", async () => {
    const user = userEvent.setup();
    await renderInbox();
    const list = screen.getByRole("list", { name: "Conversaciones" });
    await user.click(screen.getByRole("button", { name: /Por contactar1/ }));
    expect(within(list).getByText("Clínica Dental Nova")).toBeInTheDocument();
    expect(within(list).queryByText("Taller AutoMax")).not.toBeInTheDocument();
    await user.click(within(list).getByText("Clínica Dental Nova"));
    expect(
      screen.getByRole("heading", { name: "Clínica Dental Nova" }),
    ).toBeInTheDocument();
  });

  it("muestra y conserva una respuesta sugerida editable", async () => {
    const user = userEvent.setup();
    await renderInbox();
    const textarea = screen.getByLabelText("Respuesta sugerida editable");
    expect((textarea as HTMLTextAreaElement).value).toContain("reservas");
    await user.clear(textarea);
    await user.type(textarea, "Respuesta revisada para el prospecto.");
    await user.click(screen.getByRole("button", { name: "Guardar respuesta" }));
    await expect(
      conversationRepository.getDraftResponse(
        "conversation-restaurante-la-toscana",
      ),
    ).resolves.toBe("Respuesta revisada para el prospecto.");
  });

  it("cambia el estado comercial a negociación", async () => {
    const user = userEvent.setup();
    await renderInbox();
    await user.click(
      screen.getByRole("button", { name: "Marcar negociación" }),
    );
    await waitFor(() =>
      expect(screen.getAllByText("Negociación").length).toBeGreaterThan(0),
    );
    await expect(
      prospectRepository.getProspectById("prospect-restaurante-la-toscana"),
    ).resolves.toMatchObject({ commercialStatus: "negociacion" });
  });

  it("programa y persiste un seguimiento", async () => {
    const user = userEvent.setup();
    await renderInbox();
    const input = screen.getByLabelText("Fecha y hora de seguimiento");
    await user.clear(input);
    await user.type(input, "2026-07-25T10:30");
    await user.click(screen.getByRole("button", { name: "Programar" }));
    await waitFor(() =>
      expect(
        screen.getAllByText(/seguimiento programado correctamente/i),
      ).toHaveLength(2),
    );
    const conversations = await conversationRepository.getAll();
    expect(
      conversations.find(
        (item) => item.id === "conversation-restaurante-la-toscana",
      ),
    ).toMatchObject({
      status: "seguimiento",
      followUpAt: "2026-07-25T15:30:00.000Z",
    });
  });
});
