import { describe, expect, it, vi, afterEach } from 'vitest';
import Parser from 'rss-parser';
import wait from '../utils/wait';

process.env.CACHE_EXPIRE = '1';
process.env.CACHE_CONTENT_EXPIRE = '2';

const parser = new Parser();

afterEach(() => {
    vi.resetModules();
});

const noCacheTestFunc = async () => {
    const app = (await import('../app')).default;

    const response1 = await app.request('/test/cache');
    const response2 = await app.request('/test/cache');

    const parsed1 = await parser.parseString(await response1.text());
    const parsed2 = await parser.parseString(await response2.text());

    expect(response2.status).toBe(200);
    expect(response2.headers).not.toHaveProperty('rsshub-cache-status');

    expect(parsed1.items[0].content).toBe('Cache1');
    expect(parsed2.items[0].content).toBe('Cache2');

    expect(parsed1.ttl).toEqual('1');
};

describe('cache', () => {
    it('memory', async () => {
        process.env.CACHE_TYPE = 'memory';
        const app = (await import('../app')).default;

        const response1 = await app.request('/test/cache');
        const response2 = await app.request('/test/cache');

        const parsed1 = await parser.parseString(await response1.text());
        const parsed2 = await parser.parseString(await response2.text());

        delete parsed1.lastBuildDate;
        delete parsed2.lastBuildDate;
        delete parsed1.feedUrl;
        delete parsed2.feedUrl;
        delete parsed1.paginationLinks;
        delete parsed2.paginationLinks;
        expect(parsed2).toMatchObject(parsed1);

        expect(response2.status).toBe(200);
        expect(response2.headers.get('rsshub-cache-status')).toBe('HIT');

        expect(parsed1.ttl).toEqual('1');

        await wait(1 * 1000 + 100);
        const response3 = await app.request('/test/cache');
        expect(response3.headers).not.toHaveProperty('rsshub-cache-status');
        const parsed3 = await parser.parseString(await response3.text());

        await wait(2 * 1000 + 100);
        const response4 = await app.request('/test/cache');
        const parsed4 = await parser.parseString(await response4.text());

        expect(parsed1.items[0].content).toBe('Cache1');
        expect(parsed2.items[0].content).toBe('Cache1');
        expect(parsed3.items[0].content).toBe('Cache1');
        expect(parsed4.items[0].content).toBe('Cache2');

        await app.request('/test/refreshCache');
        await wait(1 * 1000 + 100);
        const response5 = await app.request('/test/refreshCache');
        const parsed5 = await parser.parseString(await response5.text());
        await wait(1 * 1000 + 100);
        const response6 = await app.request('/test/refreshCache');
        const parsed6 = await parser.parseString(await response6.text());

        expect(parsed5.items[0].content).toBe('1 1');
        expect(parsed6.items[0].content).toBe('1 0');
    }, 10000);

    it('redis', async () => {
        process.env.CACHE_TYPE = 'redis';
        const app = (await import('../app')).default;

        await wait(500);
        const response1 = await app.request('/test/cache');
        const response2 = await app.request('/test/cache');

        const parsed1 = await parser.parseString(await response1.text());
        const parsed2 = await parser.parseString(await response2.text());

        delete parsed1.lastBuildDate;
        delete parsed2.lastBuildDate;
        delete parsed1.feedUrl;
        delete parsed2.feedUrl;
        delete parsed1.paginationLinks;
        delete parsed2.paginationLinks;
        expect(parsed2).toMatchObject(parsed1);

        expect(response2.status).toBe(200);
        expect(response2.headers.get('rsshub-cache-status')).toBe('HIT');

        expect(parsed1.ttl).toEqual('1');

        await wait(1 * 1000 + 100);
        const response3 = await app.request('/test/cache');
        expect(response3.headers).not.toHaveProperty('rsshub-cache-status');
        const parsed3 = await parser.parseString(await response3.text());

        await wait(2 * 1000 + 100);
        const response4 = await app.request('/test/cache');
        const parsed4 = await parser.parseString(await response4.text());

        expect(parsed1.items[0].content).toBe('Cache1');
        expect(parsed2.items[0].content).toBe('Cache1');
        expect(parsed3.items[0].content).toBe('Cache1');
        expect(parsed4.items[0].content).toBe('Cache2');

        await app.request('/test/refreshCache');
        await wait(1 * 1000 + 100);
        const response5 = await app.request('/test/refreshCache');
        const parsed5 = await parser.parseString(await response5.text());
        await wait(1 * 1000 + 100);
        const response6 = await app.request('/test/refreshCache');
        const parsed6 = await parser.parseString(await response6.text());

        expect(parsed5.items[0].content).toBe('1 1');
        expect(parsed6.items[0].content).toBe('1 0');

        const cache = (await import('../utils/cache')).default;
        await cache.clients.redisClient!.quit();
    }, 10000);

    it('redis with quit', async () => {
        process.env.CACHE_TYPE = 'redis';
        const cache = (await import('../utils/cache')).default;
        await cache.clients.redisClient!.quit();
        await noCacheTestFunc();
    });

    it('redis with error', async () => {
        process.env.CACHE_TYPE = 'redis';
        process.env.REDIS_URL = 'redis://wrongpath:6379';
        await noCacheTestFunc();
        const cache = (await import('../utils/cache')).default;
        await cache.clients.redisClient!.quit();
    });

    it('no cache', async () => {
        process.env.CACHE_TYPE = 'NO';
        await noCacheTestFunc();
    });

    it('no cache (empty string)', async () => {
        process.env.CACHE_TYPE = '';
        await noCacheTestFunc();
    });

    it('throws URL key', async () => {
        process.env.CACHE_TYPE = 'memory';
        const app = (await import('../app')).default;

        try {
            const response = await app.request('/test/cacheUrlKey');
            expect(response).toThrow(Error);
        } catch (error: any) {
            expect(error.message).toContain('Cache key must be a string');
        }
    });

    it('RSS TTL (no cache)', async () => {
        process.env.CACHE_TYPE = '';
        process.env.CACHE_EXPIRE = '600';
        const app = (await import('../app')).default;
        const response = await app.request('/test/cache');
        const parsed = await parser.parseString(await response.text());
        expect(parsed.ttl).toEqual('1');
    });

    it('RSS TTL (w/ cache)', async () => {
        process.env.CACHE_TYPE = 'memory';
        process.env.CACHE_EXPIRE = '600';
        const app = (await import('../app')).default;
        const response = await app.request('/test/cache');
        const parsed = await parser.parseString(await response.text());
        expect(parsed.ttl).toEqual('10');
    });
});
