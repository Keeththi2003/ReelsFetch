const TelegramBot = require('node-telegram-bot-api');
const https = require('https');
const http = require('http');
const { URL } = require('url');

const token = '7071399955:AAHPYyUBgDIcbVmKff6tEkV1advBar5vjfo';
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

      if (!text.startsWith('http') || !text.includes('instagram.com')) {
        await bot.sendMessage(chatId, 'Please send a valid Instagram video URL.');
        return res.status(200).end();
      }

      await bot.sendChatAction(chatId, 'upload_video');
      await bot.sendMessage(chatId, 'Fetching video...');

      try {
        // Replace this with your actual API endpoint
        const apiUrl = `https://appsail-10100207863.development.catalystappsail.com/igdl?url=${encodeURIComponent(text)}`;
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
