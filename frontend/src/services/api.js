import axios from "axios";

// ✅ Use local API by default, fallback to deployed if provided
const API_BASE = import.meta.env.VITE_API_BASE || "http://127.0.0.1:5000";

const api = axios.create({
  baseURL: API_BASE,
  timeout: 15000,
});

// ✅ Attach token automatically if it exists
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("access_token");
  if (token && token !== "undefined" && token !== "null") {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ✅ Handle expired/invalid tokens
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if ([401, 422].includes(error?.response?.status)) {
      localStorage.removeItem("access_token");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

// ✅ Helper to store token cleanly
function storeToken(token) {
  if (token) {
    localStorage.setItem("access_token", token);
  }
}

// ---------------------- API ENDPOINTS ----------------------

// ✅ Health check
export const healthApi = {
  ping: () => api.get("/ping").then((r) => r.data),
};

export const faqApi = {
  list: ({ page = 1, per_page = 10 } = {}) =>
    api.get("/faqs", { params: { page, per_page } }).then((r) => r.data),
};

export const authApi = {
  register: (name, email, password, role = "student") =>
    api.post("/auth/register", { name, email, password, role }).then((r) => {
      if (r.data.access_token) storeToken(r.data.access_token);
      return r.data;
    }),

  login: (email, password) =>
    api.post("/auth/login", { email, password }).then((r) => {
      if (r.data.access_token) storeToken(r.data.access_token);
      return r.data;
    }),

  me: () =>
    api.get("/auth/me").then((r) => {
      return r.data.user ?? r.data;
    }),

  requestPasswordReset: (email) =>
    api.post("/auth/request-reset", { email }).then((r) => r.data),

  resetPassword: (token, password) =>
    api.post("/auth/reset-password", { token, password }).then((r) => r.data),
};

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

export const solutionsApi = {
  list: (problemId, { page = 1, per_page = 10 } = {}) =>
    api
      .get(`/problems/${problemId}/solutions`, { params: { page, per_page } })
      .then((r) => r.data),

  create: (problemId, { content }) =>
    api.post(`/problems/${problemId}/solutions`, { content }).then((r) => r.data),
};

export const votesApi = {
  voteSolution: (solutionId, vote_type) =>
    api.post(`/solutions/${solutionId}/vote`, { vote_type }).then((r) => r.data),

  removeVote: (solutionId) =>
    api.delete(`/solutions/${solutionId}/vote`).then((r) => r.data),

  getVotes: (solutionId) =>
    api.get(`/solutions/${solutionId}/votes`).then((r) => r.data),
};

export const notificationsApi = {
  list: ({ page = 1, per_page = 10, unread_only = false } = {}) =>
    api
      .get("/notifications", { params: { page, per_page, unread_only } })
      .then((r) => r.data),

  unreadCount: () => api.get("/notifications/unread-count").then((r) => r.data),

  markRead: (id) => api.put(`/notifications/${id}/read`).then((r) => r.data),

  markAllRead: () => api.put(`/notifications/read-all`).then((r) => r.data),
};

export const tagsApi = {
  list: ({ q = "", page = 1, per_page = 20 } = {}) =>
    api.get("/tags", { params: { q, page, per_page } }).then((r) => r.data),

  create: (name) => api.post("/tags", { name }).then((r) => r.data),
};

export const profileApi = {
  get: (userId) => api.get(`/profile/${userId}`).then((r) => r.data),
};

// ✅ default axios instance
export default api;
