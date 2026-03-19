import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:3000",
  withCredentials: true, // sends cookie with every request automatically
});

export async function register({
  username,
  email,
  password,
  role,
  // jobseeker fields
  skills,
  experienceLevel,
  // recruiter fields
  companyName,
  companyWebsite,
}) {
  try {
    const response = await api.post("/api/auth/register", {
      username,
      email,
      password,
      role,
      skills,
      experienceLevel,
      companyName,
      companyWebsite,
    });
    return response.data;
  } catch (err) {
    // throw the actual error message from backend so UI can show it
    throw new Error(err.response?.data?.message || "Registration failed");
  }
}

export async function login({ email, password }) {
  try {
    const response = await api.post("/api/auth/login", {
      email,
      password,
    });
    return response.data;
  } catch (err) {
    throw new Error(err.response?.data?.message || "Login failed");
  }
}

export async function logout() {
  try {
    const response = await api.get("/api/auth/logout");
    return response.data;
  } catch (err) {
    throw new Error(err.response?.data?.message || "Logout failed");
  }
}

export async function getMe() {
  try {
    const response = await api.get("/api/auth/me"); // updated to /me
    return response.data;
  } catch (err) {
    // don't throw here — just return null so Protected knows user is not logged in
    return null;
  }
}

export async function updateProfile(profileData) {
  try {
    const response = await api.put("/api/auth/profile", profileData);
    return response.data;
  } catch (err) {
    throw new Error(err.response?.data?.message || "Profile update failed");
  }
}

export async function changePassword({ currentPassword, newPassword }) {
  try {
    const response = await api.put("/api/auth/change-password", {
      currentPassword,
      newPassword,
    });
    return response.data;
  } catch (err) {
    throw new Error(err.response?.data?.message || "Password change failed");
  }
}
