# 📥 ReelsFetch – Telegram Instagram Video Downloader Bot


ReelsFetch is a Telegram bot that allows users to download **Instagram video reels** by simply sending a link. Built using **Node.js** and the `node-telegram-bot-api` library, it fetches the video using an API and returns the video directly in the chat.

---

## ✨ Features

- 🎥 Download public Instagram videos (reels or posts)
- ⚡ Fast and lightweight
- 🤖 Telegram bot integration

---

## 🚀 Demo

Try it on Telegram: [@ReelFetchBot](https://t.me/ReelFetchBot)  

---

## 🔧 Setup

### 1. Clone the repository

```bash
git clone https://github.com/Keeththi2003/ReelsFetch.git
cd ReelsFetch
```

### 2. Install dependencies

```bash
npm install
```

### 3. Create a ==.env== file

Create a .env file in the root of the project and add:

```.env
BOT_TOKEN=your_telegram_bot_token_here
API_BASE_URL=https://your-api-url/igdl
```

### 4. Run the server

```bash 
node index.js
```

### 5. Run the bot

```bash
cd api
node bot.js
```
## ⭐ Support

If you like this project, feel free to ⭐ the repo and share it!
Feedback and contributions are welcome!
