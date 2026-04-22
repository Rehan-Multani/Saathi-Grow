const puppeteer = require('puppeteer');

(async () => {
    try {
        const browser = await puppeteer.launch({ headless: true });
        const page = await browser.newPage();
        
        page.on('console', msg => console.log('PAGE LOG:', msg.text()));
        page.on('pageerror', error => console.error('PAGE ERROR:', error.message));
        page.on('requestfailed', request => {
            console.error('REQUEST FAILED:', request.url(), request.failure().errorText);
        });

        await page.goto('http://localhost:5173', { waitUntil: 'networkidle0', timeout: 10000 });
        console.log('Page loaded successfully.');
        await browser.close();
    } catch (e) {
        console.error('SCRIPT ERROR:', e.message);
    }
})();
