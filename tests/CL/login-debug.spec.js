const { test, expect } = require('@playwright/test');

test('DEBUG LOGIN ONLY', async ({ page }) => {

  console.log('STEP 1: Opening URL');

  console.log('USERNAME EXISTS:', !!process.env.CW_USERNAME);
  console.log('PASSWORD EXISTS:', !!process.env.CW_PASSWORD);

  await page.goto('https://demo.cuedwell.com', {
    waitUntil: 'domcontentloaded'
  });

  await page.screenshot({
    path: 'step1-homepage.png',
    fullPage: true
  });

  console.log('STEP 2: Clicking Sign in with Email');

  const emailLogin = page.locator('text=Sign in with Email').last();

  await emailLogin.waitFor({
    state: 'visible',
    timeout: 30000
  });

  console.log('EMAIL LOGIN VISIBLE');

  await emailLogin.click({ force: true });

  console.log('EMAIL LOGIN CLICKED');

  await page.waitForTimeout(5000);

  await page.screenshot({
    path: 'after-email-click.png',
    fullPage: true
  });

  console.log(
    'EMAIL BOX COUNT:',
    await page.getByRole('textbox').count()
  );

  console.log(
    'EMAIL FIELD FOUND:',
    (await page.content()).includes('Enter your email')
  );

  console.log('STEP 3: Filling credentials');

  await page.getByRole('textbox', {
    name: 'Enter your email'
  }).fill(process.env.CW_USERNAME);

  await page.getByRole('textbox', {
    name: 'password'
  }).fill(process.env.CW_PASSWORD);

  await page.screenshot({
    path: 'step3-creds-filled.png',
    fullPage: true
  });

  console.log('STEP 4: Clicking Login');

  await page.getByRole('button', {
    name: 'Sign in',
    exact: true
  }).click();

  await page.waitForLoadState('domcontentloaded').catch(() => {});
  await page.waitForTimeout(5000);

  await page.screenshot({
    path: 'step4-after-login.png',
    fullPage: true
  });

  console.log('CURRENT URL:', page.url());

  const popupClose = page.locator('#popup_close').first();

  if (await popupClose.isVisible().catch(() => false)) {
    console.log('POPUP FOUND');
    await popupClose.click({ force: true });
  }

  const acceptBtn = page.locator('button:has-text("Accept")');

  if (await acceptBtn.isVisible().catch(() => false)) {
    console.log('COOKIE FOUND');
    await acceptBtn.click({ force: true });
  }

  await page.screenshot({
    path: 'step5-popup-closed.png',
    fullPage: true
  });

  console.log('STEP 5 COMPLETE');

  const globe = page.locator('li[data-tip] img').first();

  await globe.waitFor({
    state: 'visible',
    timeout: 30000
  });

  console.log('GLOBE FOUND');

  await globe.click();

  await page.screenshot({
    path: 'step6-globe-clicked.png',
    fullPage: true
  });

  console.log('ORG POPUP OPENED');
  console.log('FINAL URL:', page.url());
});
