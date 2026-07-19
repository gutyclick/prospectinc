import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";

import { prospectRepository } from "@/lib/repositories";

import { PriorityProspectsTable } from "./priority-prospects-table";

describe("oportunidades prioritarias", () => {
  it("renderiza los prospectos prioritarios", async () => {
    const prospects = await prospectRepository.getPriorityProspects();
    render(<PriorityProspectsTable prospects={prospects} />);

    expect(screen.getByRole("table")).toBeInTheDocument();
    expect(screen.getByText("Clínica Dental Nova")).toBeInTheDocument();
    expect(screen.getByText("Taller AutoMax")).toBeInTheDocument();
    expect(screen.getByText("Restaurante La Toscana")).toBeInTheDocument();
  });

  it("abre y cierra el panel de detalle", async () => {
    const user = userEvent.setup();
    const prospects = await prospectRepository.getPriorityProspects();
    render(<PriorityProspectsTable prospects={prospects} />);

    await user.click(
      screen.getByRole("button", { name: "Ver Clínica Dental Nova" }),
    );

    const dialog = screen.getByRole("dialog", { name: "Clínica Dental Nova" });
    expect(dialog).toBeInTheDocument();
    expect(
      within(dialog).getByText(/buena reputación local/i),
    ).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Cerrar panel" }));

    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });
});
