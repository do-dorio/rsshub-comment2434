import { describe, expect, it, vi } from 'vitest';
import Parser from 'rss-parser';

process.env.OPENAI_API_KEY = 'sk-1234567890';
process.env.OPENAI_API_ENDPOINT = 'https://api.openai.mock/v1';

vi.mock('../utils/request-rewriter', () => ({ default: null }));
const { config } = await import('../config/index.js');
const { default: app } = await import('../app');

const parser = new Parser();

describe('filter', () => {
    it(`filter`, async () => {
        const response = await app.request('/test/1?filter=Description4|Title5');
        const parsed = await parser.parseString(await response.text());
        expect(parsed.items.length).toBe(2);
        expect(parsed.items[0].title).toBe('Title4');
        expect(parsed.items[1].title).toBe('Title5');
    });

    it(`filter filter_case_sensitive default`, async () => {
        const response = await app.request('/test/1?filter=description4|title5');
        const parsed = await parser.parseString(await response.text());
        expect(parsed.items.length).toBe(0);
    });

    it(`filter filter_case_sensitive=false`, async () => {
        const response = await app.request('/test/1?filter=description4|title5&filter_case_sensitive=false');
        const parsed = await parser.parseString(await response.text());
        expect(parsed.items.length).toBe(2);
        expect(parsed.items[0].title).toBe('Title4');
        expect(parsed.items[1].title).toBe('Title5');
    });

    it(`filter_title`, async () => {
        const response = await app.request('/test/1?filter_title=Description4|Title5');
        const parsed = await parser.parseString(await response.text());
        expect(parsed.items.length).toBe(1);
        expect(parsed.items[0].title).toBe('Title5');
    });

    it(`filter_title filter_case_sensitive=false`, async () => {
        const response = await app.request('/test/1?filter_title=description4|title5&filter_case_sensitive=false');
        const parsed = await parser.parseString(await response.text());
        expect(parsed.items.length).toBe(1);
        expect(parsed.items[0].title).toBe('Title5');
    });

    it(`filter_description`, async () => {
        const response = await app.request('/test/1?filter_description=Description4|Title5');
        const parsed = await parser.parseString(await response.text());
        expect(parsed.items.length).toBe(1);
        expect(parsed.items[0].title).toBe('Title4');
    });

    it(`filter_description filter_case_sensitive=false`, async () => {
        const response = await app.request('/test/1?filter_description=description4|title5&filter_case_sensitive=false');
        const parsed = await parser.parseString(await response.text());
        expect(parsed.items.length).toBe(1);
        expect(parsed.items[0].title).toBe('Title4');
    });

    it(`filter_author`, async () => {
        const response = await app.request('/test/1?filter_author=DIYgod4|DIYgod5');
        const parsed = await parser.parseString(await response.text());
        expect(parsed.items.length).toBe(2);
        expect(parsed.items[0].title).toBe('Title4');
        expect(parsed.items[1].title).toBe('Title5');
    });

    it(`filter_author filter_case_sensitive default`, async () => {
        const response = await app.request('/test/1?filter_author=diygod4|diygod5');
        const parsed = await parser.parseString(await response.text());
        expect(parsed.items.length).toBe(0);
    });

    it(`filter_author filter_case_sensitive=false`, async () => {
        const response = await app.request('/test/1?filter_author=diygod4|diygod5&filter_case_sensitive=false');
        const parsed = await parser.parseString(await response.text());
        expect(parsed.items.length).toBe(2);
        expect(parsed.items[0].title).toBe('Title4');
        expect(parsed.items[1].title).toBe('Title5');
    });

    it(`filter_category`, async () => {
        const response = await app.request('/test/filter?filter_category=Category0|Category1');
        const parsed = await parser.parseString(await response.text());
        expect(parsed.items.length).toBe(2);
        expect(parsed.items[0].title).toBe('Filter Title1');
        expect(parsed.items[1].title).toBe('Filter Title2');
    });

    it(`filter_category filter_case_sensitive default`, async () => {
        const response = await app.request('/test/filter?filter_category=category0|category1');
        const parsed = await parser.parseString(await response.text());
        expect(parsed.items.length).toBe(0);
    });

    it(`filter_category filter_case_sensitive=false`, async () => {
        const response = await app.request('/test/filter?filter_category=category0|category1&filter_case_sensitive=false');
        const parsed = await parser.parseString(await response.text());
        expect(parsed.items.length).toBe(2);
        expect(parsed.items[0].title).toBe('Filter Title1');
        expect(parsed.items[1].title).toBe('Filter Title2');
    });

    it(`filter_category filter_case_sensitive=false category string`, async () => {
        const response = await app.request('/test/filter?filter_category=category3&filter_case_sensitive=false');
        const parsed = await parser.parseString(await response.text());
        expect(parsed.items.length).toBe(1);
        expect(parsed.items[0].title).toBe('Filter Title3');
    });

    it(`filter_category illegal_category`, async () => {
        const response = await app.request('/test/filter-illegal-category?filter_category=CategoryIllegal');
        const parsed = await parser.parseString(await response.text());
        expect(parsed.items.length).toBe(1);
        expect(parsed.items[0].categories?.length).toBe(1);
        expect(parsed.items[0].categories?.[0]).toBe('CategoryIllegal');
    });

    it(`filter_time`, async () => {
        const response = await app.request('/test/current_time?filter_time=25');
        const parsed = await parser.parseString(await response.text());
        expect(parsed.items.length).toBe(2);
        expect(parsed.items[0].title).toBe('Title1');
        expect(parsed.items[1].title).toBe('Title2');
    });

    it(`filterout`, async () => {
        const response = await app.request('/test/1?filterout=Description4|Title5');
        const parsed = await parser.parseString(await response.text());
        expect(parsed.items.length).toBe(3);
        expect(parsed.items[0].title).toBe('Title1');
        expect(parsed.items[1].title).toBe('Title2');
        expect(parsed.items[2].title).toBe('Title3');
    });

    it(`filterout filter_case_sensitive default`, async () => {
        const response = await app.request('/test/1?filterout=description4|title5');
        const parsed = await parser.parseString(await response.text());
        expect(parsed.items.length).toBe(5);
        expect(parsed.items[0].title).toBe('Title1');
        expect(parsed.items[1].title).toBe('Title2');
        expect(parsed.items[2].title).toBe('Title3');
    });

    it(`filterout filter_case_sensitive=false`, async () => {
        const response = await app.request('/test/1?filterout=description4|title5&filter_case_sensitive=false');
        const parsed = await parser.parseString(await response.text());
        expect(parsed.items.length).toBe(3);
        expect(parsed.items[0].title).toBe('Title1');
        expect(parsed.items[1].title).toBe('Title2');
        expect(parsed.items[2].title).toBe('Title3');
    });

    it(`filterout_title`, async () => {
        const response = await app.request('/test/1?filterout_title=Description4|Title5');
        const parsed = await parser.parseString(await response.text());
        expect(parsed.items.length).toBe(4);
        expect(parsed.items[0].title).toBe('Title1');
        expect(parsed.items[1].title).toBe('Title2');
        expect(parsed.items[2].title).toBe('Title3');
        expect(parsed.items[3].title).toBe('Title4');
    });

    it(`filterout_title filter_case_sensitive=false`, async () => {
        const response = await app.request('/test/1?filterout_title=description4|title5&filter_case_sensitive=false');
        const parsed = await parser.parseString(await response.text());
        expect(parsed.items.length).toBe(4);
        expect(parsed.items[0].title).toBe('Title1');
        expect(parsed.items[1].title).toBe('Title2');
        expect(parsed.items[2].title).toBe('Title3');
        expect(parsed.items[3].title).toBe('Title4');
    });

    it(`filterout_description`, async () => {
        const response = await app.request('/test/1?filterout_description=Description4|Title5');
        const parsed = await parser.parseString(await response.text());
        expect(parsed.items.length).toBe(4);
        expect(parsed.items[0].title).toBe('Title1');
        expect(parsed.items[1].title).toBe('Title2');
        expect(parsed.items[2].title).toBe('Title3');
        expect(parsed.items[3].title).toBe('Title5');
    });

    it(`filterout_description filter_case_sensitive=false`, async () => {
        const response = await app.request('/test/1?filterout_description=description4|title5&filter_case_sensitive=false');
        const parsed = await parser.parseString(await response.text());
        expect(parsed.items.length).toBe(4);
        expect(parsed.items[0].title).toBe('Title1');
        expect(parsed.items[1].title).toBe('Title2');
        expect(parsed.items[2].title).toBe('Title3');
        expect(parsed.items[3].title).toBe('Title5');
    });

    it(`filterout_author`, async () => {
        const response = await app.request('/test/1?filterout_author=DIYgod4|DIYgod5');
        const parsed = await parser.parseString(await response.text());
        expect(parsed.items.length).toBe(3);
        expect(parsed.items[0].title).toBe('Title1');
        expect(parsed.items[1].title).toBe('Title2');
        expect(parsed.items[2].title).toBe('Title3');
    });

    it(`filterout_author filter_case_sensitive default`, async () => {
        const response = await app.request('/test/1?filterout_author=diygod4|diygod5');
        const parsed = await parser.parseString(await response.text());
        expect(parsed.items.length).toBe(5);
        expect(parsed.items[0].title).toBe('Title1');
        expect(parsed.items[1].title).toBe('Title2');
        expect(parsed.items[2].title).toBe('Title3');
    });

    it(`filterout_author filter_case_sensitive=false`, async () => {
        const response = await app.request('/test/1?filterout_author=diygod4|diygod5&filter_case_sensitive=false');
        const parsed = await parser.parseString(await response.text());
        expect(parsed.items.length).toBe(3);
        expect(parsed.items[0].title).toBe('Title1');
        expect(parsed.items[1].title).toBe('Title2');
        expect(parsed.items[2].title).toBe('Title3');
    });

    it(`filterout_category`, async () => {
        const response = await app.request('/test/filter?filterout_category=Category0|Category1');
        const parsed = await parser.parseString(await response.text());
        expect(parsed.items.length).toBe(6);
        expect(parsed.items[0].title).toBe('Filter Title3');
        expect(parsed.items[1].title).toBe('Title1');
        expect(parsed.items[2].title).toBe('Title2');
    });

    it(`filterout_category filter_case_sensitive default`, async () => {
        const response = await app.request('/test/filter?filterout_category=category0|category1');
        const parsed = await parser.parseString(await response.text());
        expect(parsed.items.length).toBe(8);
        expect(parsed.items[0].title).toBe('Filter Title1');
        expect(parsed.items[1].title).toBe('Filter Title2');
        expect(parsed.items[2].title).toBe('Filter Title3');
        expect(parsed.items[3].title).toBe('Title1');
    });

    it(`filterout_category filter_case_sensitive=false`, async () => {
        const response = await app.request('/test/filter?filterout_category=category0|category1&filter_case_sensitive=false');
        const parsed = await parser.parseString(await response.text());
        expect(parsed.items.length).toBe(6);
        expect(parsed.items[0].title).toBe('Filter Title3');
        expect(parsed.items[1].title).toBe('Title1');
        expect(parsed.items[2].title).toBe('Title2');
    });

    it(`filter combination`, async () => {
        const response = await app.request('/test/filter?filter_title=Filter&filter_description=Description1');
        const parsed = await parser.parseString(await response.text());
        expect(parsed.items.length).toBe(1);
        expect(parsed.items[0].title).toBe('Filter Title1');
    });

    it(`filterout combination`, async () => {
        const response = await app.request('/test/filter?filterout_title=Filter&filterout_description=Description1');
        const parsed = await parser.parseString(await response.text());
        expect(parsed.items.length).toBe(4);
        expect(parsed.items[0].title).toBe('Title2');
    });
});

