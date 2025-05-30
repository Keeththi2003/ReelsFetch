const TelegramBot = require('node-telegram-bot-api');
const axios = require('axios');

const token = process.env.TELEGRAM_TOKEN || 'your-token-here'; 
const bot = new TelegramBot(token);

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).send('Method Not Allowed');
  }

  const update = req.body;
  try {
    // Process the update (this just parses, no event handlers here)
    await bot.processUpdate(update);

    // Now manually handle message updates:
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
        const response = await axios.get('https://your-api-host.com/igdl', {
          params: { url: text }
        });

        const videoUrl = response.data.url.data[0].url;

        if (!videoUrl) {
          await bot.sendMessage(chatId, 'Could not retrieve video. Try again later.');
          return res.status(200).end();
        }

        const videoRes = await axios.get(videoUrl, {
          responseType: 'arraybuffer',
          headers: { 'User-Agent': 'Mozilla/5.0' }
        });

        await bot.sendVideo(chatId, Buffer.from(videoRes.data), {
          filename: 'video.mp4',
          contentType: 'video/mp4'
        });

      } catch (error) {
        console.error('Error:', error.message);
        await bot.sendMessage(chatId, 'An error occurred while processing your request.');
      }
    }

    res.status(200).end();
  } catch (error) {
    console.error('Failed to process update:', error);
    res.status(500).end();
  }
}
