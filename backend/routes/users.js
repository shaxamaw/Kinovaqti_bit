import { Router } from "express";
import db from "../db/init.js";
import { requireAuth, requireAdmin } from "../middleware/auth.js";

const router = Router();

router.get("/", requireAuth, requireAdmin, (req, res) => {
  const users = db.prepare("SELECT id, name, email, role, tier, created_at FROM users ORDER BY created_at DESC").all();
  res.json({ users });
});

router.put("/:id/tier", requireAuth, requireAdmin, (req, res) => {
  const { tier } = req.body;
  if (!["free", "premium", "vip"].includes(tier)) {
    return res.status(400).json({ error: "Noto'g'ri tarif" });
  }
  db.prepare("UPDATE users SET tier = ? WHERE id = ?").run(tier, req.params.id);
  const user = db.prepare("SELECT id, name, email, role, tier FROM users WHERE id = ?").get(req.params.id);
  res.json({ user });
});

export default router;
