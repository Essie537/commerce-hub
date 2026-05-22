import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import type { Session, SupabaseClient, User } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";
import { supabase } from "@/lib/supabase-browser";

export type AppRole = "admin" | "seller" | "buyer";

type AuthContextValue = {
  user: User | null;
  session: Session | null;
  roles: AppRole[];
  loading: boolean;
  signOut: () => Promise<void>;
  refreshRoles: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

let browserSupabasePromise: Promise<SupabaseClient<Database>> | null = null;

const getBrowserSupabase = () => {
  if (typeof window === "undefined") return null;
  browserSupabasePromise ??= Promise.resolve(supabase);
  return browserSupabasePromise;
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [roles, setRoles] = useState<AppRole[]>([]);
  const [loading, setLoading] = useState(true);

  const loadRoles = async (client: SupabaseClient<Database>, uid: string) => {
    const { data } = await client.from("user_roles").select("role").eq("user_id", uid);
    setRoles((data ?? []).map((r) => r.role as AppRole));
  };

  useEffect(() => {
    let cleanup: (() => void) | undefined;

    getBrowserSupabase()
      ?.then((supabase) => {
        const { data: sub } = supabase.auth.onAuthStateChange((_event, s) => {
          setSession(s);
          setUser(s?.user ?? null);
          if (s?.user) {
            setTimeout(() => loadRoles(supabase, s.user.id), 0);
          } else {
            setRoles([]);
          }
        });

        cleanup = () => sub.subscription.unsubscribe();

        return supabase.auth.getSession().then(({ data: { session: s } }) => {
          setSession(s);
          setUser(s?.user ?? null);
          if (s?.user) return loadRoles(supabase, s.user.id).finally(() => setLoading(false));
          setLoading(false);
        });
      })
      .catch(() => setLoading(false));

    return () => cleanup?.();
  }, []);

  const signOut = async () => {
    const supabase = await getBrowserSupabase();
    if (!supabase) return;
    await supabase.auth.signOut();
  };

  const refreshRoles = async () => {
    const supabase = await getBrowserSupabase();
    if (user && supabase) await loadRoles(supabase, user.id);
  };

  return (
    <AuthContext.Provider value={{ user, session, roles, loading, signOut, refreshRoles }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}

export const hasRole = (roles: AppRole[], r: AppRole) => roles.includes(r);
