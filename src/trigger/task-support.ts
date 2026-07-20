import "server-only";

import { AbortTaskRunError } from "@trigger.dev/sdk";
import { z } from "zod";

import { createServiceRoleClient } from "@/lib/supabase/service-role";
import { verifyTaskOwner } from "@/lib/services/task-authorization";

export const ownedTaskPayloadSchema = z.object({
  searchId: z.string().uuid(),
  ownerId: z.string().uuid(),
});

export async function getAuthorizedOwnerContext(ownerIdInput: unknown) {
  const ownerId = z.string().uuid().safeParse(ownerIdInput);
  if (!ownerId.success) throw new AbortTaskRunError("Propietario inválido.");
  try {
    const client = createServiceRoleClient();
    await verifyTaskOwner(client, ownerId.data);
    return { ownerId: ownerId.data, client };
  } catch {
    throw new AbortTaskRunError("Propietario o credenciales no autorizados.");
  }
}

export async function getAuthorizedTaskContext(input: unknown) {
  const parsed = ownedTaskPayloadSchema.safeParse(input);
  if (!parsed.success)
    throw new AbortTaskRunError("Payload de tarea inválido.");
  return {
    ...parsed.data,
    ...(await getAuthorizedOwnerContext(parsed.data.ownerId)),
  };
}

export async function markSearchFailed(
  input: unknown,
  message: string,
  externalRunId?: string,
) {
  const parsed = ownedTaskPayloadSchema.safeParse(input);
  if (!parsed.success) return;
  try {
    const client = createServiceRoleClient();
    await client
      .from("searches")
      .update({
        status: "fallida",
        processing_stage: "fallido",
        error_message: message,
        progress: 100,
        completed_at: new Date().toISOString(),
        external_run_id: externalRunId,
      })
      .eq("id", parsed.data.searchId)
      .eq("owner_id", parsed.data.ownerId)
      .neq("status", "fallida");
  } catch {
    // El hook no debe ocultar el error original si la recuperación también falla.
  }
}
