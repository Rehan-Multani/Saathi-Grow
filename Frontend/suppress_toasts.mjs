import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function walkDir(dir, callback) {
    fs.readdirSync(dir).forEach(f => {
        let dirPath = path.join(dir, f);
        let isDirectory = fs.statSync(dirPath).isDirectory();
        isDirectory ? walkDir(dirPath, callback) : callback(path.join(dir, f));
    });
}

let count = 0;
const pagesPath = path.join(__dirname, 'src', 'modules', 'admin', 'pages');

walkDir(pagesPath, function(filePath) {
    if (filePath.endsWith('.jsx')) {
        let content = fs.readFileSync(filePath, 'utf8');
        
        // Match toast.error that contains 'load' or 'fetch' phrase
        let modified = content.replace(/(\s*)(toast\.error\([^;]*(?:load|fetch|loading)[^;]*\);?)/gi, '$1// $2');
        
        if (content !== modified) {
            fs.writeFileSync(filePath, modified, 'utf8');
            count++;
            console.log('Suppressed toast in:', path.basename(filePath));
        }
    }
});

console.log(`Successfully suppressed fetch/load toast errors in ${count} files.`);
