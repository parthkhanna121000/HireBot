import { useContext } from "react";
import { AuthContext } from "../auth.context";
import {
  login,
  register,
  logout,
  updateProfile,
  changePassword,
} from "../services/auth.api";

/**
 * useAuth()
 * Exposes auth state + all auth actions.
 * All mutations go through AuthContext so every subscriber re-renders.
 */
export const useAuth = () => {
  const { user, setUser, loading, setLoading } = useContext(AuthContext);

  const handleLogin = async ({ email, password }) => {
    setLoading(true);
    try {
      const data = await login({ email, password });
      setUser(data.user);
      return data;
    } catch (err) {
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (payload) => {
    setLoading(true);
    try {
      const data = await register(payload);
      setUser(data.user);
      return data;
    } catch (err) {
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    setLoading(true);
    try {
      await logout();
    } catch {
      // swallow — clear client state regardless of server response
    } finally {
      setUser(null);
      setLoading(false);
    }
  };

  const handleUpdateProfile = async (payload) => {
    const data = await updateProfile(payload);
    setUser(data.user);
    return data;
  };

  const handleChangePassword = async (payload) => {
    return changePassword(payload);
  };

  return {
    user,
    loading,
    isAuthenticated: !!user,
    isJobseeker: user?.role === "jobseeker",
    isRecruiter: user?.role === "recruiter",
    isAdmin: user?.role === "admin", // ← NEW
    handleLogin,
    handleRegister,
    handleLogout,
    handleUpdateProfile,
    handleChangePassword,
  };
};
