const fs = require('fs');
const path = require('path');

function deepMerge(target, source) {
    for (const key in source) {
        if (source[key] instanceof Object && key in target && !Array.isArray(source[key])) {
            deepMerge(target[key], source[key]);
        } else {
            target[key] = source[key];
        }
    }
    return target;
}

function repairJsonFile(filePath) {
    console.log(`Repairing ${filePath}...`);
    let content = fs.readFileSync(filePath, 'utf8').trim();
    
    // Check for multiple root objects: { ... } { ... }
    // A simple way to detect this is if we have multiple top-level objects
    // Or if JSON.parse fails and we can try to find blocks
    
    let finalObj = {};
    
    try {
        // Try parsing directly first
        finalObj = JSON.parse(content);
        console.log(`Direct parse successful for ${filePath}`);
    } catch (e) {
        console.warn(`JSON.parse failed for ${filePath}, attempting block recovery...`);
        // Find all top-level objects using a stack-based approach
        let depth = 0;
        let start = -1;
        let objects = [];
        
        for (let i = 0; i < content.length; i++) {
            if (content[i] === '{') {
                if (depth === 0) start = i;
                depth++;
            } else if (content[i] === '}') {
                depth--;
                if (depth === 0 && start !== -1) {
                    objects.push(content.substring(start, i + 1));
                    start = -1;
                }
            }
        }
        
        console.log(`Found ${objects.length} chunks in ${filePath}`);
        
        for (const objStr of objects) {
            try {
                const parsed = JSON.parse(objStr);
                finalObj = deepMerge(finalObj, parsed);
            } catch (err) {
                console.error(`Failed to parse a chunk in ${filePath}:`, err.message);
            }
        }
    }
    
    // Ensure the structure is correct
    // (Optional: perform specific fixes for stock module if needed)
    
    fs.writeFileSync(filePath, JSON.stringify(finalObj, null, 2), 'utf8');
    console.log(`Successfully repaired and unified ${filePath}`);
}

const enPath = path.join(__dirname, 'Frontend/src/i18n/locales/en.json');
const hiPath = path.join(__dirname, 'Frontend/src/i18n/locales/hi.json');

repairJsonFile(enPath);
repairJsonFile(hiPath);

console.log('Final Validation:');
try {
    const en = JSON.parse(fs.readFileSync(enPath, 'utf8'));
    console.log('EN stock.add_adjustment.table keys:', en.stock?.add_adjustment?.table ? Object.keys(en.stock.add_adjustment.table) : 'NOT FOUND');
} catch (e) { console.error('EN still invalid'); }

try {
    const hi = JSON.parse(fs.readFileSync(hiPath, 'utf8'));
    console.log('HI stock.add_adjustment.table keys:', hi.stock?.add_adjustment?.table ? Object.keys(hi.stock.add_adjustment.table) : 'NOT FOUND');
} catch (e) { console.error('HI still invalid'); }
