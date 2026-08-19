const BASE = (import.meta.env.VITE_API_URL || "") + "/api";

function authHeaders() {
  const token = localStorage.getItem("token");
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function request(path, options = {}) {
  const res = await fetch(`${BASE}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...authHeaders(),
      ...(options.headers || {}),
    },
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || "Xatolik yuz berdi");
  return data;
}

export const api = {
  register: (body) => request("/auth/register", { method: "POST", body: JSON.stringify(body) }),
  login: (body) => request("/auth/login", { method: "POST", body: JSON.stringify(body) }),
  me: () => request("/auth/me"),
  getSecurityQuestion: (email) => request("/auth/security-question", { method: "POST", body: JSON.stringify({ email }) }),
  resetPassword: (body) => request("/auth/reset-password", { method: "POST", body: JSON.stringify(body) }),

  movies: () => request("/movies"),
  movie: (id) => request(`/movies/${id}`),
  createMovie: (body) => request("/movies", { method: "POST", body: JSON.stringify(body) }),
  updateMovie: (id, body) => request(`/movies/${id}`, { method: "PUT", body: JSON.stringify(body) }),
  deleteMovie: (id) => request(`/movies/${id}`, { method: "DELETE" }),

  users: () => request("/users"),
  setUserTier: (id, tier) => request(`/users/${id}/tier`, { method: "PUT", body: JSON.stringify({ tier }) }),
  setUserRole: (id, role) => request(`/users/${id}/role`, { method: "PUT", body: JSON.stringify({ role }) }),

  getBanner: () => request("/settings/banner"),
  setBanner: (bannerUrl) => request("/settings/banner", { method: "PUT", body: JSON.stringify({ bannerUrl }) }),
};
