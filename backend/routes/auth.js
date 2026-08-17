import { Router } from "express";
import bcrypt from "bcryptjs";
import pool from "../db/init.js";
import { signToken, requireAuth } from "../middleware/auth.js";

const router = Router();

router.post("/register", async (req, res) => {
  const { name, email, password, securityQuestion, securityAnswer } = req.body;
  if (!name || !email || !password || !securityQuestion || !securityAnswer) {
    return res.status(400).json({ error: "Barcha maydonlarni to'ldiring" });
  }
  if (password.length < 6) {
    return res.status(400).json({ error: "Parol kamida 6 belgidan iborat bo'lsin" });
  }
  const existing = await pool.query("SELECT id FROM users WHERE email = $1", [email]);
  if (existing.rows.length > 0) {
    return res.status(409).json({ error: "Bu email allaqachon ro'yxatdan o'tgan" });
  }
  const hash = bcrypt.hashSync(password, 10);
  const answerHash = bcrypt.hashSync(securityAnswer.trim().toLowerCase(), 10);
  const insert = await pool.query(
    `INSERT INTO users (name, email, password, role, tier, security_question, security_answer)
     VALUES ($1, $2, $3, 'user', 'free', $4, $5) RETURNING id, name, email, role, tier`,
    [name, email, hash, securityQuestion, answerHash]
  );
  const user = insert.rows[0];
  const token = signToken(user);
  res.json({ user, token });
});

router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  const result = await pool.query("SELECT * FROM users WHERE email = $1", [email]);
  const user = result.rows[0];
  if (!user || !bcrypt.compareSync(password, user.password)) {
    return res.status(401).json({ error: "Email yoki parol noto'g'ri" });
  }
  const token = signToken(user);
  const { password: _pw, security_answer: _sa, ...safeUser } = user;
  res.json({ user: safeUser, token });
});

router.get("/me", requireAuth, async (req, res) => {
  const result = await pool.query("SELECT id, name, email, role, tier FROM users WHERE id = $1", [req.user.id]);
  res.json({ user: result.rows[0] });
});

router.post("/security-question", async (req, res) => {
  const { email } = req.body;
  const result = await pool.query("SELECT security_question FROM users WHERE email = $1", [email]);
  if (result.rows.length === 0 || !result.rows[0].security_question) {
    return res.status(404).json({ error: "Bu email uchun maxfiy savol topilmadi" });
  }
  res.json({ question: result.rows[0].security_question });
});

router.post("/reset-password", async (req, res) => {
  const { email, securityAnswer, newPassword } = req.body;
  if (!email || !securityAnswer || !newPassword) {
    return res.status(400).json({ error: "Barcha maydonlarni to'ldiring" });
  }
  if (newPassword.length < 6) {
    return res.status(400).json({ error: "Parol kamida 6 belgidan iborat bo'lsin" });
  }
  const result = await pool.query("SELECT * FROM users WHERE email = $1", [email]);
  const user = result.rows[0];
  if (!user || !user.security_answer) {
    return res.status(404).json({ error: "Foydalanuvchi topilmadi" });
  }
  const isCorrect = bcrypt.compareSync(securityAnswer.trim().toLowerCase(), user.security_answer);
  if (!isCorrect) {
    return res.status(401).json({ error: "Javob noto'g'ri" });
  }
  const hash = bcrypt.hashSync(newPassword, 10);
  await pool.query("UPDATE users SET password = $1 WHERE id = $2", [hash, user.id]);
  res.json({ ok: true });
});

export default router;
