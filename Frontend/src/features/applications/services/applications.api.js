import axios from "axios";

const ax = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:3000/api",
  withCredentials: true,
});

/**
 * GET /api/applications/my
 * All applications for the logged-in job seeker
 */
export async function getMyApplications() {
  const { data } = await ax.get("/applications/my");
  return data.applications;
}

/**
 * GET /api/applications/my/:applicationId
 * Single application with full AI feedback
 */
export async function getApplicationById(id) {
  const { data } = await ax.get(`/applications/my/${id}`);
  return data.application;
}

/**
 * POST /api/applications/apply/:jobId
 * Apply to a job using a resume analysis ID
 */
export async function applyToJob(jobId, resumeId) {
  const { data } = await ax.post(`/applications/apply/${jobId}`, {
    resumeId,
  });
  return data.application;
}
