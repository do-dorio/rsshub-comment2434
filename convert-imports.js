// convert-imports.js
import fs from 'node:fs';
import path from 'node:path';

function convertLine(line) {
    if (line.includes('../config/index.js')) {
        return line.replace(/(['"])#\/config\1/, '$1../config/index.js$1');
    }
    return line.replaceAll(/(['"])#\//g, '$1../');
}

function processFile(filePath) {
    const content = fs.readFileSync(filePath, 'utf8');
    const newContent = content.split('\n').map(convertLine).join('\n');
    if (newContent !== content) {
        fs.writeFileSync(filePath, newContent);
    }
}

function walk(dir) {
    for (const entry of fs.readdirSync(dir)) {
        const fullPath = path.join(dir, entry);
        if (fs.statSync(fullPath).isDirectory()) {
            walk(fullPath);
        } else if (/\.(js|ts|mjs)$/.test(fullPath)) {
            processFile(fullPath);
        }
    }
}

// 実行ディレクトリを起点に走査
walk('./');
