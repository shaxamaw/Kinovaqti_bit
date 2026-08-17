import { Router } from "express";
import pool from "../db/init.js";
import { requireAuth, requireAdmin, TIER_RANK } from "../middleware/auth.js";

const router = Router();

function toEmbedUrl(url) {
  try {
    if (url.includes("youtube.com/watch")) {
      const id = new URL(url).searchParams.get("v");
      return `https://www.youtube.com/embed/${id}`;
    }
    if (url.includes("youtu.be/")) {
      const id = url.split("youtu.be/")[1].split(/[?&]/)[0];
      return `https://www.youtube.com/embed/${id}`;
    }
    if (url.includes("vimeo.com/")) {
      const id = url.split("vimeo.com/")[1].split(/[?&]/)[0];
      return `https://player.vimeo.com/video/${id}`;
    }
    if (url.includes("drive.google.com")) {
      const match = url.match(/\/d\/([^/]+)/);
      if (match) {
        return `https://drive.google.com/file/d/${match[1]}/preview`;
      }
    }
  } catch {
    /* fall through */
  }
  return url;
}

router.get("/", async (req, res) => {
  const result = await pool.query("SELECT * FROM movies ORDER BY created_at DESC");
  res.json({
    movies: result.rows.map((m) => ({
      id: m.id,
      title: m.title,
      description: m.description,
      poster_url: m.poster_url,
      category: m.category,
      release_year: m.release_year,
      required_tier: m.required_tier,
    })),
  });
});

router.get("/:id", requireAuth, async (req, res) => {
  const result = await pool.query("SELECT * FROM movies WHERE id = $1", [req.params.id]);
  const movie = result.rows[0];
  if (!movie) return res.status(404).json({ error: "Kino topilmadi" });

  const hasAccess =
    req.user.role === "admin" || TIER_RANK[req.user.tier] >= TIER_RANK[movie.required_tier];

  res.json({
    movie: {
      ...movie,
      video_url: hasAccess ? toEmbedUrl(movie.video_url) : null,
    },
    hasAccess,
  });
});

router.post("/", requireAuth, requireAdmin, async (req, res) => {
  const { title, description, poster_url, video_url, category, release_year, required_tier } = req.body;
  if (!title || !video_url) return res.status(400).json({ error: "Sarlavha va video havolasi majburiy" });
  const tier = ["free", "premium", "vip"].includes(required_tier) ? required_tier : "free";
  const insert = await pool.query(
    `INSERT INTO movies (title, description, poster_url, video_url, category, release_year, required_tier)
     VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
    [title, description || "", poster_url || "", video_url, category || "", release_year || null, tier]
  );
  res.status(201).json({ movie: insert.rows[0] });
});

router.put("/:id", requireAuth, requireAdmin, async (req, res) => {
  const existingResult = await pool.query("SELECT * FROM movies WHERE id = $1", [req.params.id]);
  const existing = existingResult.rows[0];
  if (!existing) return res.status(404).json({ error: "Kino topilmadi" });
  const { title, description, poster_url, video_url, category, release_year, required_tier } = req.body;
  const update = await pool.query(
    `UPDATE movies SET title=$1, description=$2, poster_url=$3, video_url=$4, category=$5, release_year=$6, required_tier=$7
     WHERE id=$8 RETURNING *`,
    [
      title ?? existing.title,
      description ?? existing.description,
      poster_url ?? existing.poster_url,
      video_url ?? existing.video_url,
      category ?? existing.category,
      release_year ?? existing.release_year,
      required_tier ?? existing.required_tier,
      req.params.id,
    ]
  );
  res.json({ movie: update.rows[0] });
});

router.delete("/:id", requireAuth, requireAdmin, async (req, res) => {
  await pool.query("DELETE FROM movies WHERE id = $1", [req.params.id]);
  res.json({ ok: true });
});

export default router;
