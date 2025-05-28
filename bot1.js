const TelegramBot = require('node-telegram-bot-api');
const axios = require('axios');

const token = '7071399955:AAHPYyUBgDIcbVmKff6tEkV1advBar5vjfo'; // Replace with your bot token
const backendURL = 'http://localhost:4000/igdl'; // Your backend API

const bot = new TelegramBot(token, { polling: true });
bot.on('message', async (msg) => {
    const chatId = msg.chat.id;
    const url = msg.text;
  
    if (!url || !url.startsWith('http')) {
      return bot.sendMessage(chatId, 'Please send a valid URL.');
    }
  
    bot.sendMessage(chatId, 'Downloading video, please wait...');
  
    try {
      // Call backend API
      const response = await axios.get(backendURL, { params: { url } });
  
      if (!response.data.url) {
        return bot.sendMessage(chatId, 'Could not download the video.');
      }
  
      const videoURL =response.data.url.data[0].url;
  
      // Stream video directly to Telegram
      const videoStream = await axios({
        method: 'GET',
        url: videoURL,
        responseType: 'stream',
      });
  
      await bot.sendVideo(chatId, videoStream.data, { contentType: 'video/mp4' });
  
    } catch (err) {
      console.error(err);
      bot.sendMessage(chatId, 'Error occurred while processing your request.');
    }
  });
  