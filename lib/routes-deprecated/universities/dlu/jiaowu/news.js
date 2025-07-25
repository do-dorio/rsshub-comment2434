const got = require('../utils/got');
const cheerio = require('cheerio');
const { parseDate } = require('../utils/parse-date');
const timezone = require('../utils/timezone');

const baseUrl = 'http://jwc1.dlu.edu.cn/';

module.exports = async (ctx) => {
    const resp = await got({ url: baseUrl });
    const index = cheerio.load(resp.data);

    const items = index('td[valign="top"]>table[cellspacing="3"][width="100%"] tr')
        .toArray()
        .map((elem) => {
            const link = new URL(index('a', elem).attr('href'), baseUrl).href;
            return ctx.cache.tryGet(link, async () => {
                const resp = await got({ url: link });
                const article = cheerio.load(resp.data);
                return {
                    link: link.toString(),
                    title: index('a', elem).attr('title'),
                    pubDate: timezone(parseDate(article('td[height="28"]').text(), 'YYYY年MM月DD日 HH:mm'), +8).toUTCString(),
                    description: article('form[name="_newscontent_fromname"] > div > *:not(table)')
                        .toArray()
                        .map((it) => article(it).html())
                        .join('\n'),
                };
            });
        });

    ctx.state.data = {
        link: baseUrl,
        title: '大连大学教务处',
        item: await Promise.all(items),
    };
};
