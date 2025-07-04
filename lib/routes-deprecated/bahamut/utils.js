const got = require('../utils/got');
const cheerio = require('cheerio');

const base = 'https://home.gamer.com.tw/';

module.exports = {
    ProcessFeed: async (url, ctx) => {
        const response = await got.get(url);
        const $ = cheerio.load(response.data);

        const title = $('title').text();
        const list = $('.BH-lbox > .HOME-mainbox1').toArray();

        const parseContent = (htmlString) => {
            const $ = cheerio.load(htmlString);
            const content = $('.MSG-list8C');

            const images = $('img');
            for (const image of images) {
                $(image).attr('src', $(image).attr('data-src'));
            }

            return {
                description: content.html(),
            };
        };

        const items = await Promise.all(
            list.map(async (item) => {
                const $ = cheerio.load(item);
                const title = $('.HOME-mainbox1b > h1 > a');
                const link = base + title.attr('href');
                const author = $('.HOME-mainbox1b > .ST1 > a').text();
                const time = $('.HOME-mainbox1b > .ST1').text().split('│')[1];

                const cache = await ctx.cache.get(link);
                if (cache) {
                    return JSON.parse(cache);
                }

                const topic = {
                    title: title.text().trim(),
                    link,
                    author,
                    pubDate: new Date(time),
                };

                try {
                    const detail_response = await got.get(link);
                    const result = parseContent(detail_response.data);
                    if (!result.description) {
                        return '';
                    }
                    topic.description = result.description;
                } catch {
                    return '';
                }
                ctx.cache.set(link, JSON.stringify(topic));
                return topic;
            })
        );

        return { title, items };
    },
};
