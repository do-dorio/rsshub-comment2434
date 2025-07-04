const got = require('../utils/got');
const cheerio = require('cheerio');
const { parseRelativeDate } = require('../utils/parse-date');

module.exports = async (ctx) => {
    const rootUrl = 'https://www.tianyancha.com/';
    const response = await got({
        method: 'get',
        url: rootUrl,
    });

    const $ = cheerio.load(response.data);

    const list = $('.key')
        .slice(0, 10)
        .map((_, item) => {
            item = $(item);
            return {
                title: item.text(),
                link: item.attr('href'),
            };
        })
        .get();

    const items = await Promise.all(
        list.map((item) =>
            ctx.cache.tryGet(item.link, async () => {
                const detailResponse = await got({
                    method: 'get',
                    url: item.link,
                });
                const content = cheerio.load(detailResponse.data);

                item.author = content('.resource').text().replace('来源：', '');
                item.description = content('.news-content').html();
                item.pubDate = parseRelativeDate(content('.resource').next().text());

                return item;
            })
        )
    );

    ctx.state.data = {
        title: '热门搜索 - 天眼查',
        link: rootUrl,
        item: items,
    };
};
