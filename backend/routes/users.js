import { Router } from "express";
import pool from "../db/init.js";
import { requireAuth, requireAdmin } from "../middleware/auth.js";

const router = Router();

router.get("/", requireAuth, requireAdmin, async (req, res) => {
  const result = await pool.query(
    "SELECT id, name, email, role, tier, created_at FROM users ORDER BY created_at DESC"
  );
  res.json({ users: result.rows });
});

router.put("/:id/tier", requireAuth, requireAdmin, async (req, res) => {
  const { tier } = req.body;
  if (!["free", "premium", "vip"].includes(tier)) {
    return res.status(400).json({ error: "Noto'g'ri tarif" });
  }
  const update = await pool.query(
    "UPDATE users SET tier = $1 WHERE id = $2 RETURNING id, name, email, role, tier",
    [tier, req.params.id]
  );
  res.json({ user: update.rows[0] });
});

router.put("/:id/role", requireAuth, requireAdmin, async (req, res) => {
  const { role } = req.body;
  if (!["user", "admin"].includes(role)) {
    return res.status(400).json({ error: "Noto'g'ri rol" });
  }
  if (req.user.id === Number(req.params.id) && role === "user") {
    return res.status(400).json({ error: "O'zingizni admindan chetlata olmaysiz" });
  }
  const update = await pool.query(
    "UPDATE users SET role = $1 WHERE id = $2 RETURNING id, name, email, role, tier",
    [role, req.params.id]
  );
  res.json({ user: update.rows[0] });
});

export default router;
