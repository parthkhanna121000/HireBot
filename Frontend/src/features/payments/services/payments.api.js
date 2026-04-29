// import axios from "axios";

// const API = axios.create({
//   baseURL: `${import.meta.env.VITE_API_URL}/api/payments`,
//   withCredentials: true,
// });

// export const createOrder = async (planKey) => {
//   const { data } = await API.post("/create-order", { planKey });
//   return data;
// };

// export const verifyPayment = async (payload) => {
//   const { data } = await API.post("/verify", payload);
//   return data;
// };

// export const getSubscriptionStatus = async () => {
//   const { data } = await API.get("/status");
//   return data;
// };

import axios from "axios";

// ─── Base URL ─────────────────────────────────────────────────────────────────
// Reads VITE_API_URL from .env — falls back to localhost for local dev
const BASE = import.meta.env.VITE_API_URL || "http://localhost:3000";

const API = axios.create({
  baseURL: `${BASE}/api/payments`,
  withCredentials: true,
});

export const createOrder = async (planKey) => {
  const { data } = await API.post("/create-order", { planKey });
  return data;
};

export const verifyPayment = async (payload) => {
  const { data } = await API.post("/verify", payload);
  return data;
};

export const getSubscriptionStatus = async () => {
  const { data } = await API.get("/status");
  return data;
};
