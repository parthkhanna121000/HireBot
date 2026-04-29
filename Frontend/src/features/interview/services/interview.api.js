import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:3000/api",
  withCredentials: true,
});

export const generateReport = ({
  file,
  jobDescription,
  selfDescription,
  title,
}) => {
  const form = new FormData();
  if (file) form.append("resume", file);
  form.append("jobDescription", jobDescription);
  form.append("selfDescription", selfDescription || "");
  form.append("title", title);
  return api.post("/interview", form).then((r) => r.data);
};

export const getAllReports = () => api.get("/interview").then((r) => r.data);

export const fetchAllReports = getAllReports; // alias for InterviewHistory.jsx

export const getReportById = (id) =>
  api.get(`/interview/report/${id}`).then((r) => r.data);

export const fetchReportById = getReportById; // alias for InterviewPrep.jsx

export const deleteReport = (id) =>
  api.delete(`/interview/report/${id}`).then((r) => r.data);

export const downloadReportPdf = (reportId) =>
  api
    .post(`/interview/resume/pdf/${reportId}`, {}, { responseType: "blob" })
    .then((r) => r.data);
