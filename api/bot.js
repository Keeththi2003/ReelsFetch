const TelegramBot = require('node-telegram-bot-api');
const https = require('https');
const http = require('http');
const { URL } = require('url');
require('dotenv').config();


const token = process.env.BOT_TOKEN;
const bot = new TelegramBot(token);

function fetchJSON(urlStr) {
  return new Promise((resolve, reject) => {
    const url = new URL(urlStr);
    const lib = url.protocol === 'https:' ? https : http;

    const req = lib.get(url, (res) => {
      let data = '';
      res.on('data', (chunk) => (data += chunk));
      res.on('end', () => {
        try {
          resolve(JSON.parse(data));
        } catch (err) {
          reject(err);
        }
      });
    });

    req.on('error', reject);
    req.end();
  });
}

function fetchBuffer(urlStr) {
  return new Promise((resolve, reject) => {
    const url = new URL(urlStr);
    const lib = url.protocol === 'https:' ? https : http;

    const req = lib.get(
      url,
      { headers: { 'User-Agent': 'Mozilla/5.0' } },
      (res) => {
        const chunks = [];
        res.on('data', (chunk) => chunks.push(chunk));
        res.on('end', () => resolve(Buffer.concat(chunks)));
      }
    );

    req.on('error', reject);
    req.end();
  });
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).send('Method Not Allowed');
  }

  const update = req.body;

  try {
    await bot.processUpdate(update);

    if (update.message && update.message.text) {
      const chatId = update.message.chat.id;
      const text = update.message.text;
      const user = update.message.from;
      const username = user.username ? `@${user.username}` : user.first_name;


      if (text.startsWith('Hi') || text.includes('Hello')) {
        await bot.sendMessage(chatId, `👋 Hello ${username} !`);
        return res.status(200).end();
      }

      if (!text.startsWith('http') || !text.includes('instagram.com')) {
        await bot.sendMessage(chatId, 'Please send a valid Instagram video URL.');
        return res.status(200).end();
      }

      await bot.sendChatAction(chatId, 'upload_video');
      await bot.sendMessage(chatId, 'Fetching video...');

      try {
        const apiUrl = `${process.env.API_BASE_URL}?url=${encodeURIComponent(text)}`;
        const response = await fetchJSON(apiUrl);

        const videoUrl = response.url?.data?.[0]?.url;

        if (!videoUrl) {
          await bot.sendMessage(chatId, 'Could not retrieve video. Try again later.');
          return res.status(200).end();
        }

        const videoBuffer = await fetchBuffer(videoUrl);

        await bot.sendVideo(chatId, videoBuffer, {
          filename: 'video.mp4',
          contentType: 'video/mp4',
        });

        await bot.sendMessage(chatId, '🌟 Give me a star on GitHub: https://github.com/Keeththi2003/ReelsFetch');
        await bot.sendMessage(chatId, '🔗 Connect with me on LinkedIn: https://www.linkedin.com/in/k-keeththigan/');

      } catch (err) {
        console.error('Error during download:', err.message);
        await bot.sendMessage(chatId, 'An error occurred while processing your request.');
      }
    }

    res.status(200).end();
  } catch (err) {
    console.error('Failed to process update:', err.message);
    res.status(500).end();
  }
}
