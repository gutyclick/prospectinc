import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";

import type { Database } from "@/types/database.types";

export async function verifyTaskOwner(
  client: SupabaseClient<Database>,
  ownerId: string,
) {
  const expectedEmail = process.env.APP_OWNER_EMAIL?.trim().toLowerCase();
  if (!expectedEmail) throw new Error("APP_OWNER_EMAIL no está configurado.");
  const { data, error } = await client
    .from("profiles")
    .select("id,email")
    .eq("id", ownerId)
    .single();
  if (error || !data || data.email.toLowerCase() !== expectedEmail) {
    throw new Error("El propietario de la tarea no está autorizado.");
  }
  return data;
}
