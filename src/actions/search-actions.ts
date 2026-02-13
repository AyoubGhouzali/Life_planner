"use server";
import { createClient } from "@/lib/supabase/server";
import { searchAll } from "@/lib/db/queries/search";

export async function search(query: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { tasks: [], projects: [], notes: [] };
  
  return await searchAll(user.id, query);
}
