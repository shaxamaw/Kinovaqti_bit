import json
import os
from telegram import Update
from telegram.ext import (
    Application,
    CommandHandler,
    MessageHandler,
    ContextTypes,
    filters,
)

# BOT TOKENINGIZNI YOZING
TOKEN = "8815633454:AAHAuPJjbLT7U8eQzNRDSPzO73rk8i5wsq4"

# ADMIN ID
ADMIN_ID = 7654892861

MOVIES_FILE = "movies.json"

# Kutish holati
waiting_video = {}

# Kinolarni yuklash
if os.path.exists(MOVIES_FILE):
    with open(MOVIES_FILE, "r", encoding="utf-8") as f:
        movies = json.load(f)
else:
    movies = {}

# Saqlash funksiyasi
def save_movies():
    with open(MOVIES_FILE, "w", encoding="utf-8") as f:
        json.dump(movies, f, ensure_ascii=False, indent=4)

# /start
async def start(update: Update, context: ContextTypes.DEFAULT_TYPE):
    await update.message.reply_text(
        "🎬 Xush kelibsiz!\n\nKino kodini yuboring."
    )

# Admin video yuborishi
async def receive_video(update: Update, context: ContextTypes.DEFAULT_TYPE):
    if update.effective_user.id != ADMIN_ID:
        return

    waiting_video[update.effective_user.id] = update.message.video.file_id
    await update.message.reply_text(
        "📌 Endi shu kino uchun kod yuboring.\nMasalan: 101"
    )# Admin kod yuborishi
async def receive_code(update: Update, context: ContextTypes.DEFAULT_TYPE):
    user_id = update.effective_user.id

    if user_id != ADMIN_ID:
        return

    if user_id not in waiting_video:
        return

    code = update.message.text.strip()

    movies[code] = waiting_video[user_id]
    save_movies()

    del waiting_video[user_id]

    await update.message.reply_text(
        f"✅ Kino saqlandi!\n\n🎬 Kod: {code}"
    )

# Foydalanuvchi kino so'rashi
async def search_movie(update: Update, context: ContextTypes.DEFAULT_TYPE):
    text = update.message.text.strip()

    if text in movies:
        await update.message.reply_video(movies[text])
    else:
        await update.message.reply_text(
            "❌ Bunday kodli kino topilmadi."
        )def main():
    app = Application.builder().token(TOKEN).build()

    app.add_handler(CommandHandler("start", start))

    app.add_handler(
        MessageHandler(filters.VIDEO & filters.User(ADMIN_ID), receive_video)
    )

    app.add_handler(
        MessageHandler(filters.TEXT & filters.User(ADMIN_ID), receive_code)
    )

    app.add_handler(
        MessageHandler(filters.TEXT & ~filters.User(ADMIN_ID), search_movie)
    )

    print("✅ Bot ishga tushdi...")

    app.run_polling()

if __name__ == "__main__":
    main()# ADMIN buyruqlari

@bot.message_handler(commands=['stats'])
def stats(message):
    if str(message.from_user.id) != ADMIN_ID:
        bot.reply_to(message, "❌ Siz admin emassiz.")
        return

    bot.reply_to(
        message,
        f"📊 Bot ishlamoqda.\nVideolar soni: {len(videos)}"
    )


@bot.message_handler(commands=['help'])
def help_cmd(message):
    bot.send_message(
        message.chat.id,
        """
🎬 Kino bot yordam

🔢 Kino kodini yuboring — video keladi.

Admin:
/add - video qo'shish
/stats - statistika
"""
    )


# Noma'lum xabarlar
@bot.message_handler(func=lambda message: True)
def all_message(message):
    code = message.text.strip()

    if code in videos:
        bot.send_video(
            message.chat.id,
            videos[code],
            caption=f"🎬 Kino kodi: {code}"
        )
    else:
        bot.reply_to(
            message,
            "❌ Bunday kino kodi topilmadi."
        )


print("Bot ishga tushdi...")
bot.infinity_polling()
