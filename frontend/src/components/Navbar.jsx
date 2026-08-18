import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../AuthContext";

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="nav">
      <div className="nav-left">
        <button className="nav-menu-btn" onClick={() => setMenuOpen((v) => !v)} aria-label="Menyu">
          ⋮
        </button>
        {menuOpen && (
          <div className="nav-dropdown">
            <Link to="/pricing" onClick={() => setMenuOpen(false)}>
              Premium sotib olish
            </Link>
            <Link to="/pricing" onClick={() => setMenuOpen(false)}>
              VIP sotib olish
            </Link>
          </div>
        )}
        <Link to="/" className="brand">
          Kino<span>Flux</span>
        </Link>
      </div>
      <nav className="nav-links">
        <Link to="/">Kinolar</Link>
        <Link to="/pricing">Tariflar</Link>
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
