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

TOKEN = "8815633454:AAHAuPJjbLT7U8eQzNRDSPzO73rk8i5wsq4"
ADMIN_ID = 7654892861
MOVIES_FILE = "movies.json"

# Ma'lumotlar
if os.path.exists(MOVIES_FILE):
    with open(MOVIES_FILE, "r", encoding="utf-8") as f:
        movies = json.load(f)
else:
    movies = {}

waiting = {}

def save_movies():
    with open(MOVIES_FILE, "w", encoding="utf-8") as f:
        json.dump(movies, f, ensure_ascii=False, indent=4)

async def start(update: Update, context: ContextTypes.DEFAULT_TYPE):
    await update.message.reply_text(
        "🎬 Assalomu alaykum!\n\nKino kodi yoki nomini yuboring."
    )

async def receive_video(update: Update, context: ContextTypes.DEFAULT_TYPE):
    if update.effective_user.id != ADMIN_ID:
        return

    waiting[ADMIN_ID] = {
        "file_id": update.message.video.file_id,
        "step": "name"
    }

    await update.message.reply_text("📝 Kino nomini yuboring.")
  async def handle_text(update: Update, context: ContextTypes.DEFAULT_TYPE):
    text = update.message.text.strip()
    user_id = update.effective_user.id

    # Admin kino qo'shayotganda
    if user_id == ADMIN_ID and user_id in waiting:

        # 1-bosqich: kino nomi
        if waiting[user_id]["step"] == "name":
            waiting[user_id]["name"] = text
            waiting[user_id]["step"] = "code"

            await update.message.reply_text(
                "🔢 Endi kino kodini yuboring.\nMasalan: 101"
            )
            return

        # 2-bosqich: kino kodi
        if waiting[user_id]["step"] == "code":
            movies[text] = {
                "name": waiting[user_id]["name"],
                "file_id": waiting[user_id]["file_id"]
            }

            save_movies()
            del waiting[user_id]

            await update.message.reply_text(
                f"✅ Kino saqlandi!\n\n"
                f"🎬 Nomi: {movies[text]['name']}\n"
                f"🔢 Kodi: {text}"
            )
            return
              # Foydalanuvchi kino qidirishi
    if text in movies:
        await update.message.reply_video(movies[text]["file_id"])
        return

    # Kino nomi bo'yicha qidirish
    for code, movie in movies.items():
        if text.lower() in movie["name"].lower():
            await update.message.reply_video(movie["file_id"])
            return

    await update.message.reply_text(
        "❌ Kino topilmadi."
    )


def main():
    app = Application.builder().token(TOKEN).build()

    app.add_handler(CommandHandler("start", start))
    app.add_handler(MessageHandler(filters.VIDEO, receive_video))
    app.add_handler(
        MessageHandler(filters.TEXT & ~filters.COMMAND, handle_text)
    )

    print("🎬 Bot ishga tushdi...")
    app.run_polling()


if __name__ == "__main__":
    main()
  # Foydalanuvchi kino qidiradi
    # Avval kod bo'yicha qidirish
    if text in movies:
        await update.message.reply_video(movies[text]["file_id"])
        return

    # Keyin nom bo'yicha qidirish
    for code, movie in movies.items():
        if text.lower() in movie["name"].lower():
            await update.message.reply_video(movie["file_id"])
            return

    await update.message.reply_text(
        "❌ Kino topilmadi."
    )


def main():
    app = Application.builder().token(TOKEN).build()

    app.add_handler(CommandHandler("start", start))
    app.add_handler(MessageHandler(filters.VIDEO, receive_video))
    app.add_handler(
        MessageHandler(filters.TEXT & ~filters.COMMAND, handle_text)
    )

    print("✅ Kino bot ishga tushdi...")
    app.run_polling()


if __name__ == "__main__":
    main()
