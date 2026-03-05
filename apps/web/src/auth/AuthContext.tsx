import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { api, setAuthToken } from "../api/client";

export type AuthUser = {
  id: string;
  name: string;
  email: string;
  onboarded: boolean;
  goals: string;
  constraints: string;
  focusDomains: string[];
  onboardingProfile: {
    outcomePriorities: string[];
    bottlenecks: string[];
    contextFlags: string[];
    startingPoint: string;
    notes: string;
  } | null;
};

type AuthContextValue = {
  user: AuthUser | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (name: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  completeOnboarding: (payload: {
    outcomePriorities: string[];
    bottlenecks: string[];
    contextFlags: string[];
    startingPoint: "minimal_dashboard" | "upload_documents" | "connect_device";
    notes?: string;
    goals?: string;
    constraints?: string;
  }) => Promise<void>;
};

const TOKEN_KEY = "bioassist_token";

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

function setSession(token: string | null) {
  if (token) localStorage.setItem(TOKEN_KEY, token);
  else localStorage.removeItem(TOKEN_KEY);
  setAuthToken(token);
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem(TOKEN_KEY);
    if (!token) {
      setLoading(false);
      return;
    }

    setAuthToken(token);
    api
      .get("/api/auth/me")
      .then((res) => {
        setUser(res.data.user);
      })
      .catch(() => {
        setSession(null);
        setUser(null);
      })
      .finally(() => setLoading(false));
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      loading,
      async login(email: string, password: string) {
        const res = await api.post("/api/auth/login", { email, password });
        setSession(res.data.token);
        setUser(res.data.user);
      },
      async signup(name: string, email: string, password: string) {
        const res = await api.post("/api/auth/signup", { name, email, password });
        setSession(res.data.token);
        setUser(res.data.user);
      },
      async logout() {
        try {
          await api.post("/api/auth/logout");
        } finally {
          setSession(null);
          setUser(null);
        }
      },
      async completeOnboarding(payload) {
        const res = await api.post("/api/profile/onboarding", payload);
        setUser(res.data.user);
      }
    }),
    [user, loading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}

export function AuthTestProvider({
  value,
  children
}: {
  value: AuthContextValue;
  children: ReactNode;
}) {
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
