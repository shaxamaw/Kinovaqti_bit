import { Router } from "express";
import bcrypt from "bcryptjs";
import db from "../db/init.js";
import { signToken, requireAuth } from "../middleware/auth.js";

const router = Router();

router.post("/register", (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password) {
    return res.status(400).json({ error: "Barcha maydonlarni to'ldiring" });
  }
  if (password.length < 6) {
    return res.status(400).json({ error: "Parol kamida 6 belgidan iborat bo'lsin" });
  }
  const existing = db.prepare("SELECT id FROM users WHERE email = ?").get(email);
  if (existing) {
    return res.status(409).json({ error: "Bu email allaqachon ro'yxatdan o'tgan" });
  }
  const hash = bcrypt.hashSync(password, 10);
  const info = db
    .prepare("INSERT INTO users (name, email, password, role, tier) VALUES (?, ?, ?, 'user', 'free')")
    .run(name, email, hash);
  const user = db.prepare("SELECT id, name, email, role, tier FROM users WHERE id = ?").get(info.lastInsertRowid);
  const token = signToken(user);
  res.json({ user, token });
});

router.post("/login", (req, res) => {
  const { email, password } = req.body;
  const user = db.prepare("SELECT * FROM users WHERE email = ?").get(email);
  if (!user || !bcrypt.compareSync(password, user.password)) {
    return res.status(401).json({ error: "Email yoki parol noto'g'ri" });
  }
  const token = signToken(user);
  const { password: _pw, ...safeUser } = user;
  res.json({ user: safeUser, token });
});

router.get("/me", requireAuth, (req, res) => {
  const user = db.prepare("SELECT id, name, email, role, tier FROM users WHERE id = ?").get(req.user.id);
  res.json({ user });
});

export default router;
