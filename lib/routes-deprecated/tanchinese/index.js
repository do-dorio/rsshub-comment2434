const got = require('../utils/got');
const cheerio = require('cheerio');
const timezone = require('../utils/timezone');
const { parseDate } = require('../utils/parse-date');

module.exports = async (ctx) => {
    const category = ctx.params.category || '';

    const rootUrl = 'http://www.tanchinese.com';
    const currentUrl = `${rootUrl}${category ? `/archives/${category}` : ''}`;

    const response = await got({
        method: 'get',
        url: currentUrl,
    });

    const $ = cheerio.load(response.data);

    const list = $('.archive-grid-caption .h2')
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

                item.description = content('.article-content').html();
                item.pubDate = timezone(parseDate(content('#page-content .row .col-xs-12 small').eq(0).text(), 'MMM DD, YYYY'), +8);

                return item;
            })
        )
    );

    ctx.state.data = {
        title: $('title').text(),
        link: currentUrl,
        item: items,
        description: $('meta[name="description"]').attr('content'),
    };
};
