// client/src/auth/AuthContext.tsx
//
// Single source of truth for "who is the current user?" across the app.
//
// Architecture:
//   - <AuthProvider> wraps the app in main.tsx (or App.tsx). It holds the
//     `user: PublicUser | null` state and exposes signup/login/logout methods.
//   - On mount, the provider calls /api/me to restore the session from the
//     httpOnly cookie. While that's pending, `loading` is true.
//   - Components consume via the `useAuth()` hook. Re-renders happen
//     automatically when state changes (Context API).
//
// The auth token never lives in JS — it's in an httpOnly cookie that the
// browser handles. This file therefore only manages the *user object*.

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { PublicUser } from "../../../shared/types";
import {
  getMe,
  login as apiLogin,
  logout as apiLogout,
  signup as apiSignup,
  type LoginInput,
  type SignupInput,
} from "@/lib/auth";

interface AuthContextValue {
  /** Current user, or null if logged out. */
  user: PublicUser | null;
  /** True while the initial /api/me check is in flight on app load. */
  loading: boolean;
  signup: (input: SignupInput) => Promise<void>;
  login: (input: LoginInput) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<PublicUser | null>(null);
  const [loading, setLoading] = useState(true);

  // On mount, ask the server who we are. If the cookie is valid, the server
  // returns the user; otherwise null. Either way, drop the loading flag.
  useEffect(() => {
    let cancelled = false;
    getMe()
      .then((me) => {
        if (!cancelled) setUser(me);
      })
      .catch((e) => {
        // Network/server error during /api/me — treat as logged-out.
        // Real auth failures already return 401, which getMe() maps to null.
        console.error("getMe failed:", e);
        if (!cancelled) setUser(null);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  // useCallback so consumers calling these in their own useEffect deps
  // don't trigger spurious re-runs.
  const signup = useCallback(async (input: SignupInput) => {
    const u = await apiSignup(input);
    setUser(u);
  }, []);

  const login = useCallback(async (input: LoginInput) => {
    const u = await apiLogin(input);
    setUser(u);
  }, []);

  const logout = useCallback(async () => {
    await apiLogout();
    setUser(null);
  }, []);

  // Memoize the context value so consumers don't re-render unless the
  // actual contents change.
  const value = useMemo(
    () => ({ user, loading, signup, login, logout }),
    [user, loading, signup, login, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

/**
 * Read the current auth state from anywhere in the tree. Throws if used
 * outside <AuthProvider> — which is always a bug, never a runtime case.
 */
export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used inside <AuthProvider>");
  }
  return ctx;
}
