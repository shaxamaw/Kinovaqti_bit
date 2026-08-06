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

TOKEN = "8815633454:AAHAuPJjbLT7U8eQzNRDSPzO73rk8i5wsq4# Admin kino nomini yuboradi
async def receive_name(update: Update, context: ContextTypes.DEFAULT_TYPE):
    if update.effective_user.id != ADMIN_ID:
        return

    if ADMIN_ID not in waiting_video:
        return

    waiting_name[ADMIN_ID] = update.message.text
    await update.message.reply_text(
        "🔢 Endi kino kodini yuboring.\nMasalan: 101"
    )

# Admin kino kodini yuboradi
async def receive_code(update: Update, context: ContextTypes.DEFAULT_TYPE):
    if update.effective_user.id != ADMIN_ID:
        return

    if ADMIN_ID not in waiting_video or ADMIN_ID not in waiting_name:
        return

    code = update.message.text

    movies[code] = {
        "name": waiting_name[ADMIN_ID],
        "file_id": waiting_video[ADMIN_ID]
    }

    save_movies()

    del waiting_video[ADMIN_ID]
    del waiting_name[ADMIN_ID]

    await update.message.reply_text(
        f"✅ Kino saqlandi!\n🎬 {code} - {movies[code]['name']}"
    )"
ADMIN_ID = 7654892861

MOVIES_FILE = "movies.json"

# Vaqtinchalik saqlash
waiting_video = {}
waiting_name = {}
user_data = {}

# Kinolarni yuklash
if os.path.exists(MOVIES_FILE):
    with open(MOVIES_FILE, "r", encoding="utf-8") as f:
        movies = json.load(f)
else:
    movies = {}

# Saqlash
def save_movies():
    with open(MOVIES_FILE, "w", encoding="utf-8") as f:
        json.dump(movies, f, ensure_ascii=False, indent=4)

# /start
async def start(update: Update, context: ContextTypes.DEFAULT_TYPE):
    await update.message.reply_text(
        "🎬 Assalomu alaykum!\n\nKino kodi yoki nomini yuboring."
    )

# Admin video yuboradi
async def receive_video(update: Update, context: ContextTypes.DEFAULT_TYPE):
    if update.effective_user.id != ADMIN_ID:
        return

    waiting_video[ADMIN_ID] = update.message.video.file_id
    waiting_name[ADMIN_ID] = True

    await update.message.reply_text(
        "🎬 Kino nomini yuboring."
  )
  # Foydalanuvchi kino qidiradi
async def search_movie(update: Update, context: ContextTypes.DEFAULT_TYPE):
    text = update.message.text.strip().lower()

    # Admin nom yuborayotgan bo'lsa
    if update.effective_user.id == ADMIN_ID and ADMIN_ID in waiting_video and ADMIN_ID not in waiting_name:
        await receive_name(update, context)
        return

    # Admin kod yuborayotgan bo'lsa
    if update.effective_user.id == ADMIN_ID and ADMIN_ID in waiting_name:
        await receive_code(update, context)
        return

    # Kod bo'yicha qidirish
    if text in movies:
        await update.message.reply_video(movies[text]["file_id"])
        return

    # Nomi bo'yicha qidirish
    for movie in movies.values():
        if text in movie["name"].lower():
            await update.message.reply_video(movie["file_id"])
            return

    await update.message.reply_text("❌ Kino topilmadi.")

def main():
    app = Application.builder().token(TOKEN).build()

    app.add_handler(CommandHandler("start", start))
    app.add_handler(MessageHandler(filters.VIDEO, receive_video))
    app.add_handler(MessageHandler(filters.TEXT & ~filters.COMMAND, search_movie))

    print("🎬 Kino bot ishga tushdi...")
    app.run_polling()

if __name__ == "__main__":
    main()
