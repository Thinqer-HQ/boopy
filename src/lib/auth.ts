import { supabaseService } from "@/lib/supabase/server";

export async function getUserOrThrow(accessToken: string) {
  const supabase = supabaseService();
  const { data, error } = await supabase.auth.getUser(accessToken);
  if (error || !data.user) throw new Error("Unauthorized");
  return data.user;
}
