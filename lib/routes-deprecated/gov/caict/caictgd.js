const url = require('url');
const got = require('../utils/got');
const cheerio = require('cheerio');

module.exports = async (ctx) => {
    const link = `http://www.caict.ac.cn/kxyj/caictgd/`;
    const response = await got({
        method: 'get',
        url: link,
    });
    const $ = cheerio.load(response.data);
    const list = $('td[width="600"]')
        .map((_, item) => {
            item = $(item);
            const a = item.find('a');
            return {
                title: a.text(),
                link: url.resolve(link, a.attr('href')),
                pubDate: item.next().find('span.kxyj_text').text(),
            };
        })
        .get();

    const items = await Promise.all(
        list.map((item) =>
            ctx.cache.tryGet(item.link, async () => {
                const res = await got({ method: 'get', url: item.link });
                const content = cheerio.load(res.data);
                item.description = content('div.pagemaintext').html();
                return item;
            })
        )
    );

    ctx.state.data = {
        title: '中国信息通信研究院 - CAICT观点',
        link,
        item: items,
    };
};
