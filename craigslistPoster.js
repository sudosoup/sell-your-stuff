const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: false }); // false for debugging
  const context = await browser.newContext();
  const page = await context.newPage();

  await page.goto('https://accounts.craigslist.org/login');

  // Pause so you can manually log in (or automate it later)
  console.log('Please log in manually...');
  await page.pause();

  // After login, navigate to post form
  await page.goto('https://post.craigslist.org/c/sfo');

  // Add further steps later...

  await browser.close();
})();
