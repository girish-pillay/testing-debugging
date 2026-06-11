const { test } = require('@playwright/test');

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

  console.log('STEP 2: Waiting for page app to settle');

  await page.waitForLoadState('networkidle', {
    timeout: 60000
  }).catch(() => {});

  await page.waitForTimeout(10000);

  await page.screenshot({
    path: 'before-email-click-after-wait.png',
    fullPage: true
  });

  console.log('STEP 3: Clicking Sign in with Email');

  const emailLogin = page.getByText(
    'Sign in with Email',
    { exact: true }
  );

  await emailLogin.waitFor({
    state: 'visible',
    timeout: 30000
  });

  await emailLogin.scrollIntoViewIfNeeded();

  const box = await emailLogin.boundingBox();

  console.log('EMAIL LOGIN BOX:', box);

  if (!box) {
    throw new Error('EMAIL LOGIN BOX NOT FOUND');
  }

  await page.mouse.click(
    box.x + box.width / 2,
    box.y + box.height / 2
  );

  console.log('REAL MOUSE CLICK DONE');

  await page.waitForTimeout(7000);

  console.log(
    'INPUT COUNT:',
    await page.locator('input').count()
  );

  console.log(
    'TEXTBOX COUNT:',
    await page.getByRole('textbox').count()
  );

  console.log(
    'EMAIL FIELD FOUND:',
    (await page.content()).includes('Enter your email')
  );

  await page.screenshot({
    path: 'after-real-mouse-click.png',
    fullPage: true
  });

  console.log('STEP 4: Filling credentials');

  await page.getByRole('textbox', {
    name: 'Enter your email'
  }).fill(process.env.CW_USERNAME);

  await page.getByRole('textbox', {
    name: 'password'
  }).fill(process.env.CW_PASSWORD);

  await page.screenshot({
    path: 'step4-creds-filled.png',
    fullPage: true
  });

  console.log('STEP 5: Clicking Login');

  await page.getByRole('button', {
    name: 'Sign in',
    exact: true
  }).click();

  await page.waitForLoadState('domcontentloaded')
    .catch(() => {});

  await page.waitForTimeout(5000);

  await page.screenshot({
    path: 'step5-after-login.png',
    fullPage: true
  });

  console.log('CURRENT URL:', page.url());

  const popupClose = page.locator('#popup_close').first();

  if (await popupClose.isVisible().catch(() => false)) {
    console.log('POPUP FOUND');
    await popupClose.click({ force: true });
  }

  const acceptBtn = page.locator(
    'button:has-text("Accept")'
  );

  if (await acceptBtn.isVisible().catch(() => false)) {
    console.log('COOKIE FOUND');
    await acceptBtn.click({ force: true });
  }

  await page.screenshot({
    path: 'step6-popup-closed.png',
    fullPage: true
  });

  console.log('STEP 6 COMPLETE');

  const modalClose = page.locator('#popup_close').first();

if (await modalClose.isVisible().catch(() => false)) {
  console.log('SECOND POPUP FOUND');

  await modalClose.click({ force: true });

  await page.waitForTimeout(2000);
}

const globe = page.locator('li[data-tip] img').first();

await globe.waitFor({
  state: 'visible',
  timeout: 30000
});

console.log('GLOBE FOUND');

await globe.click({ force: true });

console.log('GLOBE CLICKED');

  await page.screenshot({
    path: 'step7-globe-clicked.png',
    fullPage: true
  });

  console.log('ORG POPUP OPENED');
  console.log('FINAL URL:', page.url());
});
