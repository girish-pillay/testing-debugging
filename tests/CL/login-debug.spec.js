const { test, expect } = require('@playwright/test');
const { LoginPage } = require('../../pageObject/CL_loginpage');
const dataset = {
  username: process.env.CW_USERNAME,
  password: process.env.CW_PASSWORD
};

test('DEBUG LOGIN ONLY', async ({ page }) => {

  console.log('STEP 1: Opening URL');

  await page.goto('https://demo.cuedwell.com');

  await page.screenshot({
    path: 'step1-homepage.png',
    fullPage: true
  });

  console.log('STEP 2: Clicking Sign in with Email');

  await page.getByText('Sign in with Email').click();

  await page.screenshot({
    path: 'step2-signin-clicked.png',
    fullPage: true
  });

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

  await page.waitForTimeout(10000);

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

});
