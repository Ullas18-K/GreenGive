import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import type { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabaseClient";

type Role = "admin" | "user";

type SubscriptionRecord = {
  status: string | null;
  plan: string | null;
  renewal_date: string | null;
  amount: number | string | null;
  charity_id: string | null;
  charity_name: string | null;
  charity_percent: number | null;
  charity_changed_at: string | null;
};

type AuthContextValue = {
  session: Session | null;
  user: User | null;
  role: Role | null;
  subscription: SubscriptionRecord | null;
  loading: boolean;
  subscriptionActive: boolean;
  refreshProfile: () => Promise<void>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [role, setRole] = useState<Role | null>(null);
  const [subscription, setSubscription] = useState<SubscriptionRecord | null>(null);
  const [sessionLoading, setSessionLoading] = useState(true);
  const [profileLoading, setProfileLoading] = useState(false);

  useEffect(() => {
    let mounted = true;

    supabase.auth.getSession().then(({ data }) => {
      if (!mounted) return;
      setSession(data.session ?? null);
      setSessionLoading(false);
    });

    const { data } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession);
    });

    return () => {
      mounted = false;
      data.subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (!session?.user) {
      setRole(null);
      setSubscription(null);
      return;
    }
  }, [session?.user]);

  const refreshProfile = useCallback(async () => {
    if (!session?.user) {
      setRole(null);
      setSubscription(null);
      return;
    }

    setProfileLoading(true);

    const [roleResult, subscriptionResult] = await Promise.all([
      supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", session.user.id)
        .maybeSingle(),
      supabase
        .from("subscriptions")
        .select("status, plan, renewal_date, amount, charity_id, charity_name, charity_percent, charity_changed_at")
        .eq("user_id", session.user.id)
        .maybeSingle(),
    ]);

    setRole((roleResult.data?.role as Role | undefined) ?? "user");
    setSubscription(subscriptionResult.data ?? null);
    setProfileLoading(false);
  }, [session?.user]);

  useEffect(() => {
    let cancelled = false;
    const loadProfile = async () => {
      await refreshProfile();
    };

    if (!cancelled) {
      loadProfile();
    }

    return () => {
      cancelled = true;
    };
  }, [refreshProfile]);

  const subscriptionActive = useMemo(() => subscription?.status === "active", [subscription?.status]);

  const value = useMemo<AuthContextValue>(
    () => ({
      session,
      user: session?.user ?? null,
      role,
      subscription,
      loading: sessionLoading || profileLoading,
      subscriptionActive,
      refreshProfile,
      signOut: async () => {
        await supabase.auth.signOut();
      },
    }),
    [session, role, subscription, sessionLoading, profileLoading, subscriptionActive, refreshProfile]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
