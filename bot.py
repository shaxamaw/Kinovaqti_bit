from telegram import Update
from telegram.ext import (
    Application,
    CommandHandler,
    MessageHandler,
    ContextTypes,
    filters,
)

TOKEN = "8815633454:AAHYpbk_1DwCtP9AePbpWmcUw8D37-yulJU"
"

movies = {
    "jumanji": "🎬 Jumanji: https://t.me/kinolar_2026/1",
    "avatar": "🎬 Avatar: https://t.me/kinolar_2026/2",
}

async def start(update: Update, context: ContextTypes.DEFAULT_TYPE):
    await update.message.reply_text(
        "🎬 Assalomu alaykum!\n\nKino nomini yuboring."
    )

async def search(update: Update, context: ContextTypes.DEFAULT_TYPE):
    text = update.message.text.strip().lower()

    if text in movies:
        await update.message.reply_text(movies[text])
    else:
        await update.message.reply_text("❌ Bunday kino topilmadi.")

def main():
    app = Application.builder().token(TOKEN).build()

    app.add_handler(CommandHandler("start", start))
    app.add_handler(MessageHandler(filters.TEXT & ~filters.COMMAND, search))

    print("Bot ishga tushdi...")
    app.run_polling()

if __name__ == "__main__":
    main()
