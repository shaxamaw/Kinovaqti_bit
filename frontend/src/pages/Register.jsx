import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { api } from "../api";
import { useAuth } from "../AuthContext";

export default function Register() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const { login } = useAuth();
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    try {
      const { user, token } = await api.register({ name, email, password });
      login(user, token);
      navigate("/");
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <main className="auth-page">
      <form className="auth-card" onSubmit={handleSubmit}>
        <h2>Ro'yxatdan o'tish</h2>
        {error && <p className="form-error">{error}</p>}
        <label>Ism</label>
        <input value={name} onChange={(e) => setName(e.target.value)} required />
        <label>Email</label>
        <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        <label>Parol</label>
        <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={6} />
        <button className="btn-solid full" type="submit">
          Ro'yxatdan o'tish
        </button>
        <p className="auth-switch">
          Akkauntingiz bormi? <Link to="/login">Kirish</Link>
        </p>
      </form>
    </main>
  );
}
