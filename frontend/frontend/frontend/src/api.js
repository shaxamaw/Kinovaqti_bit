const BASE = "/api";

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

  movies: () => request("/movies"),
  movie: (id) => request(`/movies/${id}`),
  createMovie: (body) => request("/movies", { method: "POST", body: JSON.stringify(body) }),
  updateMovie: (id, body) => request(`/movies/${id}`, { method: "PUT", body: JSON.stringify(body) }),
  deleteMovie: (id) => request(`/movies/${id}`, { method: "DELETE" }),

  users: () => request("/users"),
  setUserTier: (id, tier) => request(`/users/${id}/tier`, { method: "PUT", body: JSON.stringify({ tier }) }),
};
