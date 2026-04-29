import axios from "axios";

const API = axios.create({
  baseURL: `${import.meta.env.VITE_API_URL || "http://localhost:3000"}/api/notifications`,
  withCredentials: true,
});

export const getNotifications = async () => {
  const { data } = await API.get("/");
  return data;
};

export const markAsRead = async (id) => {
  const { data } = await API.patch(`/${id}/read`);
  return data;
};

export const markAllAsRead = async () => {
  const { data } = await API.patch("/read-all");
  return data;
};

export const deleteNotification = async (id) => {
  const { data } = await API.delete(`/${id}`);
  return data;
};