describe('limit', () => {
    it(`limit`, async () => {
        const response = await app.request('/test/1?limit=3');
        const parsed = await parser.parseString(await response.text());
        expect(parsed.items.length).toBe(3);
        expect(parsed.items[0].title).toBe('Title1');
        expect(parsed.items[1].title).toBe('Title2');
        expect(parsed.items[2].title).toBe('Title3');
    });
});

describe('sorted', () => {
    it('sorted', async () => {
        const response = await app.request('/test/sort?sorted=false');
        expect(response.status).toBe(200);
        const parsed = await parser.parseString(await response.text());
        expect(parsed.items[0].title).toBe('Sort Title 0');
        expect(parsed.items[1].title).toBe('Sort Title 1');
        expect(parsed.items[2].title).toBe('Sort Title 2');
        expect(parsed.items[3].title).toBe('Sort Title 3');
    });
});

describe('tgiv', () => {
    it(`tgiv`, async () => {
        const response = await app.request('/test/1?tgiv=test');
        const parsed = await parser.parseString(await response.text());
        expect(parsed.items[0].link).toBe(`https://t.me/iv?url=https%3A%2F%2Fgithub.com%2FDIYgod%2FRSSHub%2Fissues%2F1&rhash=test`);
        expect(parsed.items[1].link).toBe(`https://t.me/iv?url=https%3A%2F%2Fgithub.com%2FDIYgod%2FRSSHub%2Fissues%2F2&rhash=test`);
    });
});

