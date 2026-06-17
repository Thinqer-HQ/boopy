import type { AuthProvider } from "@refinedev/core";

import { getSupabaseBrowserClient } from "@/lib/supabase/client";

export const authProvider: AuthProvider = {
  login: async () => {
    return { success: false, redirectTo: "/login" };
  },
  logout: async () => {
    const supabase = getSupabaseBrowserClient();
    await supabase.auth.signOut();
    return { success: true, redirectTo: "/login" };
  },
  check: async () => {
    const supabase = getSupabaseBrowserClient();
    const { data } = await supabase.auth.getUser();
    if (!data.user) {
      return { authenticated: false, redirectTo: "/login" };
    }
    return { authenticated: true };
  },
  onError: async (error) => {
    return { error };
  },
  getIdentity: async () => {
    const supabase = getSupabaseBrowserClient();
    const { data } = await supabase.auth.getUser();
    if (!data.user) return null;
    return { id: data.user.id, email: data.user.email };
  },
};
