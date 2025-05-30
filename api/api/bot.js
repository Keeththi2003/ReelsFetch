import TelegramBot from 'node-telegram-bot-api';
import axios from 'axios';

const token = '7071399955:AAHPYyUBgDIcbVmKff6tEkV1advBar5vjfo';
const bot = new TelegramBot(token);

export default async function handler(req, res) {
  if (req.method === 'POST') {
    bot.processUpdate(req.body);
    return res.status(200).end();
  }

  res.status(405).send('Method Not Allowed');
}

// Handle message events globally
bot.on('message', async (msg) => {
  const chatId = msg.chat.id;
  const text = msg.text;

  if (!text.startsWith('http') || !text.includes('instagram.com')) {
    return bot.sendMessage(chatId, 'Please send a valid Instagram video URL.');
  }

  bot.sendChatAction(chatId, 'upload_video');
  bot.sendMessage(chatId, 'Fetching video...');

  try {
    const response = await axios.get('https://your-api-host.com/igdl', {
      params: { url: text }
    });

    const videoUrl = response.data.url.data[0].url;

    if (!videoUrl) {
      return bot.sendMessage(chatId, 'Could not retrieve video. Try again later.');
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
    bot.sendMessage(chatId, 'An error occurred while processing your request.');
  }
});
