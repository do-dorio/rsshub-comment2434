const got = require('../utils/got');
const cheerio = require('cheerio');

module.exports = async (ctx) => {
    const base_url = 'http://www.cnca.gov.cn/xxgk/zxtz/2019/';
    const response = await got.get(base_url);
    const $ = cheerio.load(response.data);
    const list = $('.liebiao li').get();

    const ProcessFeed = (data) => {
        const $ = cheerio.load(data);

        const content = $('.TRS_Editor p');
        return content.text();
    };

    const items = await Promise.all(
        list.map(async (item) => {
            const $ = cheerio.load(item);
            const $a = $('a');
            let link = $a.attr('href');
            if (link.startsWith('.')) {
                link = base_url + link;
            }

            const cache = await ctx.cache.get(link);
            if (cache) {
                return JSON.parse(cache);
            }

            try {
                const response = await got({
                    method: 'get',
                    url: link,
                });
                const single = {
                    title: $a.text(),
                    description: ProcessFeed(response.data),
                    pubDate: $('span').html(),
                    link,
                };

                ctx.cache.set(link, JSON.stringify(single));
                return single;
            } catch {
                const single = {
                    title: $a.text(),
                    description: '',
                    pubDate: $('span').html(),
                    link,
                };
                return single;
            }
        })
    );

    ctx.state.data = {
        title: '中国国家认证认可监管管理员会',
        link: 'http://www.cnca.gov.cn/',
        description: '最新通知',
        item: items,
    };
};
