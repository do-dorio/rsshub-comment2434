import { Route } from '@/types';
import got from '@/utils/got';
import * as cheerio from 'cheerio';
import { parseDate } from '@/utils/parse-date';

console.log('✅ comment2434 route loaded');

export const handler = async (ctx) => {

	console.log(ctx);
    const keyword = ctx.params.keyword;
    console.log('[handler] keyword =', keyword);

    const url = `https://comment2434.com/...keyword=${encodeURIComponent(keyword)}`;
    console.log('[handler] fetch URL =', url);

    const res = await fetch(url);
    console.log('[handler] status =', res.status);

    const html = await res.text();
    console.log('[handler] html length =', html.length);

    // parseしてitems配列があるなら…
    const items = parse(html);
    console.log('[handler] items.length =', items.length);

    return {
        title: `comment2434: ${keyword}`,
        item: items,
    };
};

export const route: Route = {
    path: '/:keyword',
    categories: ['community'],
    example: '/comment2434/猫',
    parameters: {
        keyword: '検索キーワード（例：「猫」や「ゲーム」など）',
    },
    name: 'Comment2434',
    url: 'comment2434.com',
    maintainers: ['yourGitHubUsername'],
    handler,
};