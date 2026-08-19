import { Router } from "express";
import pool from "../db/init.js";
import { requireAuth, requireAdmin } from "../middleware/auth.js";

const router = Router();

router.get("/banner", async (req, res) => {
  const result = await pool.query("SELECT value FROM settings WHERE key = 'banner_url'");
  res.json({ bannerUrl: result.rows[0]?.value || null });
});

router.put("/banner", requireAuth, requireAdmin, async (req, res) => {
  const { bannerUrl } = req.body;
  await pool.query(
    `INSERT INTO settings (key, value) VALUES ('banner_url', $1)
     ON CONFLICT (key) DO UPDATE SET value = $1`,
    [bannerUrl || ""]
  );
  res.json({ ok: true, bannerUrl });
});

export default router;
