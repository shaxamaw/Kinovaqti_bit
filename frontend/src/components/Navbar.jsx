import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../AuthContext";

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <header className="nav">
      <Link to="/" className="brand">
        Kino<span>Flux</span>
      </Link>
      <nav className="nav-links">
        <Link to="/">Kinolar</Link>
        {user?.role === "admin" && <Link to="/admin">Admin</Link>}
        {user ? (
          <>
            <span className={`tier-chip tier-${user.tier}`}>{user.tier}</span>
            <button
              className="btn-ghost"
              onClick={() => {
                logout();
                navigate("/");
              }}
            >
              Chiqish
            </button>
          </>
        ) : (
          <>
            <Link to="/login" className="btn-ghost">
              Kirish
            </Link>
            <Link to="/register" className="btn-solid">
              Ro'yxatdan o'tish
            </Link>
          </>
        )}
      </nav>
    </header>
  );
}
