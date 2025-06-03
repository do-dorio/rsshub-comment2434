import { setConfig } from '../lib/config.js';
import { handle } from 'hono/vercel';
import app from '../lib/app.js';
import logger from '../lib/utils/logger.js';

// 実行時設定
setConfig({
    NO_LOGFILES: true,
});

// 起動ログ
logger.info(`🎉 RSSHub is running! Cheers!`);

// Honoアプリをエクスポート
export default handle(app);