describe('empty', () => {
    it(`empty`, async () => {
        const response1 = await app.request('/test/empty');
        expect(response1.status).toBe(503);
        expect(await response1.text()).toMatch(/Error: this route is empty/);

        const response2 = await app.request('/test/1?limit=0');
        expect(response2.status).toBe(200);
        const parsed = await parser.parseString(await response2.text());
        expect(parsed.items.length).toBe(0);
    });
});

describe('allow_empty', () => {
    it(`allow_empty`, async () => {
        const response = await app.request('/test/allow_empty');
        expect(response.status).toBe(200);
        const parsed = await parser.parseString(await response.text());
        expect(parsed.items.length).toBe(0);
    });
});

describe('wrong_path', () => {
    it(`wrong_path`, async () => {
        const response = await app.request('/wrong');
        expect(response.status).toBe(404);
        expect(response.headers.get('cache-control')).toBe(`public, max-age=${config.cache.routeExpire}`);
        expect(await response.text()).toMatch('The route does not exist or has been deleted.');
    });
});

describe('fulltext_mode', () => {
    it(`fulltext`, async () => {
        const response = await app.request('/test/1?mode=fulltext');
        expect(response.status).toBe(200);
        const parsed = await parser.parseString(await response.text());
        expect(parsed.items[0].content).not.toBe(undefined);
    }, 60000);
});

