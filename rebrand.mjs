import fs from 'fs';
import path from 'path';

function walkSync(currentDirPath, callback) {
    fs.readdirSync(currentDirPath).forEach(function (name) {
        var filePath = path.join(currentDirPath, name);
        if (filePath.includes('node_modules') || filePath.includes('.git') || filePath.includes('.svelte-kit')) {
            return;
        }
        var stat = fs.statSync(filePath);
        if (stat.isFile()) {
            callback(filePath, stat);
        } else if (stat.isDirectory()) {
            walkSync(filePath, callback);
        }
    });
}

const dir = 'c:/Users/tomih/.gemini/antigravity/ChillChess/ChillChess/src';
let changes = 0;

walkSync(dir, (filePath) => {
    if (!filePath.endsWith('.svelte') && !filePath.endsWith('.ts') && !filePath.endsWith('.html')) return;

    let content = fs.readFileSync(filePath, 'utf-8');
    let original = content;

    // Replace 'MultiTool' with 'ChillChess'
    content = content.replace(/MultiTool/g, 'ChillChess');

    // Replace 'multitool' with 'chillchess'
    content = content.replace(/multitool/g, 'chillchess');

    if (content !== original) {
        fs.writeFileSync(filePath, content, 'utf-8');
        console.log(`Updated ${filePath}`);
        changes++;
    }
});

console.log(`Total files changed: ${changes}`);
