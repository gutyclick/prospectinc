"use server";

import { redirect } from "next/navigation";

import { signOutUser } from "@/lib/auth/auth-service";
import { createClient } from "@/lib/supabase/server";

export async function logoutAction() {
  const supabase = await createClient();
  await signOutUser(supabase);
  redirect("/login");
}
