import { useEffect, useState } from "react";
import { api } from "../api";
import { useAuth } from "../AuthContext";

const EMPTY_FORM = {
  title: "",
  description: "",
  poster_url: "",
  video_url: "",
  category: "",
  release_year: "",
  required_tier: "free",
};

export default function Admin() {
  const { user: currentUser } = useAuth();
  const [tab, setTab] = useState("movies");
  const [movies, setMovies] = useState([]);
  const [users, setUsers] = useState([]);
  const [form, setForm] = useState(EMPTY_FORM);
  const [editingId, setEditingId] = useState(null);
  const [message, setMessage] = useState("");
  const [bannerUrl, setBannerUrl] = useState("");
  const [bannerInput, setBannerInput] = useState("");
  const [bannerMessage, setBannerMessage] = useState("");

  function loadMovies() {
    api.movies().then(({ movies }) => setMovies(movies));
  }
  function loadUsers() {
    api.users().then(({ users }) => setUsers(users));
  }
  function loadBanner() {
    api.getBanner().then(({ bannerUrl }) => {
      setBannerUrl(bannerUrl || "");
      setBannerInput(bannerUrl || "");
    });
  }

  useEffect(() => {
    loadMovies();
    loadUsers();
    loadBanner();
  }, []);

  async function handleSubmit(e) {
    e.preventDefault();
    setMessage("");
    try {
      const payload = { ...form, release_year: form.release_year ? Number(form.release_year) : null };
      if (editingId) {
        await api.updateMovie(editingId, payload);
        setMessage("Kino yangilandi");
      } else {
        await api.createMovie(payload);
        setMessage("Kino qo'shildi");
      }
      setForm(EMPTY_FORM);
      setEditingId(null);
      loadMovies();
    } catch (err) {
      setMessage(err.message);
    }
  }

  function startEdit(m) {
    setEditingId(m.id);
    setForm({
      title: m.title,
      description: m.description || "",
      poster_url: m.poster_url || "",
      video_url: m.video_url || "",
      category: m.category || "",
      release_year: m.release_year || "",
      required_tier: m.required_tier,
    });
    setTab("movies");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function handleDelete(id) {
    if (!confirm("Ushbu kinoni o'chirishni tasdiqlaysizmi?")) return;
    await api.deleteMovie(id);
    loadMovies();
  }

  async function handleTierChange(userId, tier) {
    await api.setUserTier(userId, tier);
    loadUsers();
  }

  async function handleRoleToggle(u) {
    const newRole = u.role === "admin" ? "user" : "admin";
    const confirmMsg =
      newRole === "admin"
        ? `${u.name} (${u.email}) ni admin qilishni tasdiqlaysizmi?`
        : `${u.name} dan admin huquqini olib tashlashni tasdiqlaysizmi?`;
    if (!confirm(confirmMsg)) return;
    try {
      await api.setUserRole(u.id, newRole);
      loadUsers();
    } catch (err) {
      alert(err.message);
    }
  }

  async function handleBannerSave(e) {
    e.preventDefault();
    setBannerMessage("");
    try {
      await api.setBanner(bannerInput);
      setBannerUrl(bannerInput);
      setBannerMessage("Banner saqlandi");
    } catch (err) {
      setBannerMessage(err.message);
    }
  }

  async function handleBannerRemove() {
    if (!confirm("Bannerni o'chirishni tasdiqlaysizmi?")) return;
    await api.setBanner("");
    setBannerUrl("");
    setBannerInput("");
  }

  return (
    <main className="admin">
      <h1>Admin panel</h1>
      <div className="tabs">
        <button className={tab === "movies" ? "active" : ""} onClick={() => setTab("movies")}>
          Kinolar
        </button>
        <button className={tab === "users" ? "active" : ""} onClick={() => setTab("users")}>
          Foydalanuvchilar
        </button>
        <button className={tab === "banner" ? "active" : ""} onClick={() => setTab("banner")}>
          Banner
        </button>
      </div>

      {tab === "movies" && (
        <div className="admin-grid">
          <form className="admin-form" onSubmit={handleSubmit}>
            <h2>{editingId ? "Kinoni tahrirlash" : "Yangi kino qo'shish"}</h2>
            <label>Sarlavha</label>
            <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />

            <label>Tavsif</label>
            <textarea
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              rows={3}
            />

            <label>Poster rasm havolasi</label>
            <input value={form.poster_url} onChange={(e) => setForm({ ...form, poster_url: e.target.value })} />

            <label>Video havolasi</label>
            <input
              value={form.video_url}
              onChange={(e) => setForm({ ...form, video_url: e.target.value })}
              placeholder="https://youtube.com/watch?v=..."
              required
            />

            <div className="form-row">
              <div>
                <label>Janr</label>
                <input value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} />
              </div>
              <div>
                <label>Yil</label>
                <input
                  type="number"
                  value={form.release_year}
                  onChange={(e) => setForm({ ...form, release_year: e.target.value })}
                />
              </div>
            </div>

            <label>Tarif darajasi</label>
            <select
              value={form.required_tier}
              onChange={(e) => setForm({ ...form, required_tier: e.target.value })}
            >
              <option value="free">Ochiq</option>
              <option value="premium">Premium</option>
              <option value="vip">VIP</option>
            </select>

            {message && <p className="form-message">{message}</p>}
            <div className="form-row">
              <button className="btn-solid full" type="submit">
                {editingId ? "Saqlash" : "Qo'shish"}
              </button>
              {editingId && (
                <button
                  type="button"
                  className="btn-ghost full"
                  onClick={() => {
                    setEditingId(null);
                    setForm(EMPTY_FORM);
                  }}
                >
                  Bekor qilish
                </button>
              )}
            </div>
          </form>

          <div className="admin-list">
            {movies.map((m) => (
              <div className="admin-row" key={m.id}>
                <div>
                  <strong>{m.title}</strong>
                  <span className={`tier-chip tier-${m.required_tier}`}>{m.required_tier}</span>
                </div>
                <div className="row-actions">
                  <button className="btn-ghost" onClick={() => startEdit(m)}>
                    Tahrirlash
                  </button>
                  <button className="btn-danger" onClick={() => handleDelete(m.id)}>
                    O'chirish
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {tab === "users" && (
        <div className="admin-list">
          {users.map((u) => (
            <div className="admin-row" key={u.id}>
              <div>
                <strong>{u.name}</strong> <span className="card-meta">{u.email}</span>
                {u.role === "admin" && <span className="tier-chip tier-vip">ADMIN</span>}
              </div>
              <div className="row-actions">
                <select value={u.tier} onChange={(e) => handleTierChange(u.id, e.target.value)}>
                  <option value="free">Ochiq</option>
                  <option value="premium">Premium</option>
                  <option value="vip">VIP</option>
                </select>
                {u.id !== currentUser.id && (
                  <button
                    className={u.role === "admin" ? "btn-danger" : "btn-ghost"}
                    onClick={() => handleRoleToggle(u)}
                  >
                    {u.role === "admin" ? "Admindan olish" : "Admin qilish"}
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {tab === "banner" && (
        <form className="admin-form" onSubmit={handleBannerSave} style={{ maxWidth: 480 }}>
          <h2>Bosh sahifa banneri</h2>
          <label>Banner rasm havolasi</label>
          <input
            value={bannerInput}
            onChange={(e) => setBannerInput(e.target.value)}
            placeholder="https://..."
          />
          {bannerUrl && (
            <img
              src={bannerUrl}
              alt="Banner ko'rinishi"
              style={{ width: "100%", borderRadius: 12, marginTop: 12, border: "1px solid var(--line)" }}
            />
          )}
          {bannerMessage && <p className="form-message">{bannerMessage}</p>}
          <div className="form-row">
            <button className="btn-solid full" type="submit">
              Saqlash
            </button>
            <button type="button" className="btn-danger full" onClick={handleBannerRemove}>
              O'chirish
            </button>
          </div>
        </form>
      )}
    </main>
  );
}
