
import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:3000/api",
  withCredentials: true, // sends HTTP-only cookie with every request
});

/**4
 * Axios response interceptor
 * Converts every non-2xx response into a thrown Error with the backend's
 * message string, so every caller gets: catch (err) => err.message
 */
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const message =
      error.response?.data?.message || error.message || "Something went wrong";
    return Promise.reject(new Error(message));
  },
);

// ─────────────────────────────────────────────────────────────────

export async function register({
  username,
  email,
  password,
  role,
  skills,
  experienceLevel,
  companyName,
  companyWebsite,
}) {
  const { data } = await api.post("/auth/register", {
    username,
    email,
    password,
    role,
    skills,
    experienceLevel,
    companyName,
    companyWebsite,
  });
  return data;
}

export async function login({ email, password }) {
  const { data } = await api.post("/auth/login", { email, password });
  return data;
}

export async function logout() {
  const { data } = await api.get("/auth/logout");
  return data;
}

/**
 * Called once on app start by AuthContext to rehydrate session.
 * Returns null on 401 (no cookie / expired) so Protected knows the
 * user is not logged in — does NOT throw in that case.
 */
export async function getMe() {
  try {
    const { data } = await api.get("/auth/me");
    return data;
  } catch {
    return null;
  }
}

export async function updateProfile(profileData) {
  const { data } = await api.put("/auth/profile", profileData);
  return data;
}

export async function changePassword({ currentPassword, newPassword }) {
  const { data } = await api.put("/auth/change-password", {
    currentPassword,
    newPassword,
  });
  return data;
}

// CORRECT:
export const forgotPassword = async ({ email }) => {
  const { data } = await api.post("/auth/forgot-password", { email });
  return data;
};

export const resetPassword = async ({ token, userId, newPassword }) => {
  const { data } = await api.post("/auth/reset-password", {
    token,
    userId,
    newPassword,
  });
  return data;
};
