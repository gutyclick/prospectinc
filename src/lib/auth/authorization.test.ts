import { describe, expect, it } from "vitest";

import {
  getAuthRedirectPath,
  isOwnerEmail,
  isPublicPath,
} from "./authorization";

describe("autorización de rutas", () => {
  it("normaliza y valida el correo propietario", () => {
    expect(isOwnerEmail(" Guzz@Example.com ", "guzz@example.com")).toBe(true);
    expect(isOwnerEmail("otro@example.com", "guzz@example.com")).toBe(false);
    expect(isOwnerEmail("guzz@example.com", undefined)).toBe(false);
  });

  it("reconoce exclusivamente las rutas públicas de autenticación", () => {
    expect(isPublicPath("/login")).toBe(true);
    expect(isPublicPath("/auth/confirm")).toBe(true);
    expect(isPublicPath("/prospectos")).toBe(false);
  });

  it("protege rutas internas y redirige el login autenticado", () => {
    expect(
      getAuthRedirectPath({
        pathname: "/prospectos",
        authenticated: false,
        authorized: false,
      }),
    ).toBe("/login");
    expect(
      getAuthRedirectPath({
        pathname: "/prospectos",
        authenticated: true,
        authorized: false,
      }),
    ).toBe("/login");
    expect(
      getAuthRedirectPath({
        pathname: "/login",
        authenticated: true,
        authorized: true,
      }),
    ).toBe("/");
    expect(
      getAuthRedirectPath({
        pathname: "/bandeja",
        authenticated: true,
        authorized: true,
      }),
    ).toBeNull();
  });
});
