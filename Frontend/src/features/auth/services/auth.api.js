// import axios from "axios";

// const api = axios.create({
//   baseURL: "http://localhost:3000",
//   withCredentials: true, // sends cookie with every request automatically
// });

// export async function register({
//   username,
//   email,
//   password,
//   role,
//   // jobseeker fields
//   skills,
//   experienceLevel,
//   // recruiter fields
//   companyName,
//   companyWebsite,
// }) {
//   try {
//     const response = await api.post("/api/auth/register", {
//       username,
//       email,
//       password,
//       role,
//       skills,
//       experienceLevel,
//       companyName,
//       companyWebsite,
//     });
//     return response.data;
//   } catch (err) {
//     // throw the actual error message from backend so UI can show it
//     throw new Error(err.response?.data?.message || "Registration failed");
//   }
// }

// export async function login({ email, password }) {
//   try {
//     const response = await api.post("/api/auth/login", {
//       email,
//       password,
//     });
//     return response.data;
//   } catch (err) {
//     throw new Error(err.response?.data?.message || "Login failed");
//   }
// }

// export async function logout() {
//   try {
//     const response = await api.get("/api/auth/logout");
//     return response.data;
//   } catch (err) {
//     throw new Error(err.response?.data?.message || "Logout failed");
//   }
// }

// export async function getMe() {
//   try {
//     const response = await api.get("/api/auth/me"); // updated to /me
//     return response.data;
//   } catch (err) {
//     // don't throw here — just return null so Protected knows user is not logged in
//     return null;
//   }
// }

// export async function updateProfile(profileData) {
//   try {
//     const response = await api.put("/api/auth/profile", profileData);
//     return response.data;
//   } catch (err) {
//     throw new Error(err.response?.data?.message || "Profile update failed");
//   }
// }

// export async function changePassword({ currentPassword, newPassword }) {
//   try {
//     const response = await api.put("/api/auth/change-password", {
//       currentPassword,
//       newPassword,
//     });
//     return response.data;
//   } catch (err) {
//     throw new Error(err.response?.data?.message || "Password change failed");
//   }
// }
import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:3000",
  withCredentials: true, // sends HTTP-only cookie with every request
});

/**
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
  const { data } = await api.post("/api/auth/register", {
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
  const { data } = await api.post("/api/auth/login", { email, password });
  return data;
}

export async function logout() {
  const { data } = await api.get("/api/auth/logout");
  return data;
}

/**
 * Called once on app start by AuthContext to rehydrate session.
 * Returns null on 401 (no cookie / expired) so Protected knows the
 * user is not logged in — does NOT throw in that case.
 */
export async function getMe() {
  try {
    const { data } = await api.get("/api/auth/me");
    return data;
  } catch {
    return null;
  }
}

export async function updateProfile(profileData) {
  const { data } = await api.put("/api/auth/profile", profileData);
  return data;
}

export async function changePassword({ currentPassword, newPassword }) {
  const { data } = await api.put("/api/auth/change-password", {
    currentPassword,
    newPassword,
  });
  return data;
}

// CORRECT:
export const forgotPassword = async ({ email }) => {
  const { data } = await api.post("/api/auth/forgot-password", { email });
  return data;
};

export const resetPassword = async ({ token, userId, newPassword }) => {
  const { data } = await api.post("/api/auth/reset-password", {
    token,
    userId,
    newPassword,
  });
  return data;
};
