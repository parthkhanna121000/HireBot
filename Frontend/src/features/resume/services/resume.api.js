import axios from "axios";

const api = axios.create({
  // AFTER (fixed)
  baseURL: `${import.meta.env.VITE_API_URL || "http://localhost:3000"}/api`,
  withCredentials: true,
});

export const analyzeResume = ({ file, jobDescription, jobRole }) => {
  const form = new FormData();
  form.append("resume", file);
  form.append("jobDescription", jobDescription);
  if (jobRole) form.append("jobRole", jobRole);
  return api.post("/resume/analyze", form).then((r) => r.data);
};

export const rewriteBullet = (payload) =>
  api.post("/resume/rewrite-bullet", payload).then((r) => r.data);

export const getAllResumes = () => api.get("/resume").then((r) => r.data);

export const getResumeById = (id) =>
  api.get(`/resume/${id}`).then((r) => r.data);

export const deleteResume = (id) =>
  api.delete(`/resume/${id}`).then((r) => r.data);

export const downloadResumePdf = (resumeId) =>
  api
    .post(`/resume/generate-pdf/${resumeId}`, {}, { responseType: "blob" })
    .then((r) => r.data);
