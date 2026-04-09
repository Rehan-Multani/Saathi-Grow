const fs = require('fs');
const path = require('path');

const enPath = path.join(__dirname, 'Frontend/src/i18n/locales/en.json');
const hiPath = path.join(__dirname, 'Frontend/src/i18n/locales/hi.json');

const en = JSON.parse(fs.readFileSync(enPath, 'utf8'));
const hi = JSON.parse(fs.readFileSync(hiPath, 'utf8'));

// Deep merge functionality
function deepMerge(target, source) {
    for (const key in source) {
        if (source[key] instanceof Object && key in target) {
            deepMerge(target[key], source[key]);
        } else if (!(key in target)) {
            target[key] = source[key]; // Copy missing keys
        }
    }
}

// Sync missing keys from en to hi
deepMerge(hi, en);

fs.writeFileSync(hiPath, JSON.stringify(hi, null, 2), 'utf8');
console.log('Successfully synced hi.json with en.json structure.');
