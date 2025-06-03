// replace-imports.mjs
import { promises as fs } from 'node:fs';
import path from 'node:path';

const targetDir = './lib'; // 変換対象のルートディレクトリ
const targetExtensions = ['.ts', '.tsx', '.js', '.jsx'];

async function replaceImportsInFile(filePath) {
    let content = await fs.readFile(filePath, 'utf8');
    const original = content;

    // "@/ を "#/" に変換（ダブル/シングルクォート両対応）
    content = content.replace(/(["'])@\/(.*?)\1/g, (_, quote, pathPart) => {
        return `${quote}#/${pathPart}${quote}`;
    });

    if (content !== original) {
        await fs.writeFile(filePath, content, 'utf8');
        console.log(`✔ Replaced in: ${filePath}`);
    }
}

async function walk(dir) {
    const entries = await fs.readdir(dir, { withFileTypes: true });
    for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);
        if (entry.isDirectory()) {
            await walk(fullPath);
        } else if (targetExtensions.includes(path.extname(entry.name))) {
            await replaceImportsInFile(fullPath);
        }
    }
}

await walk(targetDir);
console.log('✅ Done replacing "@/..." → "#/..."');