console.log(`aaa`);
async function handler(ctx) {
    const keyword = ctx.req.param('keyword');
    console.log(`🔍 keyword = ${keyword}`);

    const url = `https://comment2434.com/comment/?keyword=${encodeURIComponent(keyword)}&type=0&mode=0&sort_mode=0`;
    const response = await got(url);
    const $ = cheerio.load(response.data);

    const items = $('#result .row').toArray().map((elem) => {
        const $elem = cheerio.load(elem);
        return {
            title: $elem('h5').text().trim(),
            description: $elem('p').eq(1).text().trim(),
            pubDate: parseDate($elem('p').eq(2).text().trim()),
            link: new URL($elem('a').attr('href'), 'https://comment2434.com').href,
        };
    });

	if (items.length === 0) {
	
		console.log(`✅ items found: ${items.length}`);
	
	}

	return {
		title: `comment2434 - ${keyword}`,
		link: url,
		item: items,
	};

}

export const route: Route = {
    path: '/comment2434/:keyword',
    name: 'Comment2434',
    url: 'https://comment2434.com',
    maintainers: ['yourGitHubUsername'],
    example: '/comment2434/猫',
    parameters: {
        keyword: '検索キーワード',
    },
    handler,
};