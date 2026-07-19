import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import HomePage from "./page";

describe("Página inicial", () => {
  it("muestra el saludo y la descripción del panel", async () => {
    render(await HomePage());

    expect(
      screen.getByRole("heading", { level: 1, name: "Buenos días, Guzz" }),
    ).toBeInTheDocument();
    expect(
      screen.getByText("Estas son tus mejores oportunidades de hoy."),
    ).toBeInTheDocument();
  });
});
