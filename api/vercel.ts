import moduleAlias from 'module-alias';
import { setConfig } from '../lib/config';
import { handle } from 'hono/vercel';
import app from '../lib/app';
import logger from '../lib/utils/logger';

// ルートエイリアス @ を lib に設定（Vercelでも動作）
moduleAlias.addAlias('@', new URL('../lib', import.meta.url).pathname);

// 実行時設定
setConfig({
    NO_LOGFILES: true,
});

// 起動ログ
logger.info(`🎉 RSSHub is running! Cheers!`);

// Honoアプリをエクスポート
export default handle(app);
