const { chromium } = require('playwright');

(async () => {
  const email = process.argv[2];
  const password = process.argv[3];
  if (!email || !password) {
    console.error('Craigslist credentials missing');
    process.exit(1);
  }
  const browser = await chromium.launch({ headless: false }); // false for debugging
  const context = await browser.newContext();
  const page = await context.newPage();

  await page.goto('https://accounts.craigslist.org/login');
  await page.fill('#inputEmailHandle', email);
  await page.fill('#inputPassword', password);
  await page.click('button[type="submit"]');

  // After login, navigate to post form
  await page.goto('https://post.craigslist.org/c/sfo');

  // Add further steps later...

  await browser.close();
})();
