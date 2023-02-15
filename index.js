const qrcode = require('qrcode-terminal');
const axios = require('axios');
const { Client, LocalAuth} = require('whatsapp-web.js');

const client = new Client({
    authStrategy: new LocalAuth()
});

client.on('qr', (qr) => {
    qrcode.generate(qr, {small: true});
});

client.on('ready', () => {
    console.log('Client is ready!');
});

client.initialize();

const helpMessage = `Type 'news' to get the latest articles. Type 'more' to get more articles.`;

client.on('message', async (message) => {
    const lowerCase = message.body.toLowerCase();

    if (lowerCase === 'news') {
        try {
            const response = await axios.get('http://20.203.148.130:8000/pakistan');
            const articles = response.data;

            const articleCount = Math.min(3, articles.length); // limit to maximum of 3 articles
            let index = 0;

            for (let i = 0; i < articleCount; i++) {
                const article = articles[index];
                await message.reply(`${article.title}\n${article.url}\nSource: ${article.source}`);
                index++;
            }

            if (articleCount < articles.length) {
                await message.reply(`Type 'more' to get more articles.`);
            }

        } catch (error) {
            console.error(error);
            await message.reply('Sorry, an error occurred while fetching the latest news.');
        }
    } else if (lowerCase === 'more') {
        try {
            const response = await axios.get('http://20.203.148.130:8000/pakistan');
            const articles = response.data;

            const articleCount = Math.min(3, articles.length - 3); // get next 3 articles
            let index = 3;

            if (articleCount === 0) {
                await message.reply(`There are no more articles available.`);
            } else {
                for (let i = 0; i < articleCount; i++) {
                    const article = articles[index];
                    await message.reply(`${article.title}\n${article.url}\nSource: ${article.source}`);
                    index++;
                }

                if (articleCount < articles.length - 3) {
                    await message.reply(`Type 'more' to get more articles.`);
                }
            }

        } catch (error) {
            console.error(error);
            await message.reply('Sorry, an error occurred while fetching the latest news.');
        }
    } else if (lowerCase === 'help') {
        await message.reply(helpMessage);
    } else {
        await message.reply('Hi! How may I help you? Type *help* to see the available commands.');
    }
});