describe('complicated_description', () => {
    it(`complicated_description`, async () => {
        const response = await app.request('/test/complicated');
        expect(response.status).toBe(200);
        const parsed = await parser.parseString(await response.text());
        expect(parsed.items[0].content).toBe(`<a href="https://mock.com/DIYgod/RSSHub"></a>
<img src="https://mock.com/DIYgod/RSSHub.jpg" referrerpolicy="no-referrer">

<a href="http://mock.com/DIYgod/RSSHub"></a>
<img src="https://mock.com/DIYgod/RSSHub.jpg" data-src="/DIYgod/RSSHub0.jpg" referrerpolicy="no-referrer">
<img data-src="/DIYgod/RSSHub.jpg" src="https://mock.com/DIYgod/RSSHub.jpg" referrerpolicy="no-referrer">
<img data-mock="/DIYgod/RSSHub.png" src="https://mock.com/DIYgod/RSSHub.png" referrerpolicy="no-referrer">
<img mock="/DIYgod/RSSHub.gif" src="https://mock.com/DIYgod/RSSHub.gif" referrerpolicy="no-referrer">
<img src="http://mock.com/DIYgod/DIYgod/RSSHub" referrerpolicy="no-referrer">
<img src="https://mock.com/DIYgod/RSSHub.jpg" referrerpolicy="no-referrer">
<img src="data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==" referrerpolicy="no-referrer">`);
        expect(parsed.items[1].content).toBe(`<a href="https://mock.com/DIYgod/RSSHub"></a>
<img src="https://mock.com/DIYgod/RSSHub.jpg" referrerpolicy="no-referrer">`);
    });
});

describe('multimedia_description', () => {
    it(`multimedia_description`, async () => {
        const response = await app.request('/test/multimedia');
        expect(response.status).toBe(200);
        const parsed = await parser.parseString(await response.text());
        expect(parsed.items[0].content).toBe(`<img src="https://mock.com/DIYgod/RSSHub.jpg" referrerpolicy="no-referrer">
<video src="https://mock.com/DIYgod/RSSHub.mp4"></video>
<video poster="https://mock.com/DIYgod/RSSHub.jpg">
<source src="https://mock.com/DIYgod/RSSHub.mp4" type="video/mp4">
<source src="https://mock.com/DIYgod/RSSHub.webm" type="video/webm">
</video>
<audio src="https://mock.com/DIYgod/RSSHub.mp3"></audio>
<iframe src="https://mock.com/DIYgod/RSSHub.html" referrerpolicy="no-referrer"></iframe>`);
    });
});

