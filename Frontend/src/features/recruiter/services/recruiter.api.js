import axios from "axios";

const API = import.meta.env.VITE_API_URL || "http://localhost:3000";

const http = axios.create({
  baseURL: API,
  withCredentials: true,
});

// ── Jobs ──────────────────────────────────────────────────────────

/** GET /api/jobs/recruiter/my-jobs  →  Job[] */
export const getMyJobs = async () => {
  const { data } = await http.get("/api/jobs/recruiter/my-jobs");
  return Array.isArray(data) ? data : (data.jobs ?? []);
};

/** POST /api/jobs  →  Job */
export const createJob = async (payload) => {
  const { data } = await http.post("/api/jobs", payload);
  return data;
};

/** PUT /api/jobs/:id  →  Job */
export const updateJob = async (id, payload) => {
  const { data } = await http.put(`/api/jobs/${id}`, payload);
  return data;
};

/** DELETE /api/jobs/:id  →  void */
export const deleteJob = async (id) => {
  await http.delete(`/api/jobs/${id}`);
};

/** POST /api/jobs/enhance  →  { enhancedDescription, suggestedSkills, suggestedTitle } */
export const enhanceJobDescription = async (payload) => {
  const { data } = await http.post("/api/jobs/enhance", payload);
  return data;
};

// ── Applications ─────────────────────────────────────────────────

/**
 * GET /api/applications/job/:jobId
 * Returns applicants ranked by matchScore desc.
 * Shape: Application[] with populated applicant + resume refs.
 */
export const getApplicantsByJob = async (jobId) => {
  const { data } = await http.get(`/api/applications/job/${jobId}`);
  return Array.isArray(data) ? data : (data.applications ?? []);
};

/**
 * PUT /api/applications/:id/status
 * status: "applied" | "shortlisted" | "rejected" | "hired"
 * Optional body: { recruiterNote }
 */
export const updateApplicationStatus = async (
  applicationId,
  status,
  recruiterNote,
) => {
  const body = { status };
  if (recruiterNote !== undefined) body.recruiterNote = recruiterNote;
  const { data } = await http.put(
    `/api/applications/${applicationId}/status`,
    body,
  );
  return data;
};

// ── Stats ─────────────────────────────────────────────────────────

/** GET /api/applications/recruiter/stats  →  stats object */
export const getRecruiterStats = async () => {
  const { data } = await http.get("/api/applications/recruiter/stats");
  return data;
};
