import http from 'node:http';
import https from 'node:https';
import logger from '#/utils/logger';
import { config } from '#/config';
import proxy from '#/utils/proxy';

type Get = typeof http.get | typeof https.get | typeof http.request | typeof https.request;

interface ExtendedRequestOptions extends http.RequestOptions {
    href?: string;
    search?: string;
    query?: string;
    headers?: http.OutgoingHttpHeaders | readonly string[];
}

const getWrappedGet = <T extends Get>(origin: T): T => function (this: any, ...args: Parameters<T>): ReturnType<T> {
        let url: URL | null;
        let options: ExtendedRequestOptions = {};
        let callback: ((res: http.IncomingMessage) => void) | undefined;

        if (typeof args[0] === 'string' || args[0] instanceof URL) {
            url = new URL(args[0]);
            if (typeof args[1] === 'object' && !Array.isArray(args[1])) {
                options = args[1] as ExtendedRequestOptions;
                callback = args[2];
            } else if (typeof args[1] === 'function') {
                callback = args[1];
            }
        } else {
            options = args[0] as ExtendedRequestOptions;
            try {
                url = new URL(options.href || String(`${options.protocol || 'http:'}//${options.hostname || options.host}${options.path || ''}` + (options.search || (options.query ? `?${options.query}` : ''))));
            } catch {
                url = null;
            }
            if (typeof args[1] === 'function') {
                callback = args[1];
            }
        }

        if (!url) {
            return Reflect.apply(origin, this, args) as ReturnType<T>;
        }

        logger.debug(`Outgoing request: ${options.method || 'GET'} ${url}`);

        options.headers = options.headers || {};
        const headers = options.headers as http.OutgoingHttpHeaders;
        const headersLowerCaseKeys = new Set(Object.keys(headers).map((key) => key.toLowerCase()));

        if (!headersLowerCaseKeys.has('user-agent')) {
            headers['user-agent'] = config.ua;
        }

        if (!headersLowerCaseKeys.has('accept')) {
            headers.accept = '*/*';
        }

        if (!headersLowerCaseKeys.has('referer')) {
            headers.referer = url.origin;
        }

        if (!options.agent && proxy.agent) {
            const proxyRegex = new RegExp(proxy.proxyObj.url_regex);

            if (
                proxyRegex.test(url.toString()) &&
                url.protocol.startsWith('http') &&
                url.host !== proxy.proxyUrlHandler?.host &&
                url.host !== 'localhost' &&
                !url.host.startsWith('127.') &&
                !(config.puppeteerWSEndpoint?.includes(url.host) ?? false)
            ) {
                options.agent = proxy.agent;
            }
        }

        return Reflect.apply(origin, this, [url, options, callback]) as ReturnType<T>;
    } as unknown as T;

export default getWrappedGet;
