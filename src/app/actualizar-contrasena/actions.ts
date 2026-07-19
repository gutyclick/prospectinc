"use server";

import { redirect } from "next/navigation";
import { z } from "zod";

import { updatePassword } from "@/lib/auth/auth-service";
import { requireOwner } from "@/lib/auth/require-owner";
import { createClient } from "@/lib/supabase/server";

export type PasswordActionState = { ok: false; message: string } | null;

export async function updatePasswordAction(
  _state: PasswordActionState,
  formData: FormData,
): Promise<PasswordActionState> {
  const parsed = z
    .object({
      password: z.string().min(10, "Usa al menos 10 caracteres."),
      confirmation: z.string(),
    })
    .refine((value) => value.password === value.confirmation, {
      message: "Las contraseñas no coinciden.",
      path: ["confirmation"],
    })
    .safeParse(Object.fromEntries(formData));
  if (!parsed.success)
    return {
      ok: false,
      message: parsed.error.issues[0]?.message ?? "Datos inválidos.",
    };

  await requireOwner();
  const supabase = await createClient();
  const result = await updatePassword(supabase, parsed.data.password);
  if (!result.ok) return result;
  redirect("/");
}
