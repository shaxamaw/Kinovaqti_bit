import "dotenv/config";
import TelegramBot from "node-telegram-bot-api";
import pg from "pg";

const { Pool } = pg;
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

const bot = new TelegramBot(process.env.BOT_TOKEN, { polling: true });

const TIER_LABEL = { free: "Ochiq", premium: "Premium", vip: "VIP" };

function toEmbedInfo(url) {
  if (url.includes("youtube.com/watch") || url.includes("youtu.be/")) {
    return { type: "youtube", url };
  }
  return { type: "other", url };
}

bot.onText(/\/start/, (msg) => {
  bot.sendMessage(
    msg.chat.id,
    "Assalomu alaykum! KinoFlux botiga xush kelibsiz.\n\n" +
      "/kinolar - barcha kinolar ro'yxatini ko'rish\n" +
      "/qidir <nom> - kino qidirish"
  );
});

bot.onText(/\/kinolar/, async (msg) => {
  try {
    const result = await pool.query("SELECT id, title, category, release_year, required_tier FROM movies ORDER BY created_at DESC LIMIT 20");
    if (result.rows.length === 0) {
      return bot.sendMessage(msg.chat.id, "Hozircha kinolar mavjud emas.");
    }
    let text = "🎬 So'nggi kinolar:\n\n";
    result.rows.forEach((m, i) => {
      text += `${i + 1}. ${m.title} ${m.release_year ? `(${m.release_year})` : ""} — ${TIER_LABEL[m.required_tier]}\n`;
      text += `   /kino_${m.id}\n\n`;
    });
    bot.sendMessage(msg.chat.id, text);
  } catch (err) {
    bot.sendMessage(msg.chat.id, "Xatolik yuz berdi, keyinroq urinib ko'ring.");
  }
});

bot.onText(/\/kino_(\d+)/, async (msg, match) => {
  const id = match[1];
  try {
    const result = await pool.query("SELECT * FROM movies WHERE id = $1", [id]);
    const movie = result.rows[0];
    if (!movie) return bot.sendMessage(msg.chat.id, "Kino topilmadi.");

    let caption = `🎬 *${movie.title}*\n`;
    if (movie.category) caption += `Janr: ${movie.category}\n`;
    if (movie.release_year) caption += `Yil: ${movie.release_year}\n`;
    caption += `Tarif: ${TIER_LABEL[movie.required_tier]}\n\n`;
    if (movie.description) caption += `${movie.description}\n\n`;
    caption += `🔗 Tomosha qilish: ${movie.video_url}`;

    if (movie.poster_url) {
      await bot.sendPhoto(msg.chat.id, movie.poster_url, { caption, parse_mode: "Markdown" });
    } else {
      await bot.sendMessage(msg.chat.id, caption, { parse_mode: "Markdown" });
    }
  } catch (err) {
    bot.sendMessage(msg.chat.id, "Xatolik yuz berdi.");
  }
});

bot.onText(/\/qidir (.+)/, async (msg, match) => {
  const query = match[1];
  try {
    const result = await pool.query(
      "SELECT id, title, release_year, required_tier FROM movies WHERE title ILIKE $1 LIMIT 15",
      [`%${query}%`]
    );
    if (result.rows.length === 0) {
      return bot.sendMessage(msg.chat.id, "Hech narsa topilmadi.");
    }
    let text = `🔍 "${query}" bo'yicha natijalar:\n\n`;
    result.rows.forEach((m, i) => {
      text += `${i + 1}. ${m.title} ${m.release_year ? `(${m.release_year})` : ""} — ${TIER_LABEL[m.required_tier]}\n`;
      text += `   /kino_${m.id}\n\n`;
    });
    bot.sendMessage(msg.chat.id, text);
  } catch (err) {
    bot.sendMessage(msg.chat.id, "Xatolik yuz berdi.");
  }
});

console.log("Bot ishga tushdi...");