describe('sort', () => {
    it(`sort`, async () => {
        const response = await app.request('/test/sort');
        expect(response.status).toBe(200);
        const parsed = await parser.parseString(await response.text());
        expect(parsed.items[0].title).toBe('Sort Title 3');
        expect(parsed.items.at(-3)?.title).toBe('Sort Title 2');
        expect(parsed.items.at(-2)?.title).toBe('Sort Title 0');
        expect(parsed.items.at(-1)?.title).toBe('Sort Title 1');
    });
});

describe('mess parameter', () => {
    it(`date`, async () => {
        const response = await app.request('/test/mess');
        expect(response.status).toBe(200);
        const parsed = await parser.parseString(await response.text());
        expect(parsed.items[0].pubDate).toBe('Mon, 31 Dec 2018 16:00:00 GMT');
        expect(parsed.items[0].link).toBe('https://github.com/DIYgod/RSSHub/issues/0');
    });
});

describe('opencc', () => {
    it(`opencc`, async () => {
        const response = await app.request('/test/opencc?opencc=t2s');
        const parsed = await parser.parseString(await response.text());
        expect(parsed.items[0].title).toBe('小可爱');
        expect(parsed.items[0].content).toBe('宇宙无敌');
    });
});

describe('brief', () => {
    it(`brief`, async () => {
        const response = await app.request('/test/brief?brief=100');
        const parsed = await parser.parseString(await response.text());
        expect(parsed.items[0].title).toBe('小可愛');
        expect(parsed.items[0].content).toBe(
            '<p>宇宙無敵宇宙無敵宇宙無敵宇宙無敵宇宙無敵宇宙無敵宇宙無敵宇宙無敵宇宙無敵宇宙無敵宇宙無敵宇宙無敵宇宙無敵宇宙無敵宇宙無敵宇宙無敵宇宙無敵宇宙無敵宇宙無敵宇宙無敵宇宙無敵宇宙無敵宇宙無敵宇宙無敵宇宙無敵…</p>'
        );
    });
});

describe('multi parameter', () => {
    it(`filter before limit`, async () => {
        const response = await app.request('/test/filter-limit?filterout_title=2&limit=2');
        const parsed = await parser.parseString(await response.text());
        expect(parsed.items.length).toBe(2);
        expect(parsed.items[0].title).toBe('Title1');
        expect(parsed.items[1].title).toBe('Title3');
    });
});

describe('openai', () => {
    it('processes both title and description', async () => {
        config.openai.inputOption = 'both';
        const responseWithGpt = await app.request('/test/gpt?chatgpt=true');
        const responseNormal = await app.request('/test/gpt');

        expect(responseWithGpt.status).toBe(200);
        expect(responseNormal.status).toBe(200);

        const parsedGpt = await parser.parseString(await responseWithGpt.text());
        const parsedNormal = await parser.parseString(await responseNormal.text());

        expect(parsedGpt.items[0].title).not.toBe(parsedNormal.items[0].title);
        expect(parsedGpt.items[0].title).toContain('AI processed content.');
        expect(parsedGpt.items[0].content).not.toBe(parsedNormal.items[0].content);
        expect(parsedGpt.items[0].content).toContain('AI processed content.');
    });

    it('processes title or description', async () => {
        // test title
        config.openai.inputOption = 'title';
        const responseTitleOnly = await app.request('/test/gpt?chatgpt=true');
        const parsedTitleOnly = await parser.parseString(await responseTitleOnly.text());
        expect(parsedTitleOnly.items[0].title).toContain('AI processed content.');
        expect(parsedTitleOnly.items[0].content).not.toContain('AI processed content.');

        // test description
        config.openai.inputOption = 'description';
        const responseDescriptionOnly = await app.request('/test/gpt?chatgpt=true');
        const parsedDescriptionOnly = await parser.parseString(await responseDescriptionOnly.text());
        expect(parsedDescriptionOnly.items[0].title).not.toContain('AI processed content.');
        expect(parsedDescriptionOnly.items[0].content).toContain('AI processed content.');
    });
});
