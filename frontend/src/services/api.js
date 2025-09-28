// src/services/api.js
import axios from "axios";

// ✅ Base URL: use VITE_API_BASE if set, else default to /api (for Vite dev proxy)
const API_BASE = import.meta.env.VITE_API_BASE || "/api";

const api = axios.create({
  baseURL: API_BASE,
  timeout: 15000,
});

// ✅ Attach JWT if present
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("access_token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// ---- Health
export const healthApi = {
  ping: () => api.get("/ping").then((r) => r.data),
};

// ---- FAQs
export const faqApi = {
  list: ({ page = 1, per_page = 10 } = {}) =>
    api.get("/faqs", { params: { page, per_page } }).then((r) => r.data),
};

// ---- Auth
export const authApi = {
  register: (name, email, password, role = "user") =>
    api.post("/auth/register", { name, email, password, role }).then((r) => r.data),

  login: (email, password) =>
    api.post("/auth/login", { email, password }).then((r) => r.data),

  me: () => api.get("/auth/me").then((r) => r.data),

  requestPasswordReset: (email) =>
    api.post("/auth/request-reset", { email }).then((r) => r.data),

  resetPassword: (token, password) =>
    api.post("/auth/reset-password", { token, password }).then((r) => r.data),
};

// ---- Problems (Questions)
export const problemsApi = {
  list: ({ page = 1, per_page = 10, problem_type, search, sort } = {}) =>
    api
      .get("/problems", { params: { page, per_page, problem_type, search, sort } })
      .then((r) => r.data),

  get: (id) => api.get(`/problems/${id}`).then((r) => r.data),

  create: ({ title, description, problem_type, tag_ids = [] }) =>
    api
      .post("/problems", { title, description, problem_type, tag_ids })
      .then((r) => r.data),
};

// ---- Solutions (Answers)
export const solutionsApi = {
  list: (problemId, { page = 1, per_page = 10 } = {}) =>
    api
      .get(`/problems/${problemId}/solutions`, { params: { page, per_page } })
      .then((r) => r.data),

  create: (problemId, { content }) =>
    api.post(`/problems/${problemId}/solutions`, { content }).then((r) => r.data),
};

// ---- Votes (on solutions)
export const votesApi = {
  voteSolution: (solutionId, vote_type) =>
    api.post(`/solutions/${solutionId}/vote`, { vote_type }).then((r) => r.data),
  removeVote: (solutionId) =>
    api.delete(`/solutions/${solutionId}/vote`).then((r) => r.data),
  getVotes: (solutionId) =>
    api.get(`/solutions/${solutionId}/votes`).then((r) => r.data),
};

// ---- Notifications
export const notificationsApi = {
  list: ({ page = 1, per_page = 10, unread_only = false } = {}) =>
    api
      .get("/notifications", { params: { page, per_page, unread_only } })
      .then((r) => r.data),

  unreadCount: () => api.get("/notifications/unread-count").then((r) => r.data),

  markRead: (id) => api.put(`/notifications/${id}/read`).then((r) => r.data),

  markAllRead: () => api.put(`/notifications/read-all`).then((r) => r.data),
};

// ---- Tags
export const tagsApi = {
  list: ({ q = "", page = 1, per_page = 20 } = {}) =>
    api.get("/tags", { params: { q, page, per_page } }).then((r) => r.data),
  create: (name) => api.post("/tags", { name }).then((r) => r.data),
};

// ---- Profiles
export const profileApi = {
  get: (userId) => api.get(`/profile/${userId}`).then((r) => r.data),
};

export default api;
