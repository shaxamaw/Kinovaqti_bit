from telegram import Update
from telegram.ext import Application, CommandHandler, MessageHandler, ContextTypes, filters

TOKEN = "8815633454:AAHYpbk_1DwCtP9AePbpWmcUw8D37-yulJU"

movies = {
    "jumanji": "🎬 Jumanji: https://t.me/kinolar_2026/1",
    "avatar": "🎬 Avatar: https://t.me/kinolar_2026/2",
}

async def start(update: Update, context: ContextTypes.DEFAULT_TYPE):
    await update.message.reply_text("🎬 Kino nomini yozing:")

async def search(update: Update, context: ContextTypes.DEFAULT_TYPE):
    text = update.message.text.lower()
    if text in movies:
        await update.message.reply_text(movies[text])
    else:
        await update.message.reply_text("❌ Bu kino topilmadi.")

app = Application.builder().token(TOKEN).build()
app.add_handler(CommandHandler("start", start))
app.add_handler(MessageHandler(filters.TEXT & ~filters.COMMAND, search))

app.run_polling()
