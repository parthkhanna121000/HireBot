import axios from "axios";

const ax = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:3000",
  withCredentials: true,
});

// ─── Public ───────────────────────────────────────────────────────────────────

/**
 * GET /api/jobs
 * Fetch all active jobs with optional filters + pagination
 */
export async function getAllJobs({
  search,
  experienceLevel,
  jobType,
  salaryMin,
  salaryMax,
  page = 1,
  limit = 9,
} = {}) {
  const params = new URLSearchParams({ page, limit });
  if (search) params.set("search", search);
  if (experienceLevel) params.set("experienceLevel", experienceLevel);
  if (jobType) params.set("jobType", jobType);
  if (salaryMin) params.set("salaryMin", salaryMin);
  if (salaryMax) params.set("salaryMax", salaryMax);

  const { data } = await ax.get(`/api/jobs?${params}`);
  return data; // { jobs, pagination: { total, page, limit, totalPages } }
}

/**
 * GET /api/jobs/:jobId
 * Fetch a single job by ID
 */
export async function getJobById(jobId) {
  const { data } = await ax.get(`/api/jobs/${jobId}`);
  return data.job ?? data;
}

// ─── Private (jobseeker) ──────────────────────────────────────────────────────

/**
 * GET /api/jobs/recommended
 * AI-matched jobs for the logged-in jobseeker based on their skills
 */
export async function getRecommendedJobs() {
  const { data } = await ax.get("/api/jobs/recommended");
  return data.jobs ?? data;
}

/**
 * POST /api/applications/apply/:jobId
 * Apply to a job with a resume PDF.
 * The backend: parses PDF → calls Gemini rankCandidate() → saves Application.
 *
 * @param {string}   jobId  - MongoDB ObjectId of the job
 * @param {File}     pdfFile - PDF resume file (from <input type="file">)
 * @returns {Object} application record with matchScore, strengths, etc.
 */
export async function applyToJob(jobId, pdfFile) {
  const formData = new FormData();
  formData.append("resume", pdfFile); // field name must match Multer config: upload.single("resume")

  const { data } = await ax.post(`/api/applications/apply/${jobId}`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return data; // { message, application: { matchScore, status, ... } }
}

/**
 * GET /api/applications/my
 * All applications for the logged-in jobseeker
 */
export async function getMyApplications() {
  const { data } = await ax.get("/api/applications/my");
  return Array.isArray(data) ? data : (data.applications ?? []);
}
