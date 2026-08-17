import pg from "pg";
import bcrypt from "bcryptjs";

const { Pool } = pg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

export async function initDb() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      role TEXT NOT NULL DEFAULT 'user',
      tier TEXT NOT NULL DEFAULT 'free',
      created_at TIMESTAMP DEFAULT NOW()
    );
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS movies (
      id SERIAL PRIMARY KEY,
      title TEXT NOT NULL,
      description TEXT,
      poster_url TEXT,
      video_url TEXT NOT NULL,
      category TEXT,
      release_year INTEGER,
      required_tier TEXT NOT NULL DEFAULT 'free',
      created_at TIMESTAMP DEFAULT NOW()
    );
  `);

  const adminEmail = process.env.ADMIN_EMAIL || "admin@kino.uz";
  const adminPassword = process.env.ADMIN_PASSWORD || "admin12345";

  const { rows } = await pool.query("SELECT id FROM users WHERE role = 'admin' LIMIT 1");
  if (rows.length === 0) {
    const hash = bcrypt.hashSync(adminPassword, 10);
    await pool.query(
      "INSERT INTO users (name, email, password, role, tier) VALUES ($1, $2, $3, 'admin', 'vip')",
      ["Admin", adminEmail, hash]
    );
    console.log(`[seed] Admin yaratildi -> email: ${adminEmail}  parol: ${adminPassword}`);
  }
}

export default pool;
