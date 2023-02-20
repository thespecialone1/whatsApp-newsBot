const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const axios = require('axios');
const cheerio = require('cheerio');

const client = new Client({
  authStrategy: new LocalAuth()
});
const newsApiUrl = 'http://20.203.148.130:8000/';

client.on('qr', (qr) => {
    qrcode.generate(qr, { small: true });
});

client.on('ready', () => {
    console.log('Client is ready!');
});

const helpMessage = `Type 'news' to get the latest articles. Type 'more' to get more articles.`;

client.on('message', async (msg) => {
  const lowerCase = msg.body.toLowerCase();
    if (msg.body === 'news') {
        try {
            const response = await axios.get(newsApiUrl);
            const articles = response.data.slice(0, 3);
            let articleIndex = 0;

            for (const article of articles) {
                const { title, source, description } = article;
                const message = `*${title}*\n\n_${source}_\n\n${description}`;

                await msg.reply(message);
                articleIndex++;
            }

            if (articles.length === 0) {
                await msg.reply('No news articles found');
            } else if (articles.length < 3) {
                await msg.reply('No more news articles available');
            } else {
                await msg.reply('Send "more" to get the next three news articles');
            }
        } catch (error) {
            console.error(error);
            await msg.reply('Failed to fetch news articles');
        }
    } else if (msg.body === 'help') {
        const message = 'Available commands:\n\n- news: Get the latest news articles\n- help: Display this help message';
        await msg.reply(message);
    } else if (msg.body === 'more') {
        try {
            const response = await axios.get(newsApiUrl);
            const articles = response.data.slice(3, 6);
            let articleIndex = 0;

            for (const article of articles) {
                const { title, source, description } = article;
                const message = `*${title}*\n\n_${source}_\n\n${description}`;

                await msg.reply(message);
                articleIndex++;
            }

            if (articles.length === 0) {
                await msg.reply('No more news articles available');
            } else {
                await msg.reply('Send "more" to get the next three news articles');
            }
        } catch (error) {
            console.error(error);
            await msg.reply('Failed to fetch news articles');
        }
    }
});

client.initialize();
