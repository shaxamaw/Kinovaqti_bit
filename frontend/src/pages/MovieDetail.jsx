import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { api } from "../api";
import { useAuth } from "../AuthContext";

const TIER_LABEL = { free: "Ochiq", premium: "Premium", vip: "VIP" };

export default function MovieDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const [movie, setMovie] = useState(null);
  const [hasAccess, setHasAccess] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!user) return;
    api
      .movie(id)
      .then(({ movie, hasAccess }) => {
        setMovie(movie);
        setHasAccess(hasAccess);
      })
      .catch((e) => setError(e.message));
  }, [id, user]);

  if (!user) {
    return (
      <main className="empty-state">
        Kinoni ko'rish uchun <Link to="/login">kiring</Link>.
      </main>
    );
  }

  if (error) return <main className="empty-state">{error}</main>;
  if (!movie) return <main className="page-loading">Yuklanmoqda…</main>;

  return (
    <main className="detail">
      <Link to="/" className="back-link">
        ← Orqaga
      </Link>
      <h1>{movie.title}</h1>
      <p className="card-meta">
        {movie.category || "Janr belgilanmagan"} {movie.release_year ? `· ${movie.release_year}` : ""} ·{" "}
        <span className={`tier-chip tier-${movie.required_tier}`}>{TIER_LABEL[movie.required_tier]}</span>
      </p>
      <p className="detail-desc">{movie.description}</p>

      {hasAccess ? (
        <div className="video-wrap">
          <iframe
            src={movie.video_url}
            title={movie.title}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>
      ) : (
        <div className="locked">
          <p>
            Bu kino <strong>{TIER_LABEL[movie.required_tier]}</strong> tarifida. Sizning joriy tarifingiz:{" "}
            <strong>{TIER_LABEL[user.tier]}</strong>.
          </p>
          <p className="locked-hint">Tarifni oshirish uchun admin bilan bog'laning.</p>
        </div>
      )}
    </main>
  );
}
