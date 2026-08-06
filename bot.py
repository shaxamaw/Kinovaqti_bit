from telegram import Update
from telegram.ext import Application, CommandHandler, ContextTypes

TOKEN = "8815633454:AAHAuPJjbLT7U8eQzNRDSPzO73rk8i5wsq4"

async def start(update: Update, context: ContextTypes.DEFAULT_TYPE):
    await update.message.reply_text("🎬 Assalomu alaykum! Bot ishlayapti.")

def main():
    app = Application.builder().token(TOKEN).build()
    app.add_handler(CommandHandler("start", start))
    print("Bot ishga tushdi...")
    app.run_polling()

if __name__ == "__main__":
    main()
