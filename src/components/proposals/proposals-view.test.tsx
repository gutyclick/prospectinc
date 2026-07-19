import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it } from "vitest";

import { proposalRepository, prospectRepository } from "@/lib/repositories";

import { ProposalsView } from "./proposals-view";

async function loadData() {
  return Promise.all([
    proposalRepository.getAll(),
    prospectRepository.getAll(),
  ]);
}

describe("página de propuestas", () => {
  beforeEach(() => proposalRepository.reset());

  it("precarga el prospecto recibido mediante la URL", async () => {
    const [proposals, prospects] = await loadData();
    render(
      <ProposalsView
        initialProposals={proposals}
        prospects={prospects}
        initialProspectId="prospect-taller-automax"
      />,
    );

    expect(
      screen.getByRole("dialog", { name: "Nueva propuesta" }),
    ).toBeInTheDocument();
    expect(screen.getByLabelText("Prospecto")).toHaveValue(
      "prospect-taller-automax",
    );
  });

  it("genera contenido y crea una propuesta simulada", async () => {
    const user = userEvent.setup();
    const [proposals, prospects] = await loadData();
    render(
      <ProposalsView initialProposals={proposals} prospects={prospects} />,
    );

    await user.click(screen.getByRole("button", { name: "Nueva propuesta" }));
    await user.selectOptions(
      screen.getByLabelText("Prospecto"),
      "prospect-clinica-dental-nova",
    );
    await user.selectOptions(
      screen.getByLabelText("Plantilla"),
      "reservas-online",
    );
    await user.click(
      screen.getByRole("button", { name: "Generar contenido con IA" }),
    );
    expect(screen.getByLabelText("Servicio")).toHaveValue(
      "Web con reservas online",
    );
    await user.click(screen.getByRole("button", { name: "Crear borrador" }));

    await waitFor(() =>
      expect(screen.getAllByText(/creada como borrador/i)).toHaveLength(2),
    );
    expect(
      screen.getAllByText("Web con reservas online").length,
    ).toBeGreaterThan(0);
    await expect(proposalRepository.getAll()).resolves.toHaveLength(6);
  });

  it("cambia el estado a lista sin enviar mensajes", async () => {
    const user = userEvent.setup();
    const [proposals, prospects] = await loadData();
    render(
      <ProposalsView initialProposals={proposals} prospects={prospects} />,
    );

    await user.click(screen.getByRole("button", { name: "Enviar propuesta" }));
    expect(
      screen.getByText(/no se enviará ningún correo ni mensaje/i),
    ).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Marcar como lista" }));

    await waitFor(() =>
      expect(screen.getAllByText(/no se envió ningún mensaje/i)).toHaveLength(
        2,
      ),
    );
    await expect(
      proposalRepository.getByProspectId("prospect-clinica-dental-nova"),
    ).resolves.toEqual([expect.objectContaining({ status: "lista" })]);
  });
});
