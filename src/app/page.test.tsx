import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import Home from "./page";

describe("Página inicial", () => {
  it("muestra el título de la sección", () => {
    render(<Home />);

    expect(
      screen.getByRole("heading", { level: 1, name: "Inicio" }),
    ).toBeInTheDocument();
  });
});
