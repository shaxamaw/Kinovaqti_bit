import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { api } from "../api";

export default function ForgotPassword() {
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState("");
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();

  async function handleFindQuestion(e) {
    e.preventDefault();
    setError("");
    try {
      const { question } = await api.getSecurityQuestion(email);
      setQuestion(question);
      setStep(2);
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleReset(e) {
    e.preventDefault();
    setError("");
    try {
      await api.resetPassword({ email, securityAnswer: answer, newPassword });
      setSuccess(true);
      setTimeout(() => navigate("/login"), 2000);
    } catch (err) {
      setError(err.message);
    }
  }

  if (success) {
    return (
      <main className="auth-page">
        <div className="auth-card">
          <h2>Tayyor!</h2>
          <p className="form-message">Parolingiz yangilandi. Kirish sahifasiga o'tkazilyapti...</p>
        </div>
      </main>
    );
  }

  return (
    <main className="auth-page">
      <form className="auth-card" onSubmit={step === 1 ? handleFindQuestion : handleReset}>
        <h2>Parolni tiklash</h2>
        {error && <p className="form-error">{error}</p>}

        {step === 1 ? (
          <>
            <label>Email</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
            <button className="btn-solid full" type="submit">
              Davom etish
            </button>
          </>
        ) : (
          <>
            <label>Maxfiy savol</label>
            <p className="card-meta">{question}</p>
            <label>Javob</label>
            <input value={answer} onChange={(e) => setAnswer(e.target.value)} required />
            <label>Yangi parol</label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
              minLength={6}
            />
            <button className="btn-solid full" type="submit">
              Parolni yangilash
            </button>
          </>
        )}

        <p className="auth-switch">
          <Link to="/login">Kirish sahifasiga qaytish</Link>
        </p>
      </form>
    </main>
  );
}
