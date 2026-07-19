"use server";

import { redirect } from "next/navigation";
import { z } from "zod";

import {
  requestPasswordReset,
  signInOwner,
  type AuthResult,
} from "@/lib/auth/auth-service";
import { createClient } from "@/lib/supabase/server";

const loginSchema = z.object({
  email: z.email("Introduce un correo válido."),
  password: z.string().min(1, "Introduce tu contraseña."),
});

export type LoginActionState = AuthResult | null;

export async function loginAction(
  _state: LoginActionState,
  formData: FormData,
): Promise<LoginActionState> {
  const parsed = loginSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return {
      ok: false,
      message: parsed.error.issues[0]?.message ?? "Datos inválidos.",
    };
  }

  const supabase = await createClient();
  const result = await signInOwner(
    supabase,
    parsed.data,
    process.env.APP_OWNER_EMAIL,
  );
  if (!result.ok) return result;
  redirect("/");
}

export async function recoverPasswordAction(
  _state: LoginActionState,
  formData: FormData,
): Promise<LoginActionState> {
  const parsed = z
    .object({ email: z.email() })
    .safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return { ok: false, message: "Introduce un correo válido." };
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "");
  if (!appUrl)
    return { ok: false, message: "Falta configurar NEXT_PUBLIC_APP_URL." };
  const supabase = await createClient();
  const result = await requestPasswordReset(
    supabase,
    parsed.data.email,
    process.env.APP_OWNER_EMAIL,
    `${appUrl}/auth/confirm?next=/actualizar-contrasena`,
  );
  return result.ok ? { ok: true } : result;
}
