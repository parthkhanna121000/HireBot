import { createContext, useState, useEffect } from "react";
import { getMe } from "./services/auth.api";

export const AuthContext = createContext(null);

/**
 * AuthProvider
 * - Wraps the entire app in main.jsx
 * - On mount: calls GET /api/auth/me to rehydrate session from HTTP-only cookie
 * - loading stays true until the /me check completes so Protected never
 *   flashes a redirect before it knows whether the user is logged in
 */
export const AuthProvider = ({ children }) => {
  const [user, setUser]       = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    const checkAuth = async () => {
      try {
        const data = await getMe();
        if (!cancelled) setUser(data?.user ?? null);
      } catch {
        if (!cancelled) setUser(null);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    checkAuth();
    return () => { cancelled = true; };
  }, []);

  return (
    <AuthContext.Provider value={{ user, setUser, loading, setLoading }}>
      {children}
    </AuthContext.Provider>
  );
};