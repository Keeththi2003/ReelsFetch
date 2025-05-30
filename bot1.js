const express = require('express');
const bodyParser = require('body-parser');
const axios = require('axios');
const TelegramBot = require('node-telegram-bot-api');

const token = '7071399955:AAHPYyUBgDIcbVmKff6tEkV1advBar5vjfo';
const url = 'https://c5f7-2407-c00-6003-ca5e-be60-f8b0-ddfa-c5db.ngrok-free.app';
const port = process.env.PORT || 3000;

const bot = new TelegramBot(token);
bot.setWebHook(`${url}/bot${token}`);

const app = express();
app.use(bodyParser.json());

app.post(`/bot${token}`, (req, res) => {
  bot.processUpdate(req.body);
  res.sendStatus(200);
});

app.get('/', (req, res) => {
    res.send('Hello! Telegram bot is running.');
  });
  

  bot.on('message', async (msg) => {
    const chatId = msg.chat.id;
    const text = msg.text;
  
    if (!text.startsWith('http') || !text.includes('instagram.com')) {
      return bot.sendMessage(chatId, 'Please send a valid Instagram video URL.');
    }
  
    bot.sendChatAction(chatId, 'upload_video'); // show typing animation
    bot.sendMessage(chatId, 'Fetching video...');
  
    try {
      // Call your own backend to get the downloadable video link
      const response = await axios.get('http://localhost:4000/igdl', {
        params: { url: text }
      });
  
      const videoUrl =response.data.url.data[0].url;

      console.log(response.data.url.data[0].url);
  
      if (!videoUrl) {
        return bot.sendMessage(chatId, 'Could not retrieve video. Try again later.');
      }
  
      // Send video to the user
      const videoRes = await axios.get(videoUrl, {
        responseType: 'arraybuffer',
        headers: { 'User-Agent': 'Mozilla/5.0' } // In case it's needed
      });
  
      await bot.sendChatAction(chatId, 'upload_video');
  
      await bot.sendVideo(chatId, Buffer.from(videoRes.data), {
        filename: 'video.mp4',
        contentType: 'video/mp4'
      });

    //   bot.sendMessage(chatId, `Here is your video: ${videoUrl}`);
    } catch (error) {
      console.error('Error:', error.message);
      bot.sendMessage(chatId, 'An error occurred while processing your request.');
    }
  });

app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
});
