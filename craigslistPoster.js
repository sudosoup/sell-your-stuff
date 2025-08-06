const { chromium } = require('playwright');

(async () => {
  function logStep(msg) {
    console.log(`[CraigslistPoster] ${msg}`);
  }
  function logError(msg, err) {
    console.error(`[CraigslistPoster][ERROR] ${msg}`, err || '');
  }
  let payload;
  try {
    logStep('Parsing payload from process.argv[2]');
    payload = JSON.parse(process.argv[2]);
  } catch (e) {
    logError('Invalid payload', e);
    process.exit(1);
  }
  const { email, password, item } = payload;
  if (!email || !password || !item) {
    logError('Missing required data');
    process.exit(1);
  }

  let browser;
  try {
    logStep('Launching Chromium with Playwright');
    browser = await chromium.launch({ headless: false });
    const context = await browser.newContext();
    const page = await context.newPage();

    logStep('Navigating to Craigslist login page');
    await page.goto('https://accounts.craigslist.org/login');
    logStep('Filling in email');
    await page.fill('#inputEmailHandle', email);
    logStep('Filling in password');
    await page.fill('#inputPassword', password);
    logStep('Clicking login button');
    const buttons = await page.$$('button[type="submit"]');
    if (buttons.length > 1) {
      // Try to click the second button, which is usually the password login
      await buttons[1].click();
    } else if (buttons.length === 1) {
      await buttons[0].click();
    } else {
      throw new Error('No submit buttons found on login page');
    }

    logStep('Navigating to post page');
    await page.goto('https://post.craigslist.org/');

    logStep('Selecting location (e.g., San Francisco Bay Area)');
    await page.click('a[href*="/c/sfo"]');

    logStep('Choosing posting category (for sale by owner)');
    await page.click('input[value="fso"]');
    await page.click('button[type="submit"]');

    // Here you would continue to fill out the post form using item.title, item.description, etc.
    // Example:
    // logStep('Filling out post form');
    // await page.fill('input[name="PostingTitle"]', item.title);
    // await page.fill('textarea[name="PostingBody"]', item.description);

    logStep('Pausing for manual inspection (Playwright Inspector)');
    await page.pause();

    logStep('Closing browser');
    await browser.close();
    logStep('Done');
  } catch (err) {
    logError('Exception during Playwright automation', err);
    if (browser) {
      await browser.close();
    }
    process.exit(1);
  }
})();
