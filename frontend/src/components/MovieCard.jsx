import { Link } from "react-router-dom";

const TIER_LABEL = { free: "Ochiq", premium: "Premium", vip: "VIP" };

export default function MovieCard({ movie }) {
  return (
    <Link to={`/movie/${movie.id}`} className="card">
      <div
        className="card-poster"
        style={{ backgroundImage: movie.poster_url ? `url(${movie.poster_url})` : undefined }}
      >
        {!movie.poster_url && <div className="poster-fallback">{movie.title[0]}</div>}
        <span className={`stub stub-${movie.required_tier}`}>{TIER_LABEL[movie.required_tier]}</span>
      </div>
      <div className="card-body">
        <h3>{movie.title}</h3>
        <p className="card-meta">
          {movie.category || "Janr belgilanmagan"} {movie.release_year ? `· ${movie.release_year}` : ""}
        </p>
      </div>
    </Link>
  );
}
