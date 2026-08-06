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

waiting_code = {}

if os.path.exists(MOVIES_FILE):
    with open(MOVIES_FILE, "r") as f:
        movies = json.load(f)
else:
    movies = {}

def save_movies():
    with open(MOVIES_FILE, "w") as f:
        json.dump(movies, f)

async def start(update: Update, context: ContextTypes.DEFAULT_TYPE):
    await update.message.reply_text(
        "🎬 Kino kodini yuboring."
    )

async def video(update: Update, context: ContextTypes.DEFAULT_TYPE):
    if update.effective_user.id != ADMIN_ID:
        return

    waiting_code[update.effective_user.id] = update.message.video.file_id
    await update.message.reply_text(
        "✅ Endi kino kodini yuboring.\nMasalan: 101"
    )
