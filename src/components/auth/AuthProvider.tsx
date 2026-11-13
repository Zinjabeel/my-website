"use client";

import type { User } from "@supabase/supabase-js";
import dynamic from "next/dynamic";
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { getSupabase, supabaseConfigured } from "@/lib/supabase";

export type AuthView = "login" | "signup" | "forgot";

type AuthContextValue = {
  /** null while signed out. */
  user: User | null;
  /** false until the stored session has been checked. */
  ready: boolean;
  /** false when the Supabase env values are missing. */
  configured: boolean;
  displayName: string;
  openAuth: (view?: AuthView) => void;
  closeAuth: () => void;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

const AuthDialog = dynamic(() => import("./AuthDialog").then((m) => m.AuthDialog), { ssr: false });

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [ready, setReady] = useState(false);
  const [dialog, setDialog] = useState<AuthView | null>(null);

  useEffect(() => {
    const sb = getSupabase();
    if (!sb) {
      setReady(true);
      return;
    }
    let alive = true;
    sb.auth.getSession().then(({ data }) => {
      if (!alive) return;
      setUser(data.session?.user ?? null);
      setReady(true);
    });
    const { data: sub } = sb.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      setReady(true);
    });
    return () => {
      alive = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  // Signing in closes the dialog wherever it was opened from.
  useEffect(() => {
    if (user) setDialog(null);
  }, [user]);

  const openAuth = useCallback((view: AuthView = "login") => setDialog(view), []);
  const closeAuth = useCallback(() => setDialog(null), []);
  const signOut = useCallback(async () => {
    await getSupabase()?.auth.signOut();
    setUser(null);
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      ready,
      configured: supabaseConfigured,
      displayName: (user?.user_metadata?.name as string | undefined)?.trim() || user?.email?.split("@")[0] || "",
      openAuth,
      closeAuth,
      signOut,
    }),
    [user, ready, openAuth, closeAuth, signOut],
  );

  return (
    <AuthContext.Provider value={value}>
      {children}
      {dialog && <AuthDialog initialView={dialog} onClose={closeAuth} />}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>");
  return ctx;
}
