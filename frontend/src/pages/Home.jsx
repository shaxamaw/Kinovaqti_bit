import { useEffect, useMemo, useState } from "react";
import { api } from "../api";
import MovieCard from "../components/MovieCard";

export default function Home() {
  const [movies, setMovies] = useState([]);
  const [filter, setFilter] = useState("all");
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [bannerUrl, setBannerUrl] = useState(null);

  useEffect(() => {
    api
      .movies()
      .then(({ movies }) => setMovies(movies))
      .finally(() => setLoading(false));
    api.getBanner().then(({ bannerUrl }) => setBannerUrl(bannerUrl));
  }, []);

  const filtered = useMemo(() => {
    return movies.filter((m) => {
      const matchesTier = filter === "all" || m.required_tier === filter;
      const matchesQuery = m.title.toLowerCase().includes(query.toLowerCase());
      return matchesTier && matchesQuery;
    });
  }, [movies, filter, query]);

  return (
    <main>
      {bannerUrl && (
        <div className="home-banner">
          <img src={bannerUrl} alt="Banner" />
        </div>
      )}

      <section className="hero">
        <p className="eyebrow">Sizning shaxsiy kinozalingiz</p>
        <h1>O'z videolaringizni bir joyda jamlang</h1>
        <p className="hero-sub">Ochiq, Premium va VIP darajalar bilan tomoshabinlaringizni boshqaring.</p>
        <input
          className="search"
          placeholder="Kino qidirish…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </section>

      <div className="filters">
        {["all", "free", "premium", "vip"].map((t) => (
          <button
            key={t}
            className={`filter-chip ${filter === t ? "active" : ""}`}
            onClick={() => setFilter(t)}
          >
            {t === "all" ? "Barchasi" : t}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="page-loading">Yuklanmoqda…</div>
      ) : filtered.length === 0 ? (
        <div className="empty-state">Hozircha bu bo'limda kino yo'q.</div>
      ) : (
        <div className="grid">
          {filtered.map((m) => (
            <MovieCard key={m.id} movie={m} />
          ))}
        </div>
      )}
    </main>
  );
}
