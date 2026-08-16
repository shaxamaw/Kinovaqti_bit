import { Router } from "express";
import db from "../db/init.js";
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
  } catch {
    /* fall through */
  }
  return url;
}

router.get("/", (req, res) => {
  const movies = db.prepare("SELECT * FROM movies ORDER BY created_at DESC").all();
  res.json({
    movies: movies.map((m) => ({
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

router.get("/:id", requireAuth, (req, res) => {
  const movie = db.prepare("SELECT * FROM movies WHERE id = ?").get(req.params.id);
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

router.post("/", requireAuth, requireAdmin, (req, res) => {
  const { title, description, poster_url, video_url, category, release_year, required_tier } = req.body;
  if (!title || !video_url) return res.status(400).json({ error: "Sarlavha va video havolasi majburiy" });
  const tier = ["free", "premium", "vip"].includes(required_tier) ? required_tier : "free";
  const info = db
    .prepare(
      `INSERT INTO movies (title, description, poster_url, video_url, category, release_year, required_tier)
       VALUES (?, ?, ?, ?, ?, ?, ?)`
    )
    .run(title, description || "", poster_url || "", video_url, category || "", release_year || null, tier);
  const movie = db.prepare("SELECT * FROM movies WHERE id = ?").get(info.lastInsertRowid);
  res.status(201).json({ movie });
});

router.put("/:id", requireAuth, requireAdmin, (req, res) => {
  const existing = db.prepare("SELECT * FROM movies WHERE id = ?").get(req.params.id);
  if (!existing) return res.status(404).json({ error: "Kino topilmadi" });
  const { title, description, poster_url, video_url, category, release_year, required_tier } = req.body;
  db.prepare(
    `UPDATE movies SET title=?, description=?, poster_url=?, video_url=?, category=?, release_year=?, required_tier=?
     WHERE id=?`
  ).run(
    title ?? existing.title,
    description ?? existing.description,
    poster_url ?? existing.poster_url,
    video_url ?? existing.video_url,
    category ?? existing.category,
    release_year ?? existing.release_year,
    required_tier ?? existing.required_tier,
    req.params.id
  );
  const movie = db.prepare("SELECT * FROM movies WHERE id = ?").get(req.params.id);
  res.json({ movie });
});

router.delete("/:id", requireAuth, requireAdmin, (req, res) => {
  db.prepare("DELETE FROM movies WHERE id = ?").run(req.params.id);
  res.json({ ok: true });
});

export default router;
