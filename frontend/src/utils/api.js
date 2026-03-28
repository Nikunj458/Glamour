import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  headers: { 'Content-Type': 'application/json' },
});

// ── Attach token to every request ─────────────────────────────────────────────
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// ── Handle 401 — only redirect on protected routes, not public ones ───────────
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      const url = err.config?.url || '';
      // Only force logout if the request was to a protected endpoint
      // Public endpoints: /products, /categories, /reviews (GET)
      const isPublic = /^\/(products|categories|reviews)(\?.*)?$/.test(url) && err.config?.method === 'get';
      if (!isPublic) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        // Don't redirect if already on login page
        if (!window.location.pathname.includes('/login')) {
          window.location.href = '/login';
        }
      }
    }
    return Promise.reject(err);
  }
);

export default api;
