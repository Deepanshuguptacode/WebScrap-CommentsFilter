const puppeteer = require('puppeteer');
const fs = require('fs');

// Function to convert likes to number
function toNumber(likeStr) {
    let num = 0;
    if (likeStr.endsWith('K')) {
        num = parseFloat(likeStr.slice(0, -1)) * 1000;
    } else {
        num = parseFloat(likeStr);
    }
    return num;
}

const main = async (videoId,minLikes) => {
    let response = [];

    const browser = await puppeteer.launch({ headless: false, defaultViewport: null }); // Open browser window
    const page = await browser.newPage();

    try {
        await page.goto(`https://www.youtube.com/watch?v=${videoId}`, {
            waitUntil: 'networkidle2',
        });

        // Scroll the page to ensure comments are loaded
        const scrollToBottom = async () => {
            const distance = 100;
            const delay = 100;
            while (await page.evaluate(() => document.scrollingElement.scrollTop + window.innerHeight < document.scrollingElement.scrollHeight)) {
                await page.evaluate((y) => { document.scrollingElement.scrollBy(0, y); }, distance);
                await new Promise(resolve => setTimeout(resolve, delay));
            }
        };

        await scrollToBottom();

        // Wait for the comments section to be loaded
        await page.waitForSelector('ytd-comment-thread-renderer', { timeout: 60000 });

        // Extract comments and likes
        const searchData = await page.evaluate(() => {
            let data = [];
            const commentElements = document.querySelectorAll('ytd-comment-thread-renderer #content-text');
            const likeElements = document.querySelectorAll('ytd-comment-thread-renderer #vote-count-middle');

            commentElements.forEach((commentElement, index) => {
                const comment = commentElement.textContent.trim();
                const likeElement = likeElements[index];
                const likes = likeElement ? likeElement.textContent.trim() : '0';
                data.push({ comment, likes });
            });

            return data;
        });

        // Filter comments with at least 100 likes and get top 5 comments
        response = searchData.filter(item => toNumber(item.likes) >= minLikes).slice(0, 5);

        // Save data to JSON file
        let json = JSON.stringify(response, null, 2);
        fs.writeFileSync('YoutubeData.json', json, 'utf-8');

        console.log(response); // Output the search data to the console
    } catch (error) {
        console.error('An error occurred:', error);
    } finally {
        await browser.close();
    }

    return response;
};

module.exports = main;

// main("zzwRbKI2pn4",2000);
