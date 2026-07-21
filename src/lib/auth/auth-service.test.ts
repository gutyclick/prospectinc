import { describe, expect, it, vi } from "vitest";

import {
  requestPasswordReset,
  signInOwner,
  signOutUser,
  type PasswordAuthClient,
} from "./auth-service";

function createAuthClient(overrides: Partial<PasswordAuthClient["auth"]> = {}) {
  const auth: PasswordAuthClient["auth"] = {
    signInWithPassword: vi.fn().mockResolvedValue({
      data: { user: { email: "owner@example.com" } },
      error: null,
    }),
    signOut: vi.fn().mockResolvedValue({ error: null }),
    resetPasswordForEmail: vi.fn().mockResolvedValue({ error: null }),
    updateUser: vi.fn().mockResolvedValue({ error: null }),
    ...overrides,
  };
  return { client: { auth } satisfies PasswordAuthClient, auth };
}

describe("servicio de autenticación", () => {
  it("inicia sesión solo con la cuenta propietaria", async () => {
    const { client, auth } = createAuthClient();
    await expect(
      signInOwner(
        client,
        { email: "owner@example.com", password: "Password123" },
        "owner@example.com",
      ),
    ).resolves.toEqual({ ok: true });
    expect(auth.signInWithPassword).toHaveBeenCalledOnce();
  });

  it("rechaza una cuenta no autorizada antes de llamar Supabase", async () => {
    const { client, auth } = createAuthClient();
    const result = await signInOwner(
      client,
      { email: "otro@example.com", password: "Password123" },
      "owner@example.com",
    );
    expect(result).toMatchObject({ ok: false, unauthorized: true });
    expect(auth.signInWithPassword).not.toHaveBeenCalled();
  });

  it("cierra la sesión con el cliente de servidor", async () => {
    const { client, auth } = createAuthClient();
    await expect(signOutUser(client)).resolves.toEqual({ ok: true });
    expect(auth.signOut).toHaveBeenCalledOnce();
  });

  it("no revela si un correo de recuperación está autorizado", async () => {
    const { client, auth } = createAuthClient();
    await expect(
      requestPasswordReset(
        client,
        "otro@example.com",
        "owner@example.com",
        "http://localhost:3000/auth/confirm",
      ),
    ).resolves.toEqual({ ok: true });
    expect(auth.resetPasswordForEmail).not.toHaveBeenCalled();
  });
});
