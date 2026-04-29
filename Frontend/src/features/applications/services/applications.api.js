import axios from "axios";

const ax = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:3000",
  withCredentials: true,
});

/**
 * GET /api/applications/my
 * All applications for the logged-in job seeker
 */
export async function getMyApplications() {
  const { data } = await ax.get("/api/applications/my");
  return data.applications;
}

/**
 * GET /api/applications/my/:applicationId
 * Single application with full AI feedback
 */
export async function getApplicationById(id) {
  const { data } = await ax.get(`/api/applications/my/${id}`);
  return data.application;
}

/**
 * POST /api/applications/apply/:jobId
 * Apply to a job using a resume analysis ID
 */
export async function applyToJob(jobId, resumeId) {
  const { data } = await ax.post(`/api/applications/apply/${jobId}`, {
    resumeId,
  });
  return data.application;
}
