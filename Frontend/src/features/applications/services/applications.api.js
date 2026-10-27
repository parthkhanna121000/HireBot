import axios from "axios";

const ax = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:3000/api",
  withCredentials: true,
});

export async function getMyApplications() {
  const { data } = await ax.get("/applications/my");
  return data.applications;
}

export async function getApplicationById(id) {
  const { data } = await ax.get(`/applications/my/${id}`);
  return data.application;
}

export async function applyToJob(jobId, resumeId) {
  const { data } = await ax.post(`/applications/apply/${jobId}`, {
    resumeId,
  });
  return data.application;
}