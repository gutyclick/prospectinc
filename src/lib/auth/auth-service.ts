import { isOwnerEmail } from "./authorization";

type AuthError = { message: string } | null;

export type PasswordAuthClient = {
  auth: {
    signInWithPassword(credentials: {
      email: string;
      password: string;
    }): Promise<{
      data: { user: { email?: string } | null };
      error: AuthError;
    }>;
    signOut(): Promise<{ error: AuthError }>;
    resetPasswordForEmail(
      email: string,
      options: { redirectTo: string },
    ): Promise<{ error: AuthError }>;
    updateUser(attributes: { password: string }): Promise<{ error: AuthError }>;
  };
};

export type AuthResult =
  { ok: true } | { ok: false; message: string; unauthorized?: boolean };

export async function signInOwner(
  client: PasswordAuthClient,
  credentials: { email: string; password: string },
  ownerEmail: string | undefined,
): Promise<AuthResult> {
  if (!isOwnerEmail(credentials.email, ownerEmail)) {
    return {
      ok: false,
      unauthorized: true,
      message: "Esta cuenta no está autorizada para usar Prospector AI.",
    };
  }

  const { data, error } = await client.auth.signInWithPassword(credentials);
  if (error || !data.user) {
    return { ok: false, message: "Correo o contraseña incorrectos." };
  }

  if (!isOwnerEmail(data.user.email, ownerEmail)) {
    await client.auth.signOut();
    return {
      ok: false,
      unauthorized: true,
      message: "Esta cuenta no está autorizada para usar Prospector AI.",
    };
  }

  return { ok: true };
}

export async function signOutUser(
  client: PasswordAuthClient,
): Promise<AuthResult> {
  const { error } = await client.auth.signOut();
  return error
    ? { ok: false, message: "No se pudo cerrar la sesión." }
    : { ok: true };
}

export async function requestPasswordReset(
  client: PasswordAuthClient,
  email: string,
  ownerEmail: string | undefined,
  redirectTo: string,
): Promise<AuthResult> {
  // La respuesta es deliberadamente uniforme para no revelar cuentas existentes.
  if (!isOwnerEmail(email, ownerEmail)) return { ok: true };
  const { error } = await client.auth.resetPasswordForEmail(email, {
    redirectTo,
  });
  return error
    ? { ok: false, message: "No se pudo solicitar la recuperación." }
    : { ok: true };
}

export async function updatePassword(
  client: PasswordAuthClient,
  password: string,
): Promise<AuthResult> {
  const { error } = await client.auth.updateUser({ password });
  return error
    ? { ok: false, message: "No se pudo actualizar la contraseña." }
    : { ok: true };
}
