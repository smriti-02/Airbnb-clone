const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

const SHOTS_DIR = path.join(__dirname, 'screenshots');
if (!fs.existsSync(SHOTS_DIR)) fs.mkdirSync(SHOTS_DIR);

(async () => {
    console.log('Launching browser...');
    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();
    // Set a large viewport for screenshots
    await page.setViewport({ width: 1280, height: 800 });

    try {
        console.log('Navigating to Home...');
        await page.goto('http://localhost:3000', { waitUntil: 'networkidle0' });
        await page.screenshot({ path: path.join(SHOTS_DIR, '01_home.png') });
        console.log('Home loaded. Screenshot taken.');

        // 1. Search
        console.log('Starting search test...');
        try {
            // We need to look for something that opens the search bar. We don't have locators, so let's try some common texts.
            const searchTexts = ['Anywhere', 'Any week', 'Add guests', 'Search'];
            let searchClicked = false;
            for (let text of searchTexts) {
                try {
                    const [el] = await page.$x(`//*[contains(text(), '${text}')]`);
                    if (el) {
                        await el.click();
                        searchClicked = true;
                        break;
                    }
                } catch (e) {}
            }
            if (searchClicked) {
                // wait a bit for animation
                await new Promise(r => setTimeout(r, 1000));
                await page.screenshot({ path: path.join(SHOTS_DIR, '02_search_open.png') });
            }
        } catch (e) {
            console.error('Search flow failed:', e.message);
        }

        // 2. Filters
        console.log('Starting filters & categories test...');
        try {
            const [filtersBtn] = await page.$x(`//*[contains(text(), 'Filters')]`);
            if (filtersBtn) {
                await filtersBtn.click();
                await new Promise(r => setTimeout(r, 1000));
                await page.screenshot({ path: path.join(SHOTS_DIR, '03_filters_open.png') });
                
                // try to close it if there's a close button
                const closeBtns = await page.$$('button');
                for (let btn of closeBtns) {
                    const text = await page.evaluate(el => el.textContent, btn);
                    if (text && (text.includes('Close') || text.includes('X'))) {
                        await btn.click();
                        break;
                    }
                }
            }
        } catch (e) {
            console.error('Filters flow failed:', e.message);
        }

        // 3. Open Listing
        console.log('Starting listing open test...');
        try {
            // Click the first listing card. We look for a link that has an href starting with /listing/
            const firstListing = await page.$('a[href^="/listing/"]');
            if (firstListing) {
                await Promise.all([
                    page.waitForNavigation({ waitUntil: 'networkidle0' }),
                    firstListing.click()
                ]);
                await page.screenshot({ path: path.join(SHOTS_DIR, '04_listing_detail.png') });
            } else {
                console.log('No listing link found.');
            }
        } catch (e) {
            console.error('Listing open flow failed:', e.message);
        }

    } catch (e) {
        console.error('Unexpected error:', e);
    } finally {
        await browser.close();
        console.log('Browser closed.');
    }
})();
