import Database from "better-sqlite3";
import bcrypt from "bcryptjs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const db = new Database(path.join(__dirname, "kino.db"));

db.pragma("journal_mode = WAL");

db.exec(`
CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'user',
  tier TEXT NOT NULL DEFAULT 'free',
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS movies (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  description TEXT,
  poster_url TEXT,
  video_url TEXT NOT NULL,
  category TEXT,
  release_year INTEGER,
  required_tier TEXT NOT NULL DEFAULT 'free',
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
);
`);

const adminEmail = process.env.ADMIN_EMAIL || "admin@kino.uz";
const adminPassword = process.env.ADMIN_PASSWORD || "admin12345";

const existingAdmin = db.prepare("SELECT id FROM users WHERE role = 'admin' LIMIT 1").get();
if (!existingAdmin) {
  const hash = bcrypt.hashSync(adminPassword, 10);
  db.prepare(
    "INSERT INTO users (name, email, password, role, tier) VALUES (?, ?, ?, 'admin', 'vip')"
  ).run("Admin", adminEmail, hash);
  console.log(`[seed] Admin account created -> email: ${adminEmail}  password: ${adminPassword}`);
  console.log("[seed] IMPORTANT: change this password after first login.");
}

export default db;
