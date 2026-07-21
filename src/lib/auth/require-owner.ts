import "server-only";

import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";

import { isOwnerEmail } from "./authorization";

export async function requireOwner() {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.getUser();

  if (
    error ||
    !data.user ||
    !isOwnerEmail(data.user.email, process.env.APP_OWNER_EMAIL)
  ) {
    await supabase.auth.signOut();
    redirect("/login");
  }

  return data.user;
}
