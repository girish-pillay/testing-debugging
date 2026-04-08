const { test, expect } = require('@playwright/test');
const { LoginPage } = require('../../pageObject/CL_loginpage');
const dataset = require('../../cred/credential.json');
const {
  loginToApp,} = require('./helpers/commonActions');

test('Voice recording function check', async ({ page, context, browserName }) => {
  test.setTimeout(90000);

  const loginPage = new LoginPage(page);

  /* LOGIN */
  await loginToApp(loginPage, dataset);
  await loginPage.cuetree();

  const fingerIcon = page
    .locator('#patient_lists tbody tr')
    .first()
    .locator('span[tooltip="View path details"]');

  await expect(fingerIcon).toBeVisible({ timeout: 20000 });
  await fingerIcon.click();
  console.log('👉 Finger icon clicked');

  /* ---------- Open voice modal ---------- */
  const voiceIcon = page.locator('#voice_message');
  await expect(voiceIcon).toBeVisible({ timeout: 15000 });
  await voiceIcon.click();

  /* ---------- Start recording ---------- */
  const startBtn = page.getByText('Start Recording');
  await expect(startBtn).toBeVisible({ timeout: 15000 });
  await startBtn.click();
  console.log('🎙 Recording started');

  // Let recorder initialize
  await page.waitForTimeout(3000);

  /* ---------- Wait for stop button to become usable ---------- */
  const stopBtn = page.locator('#stop');

  await page.waitForFunction(() => {
    const btn = document.querySelector('#stop');
    if (!btn) return false;

    const hidden =
      btn.classList.contains('hidden') ||
      btn.hasAttribute('hidden') ||
      btn.getAttribute('aria-hidden') === 'true';

    const disabled =
      btn.hasAttribute('disabled') ||
      btn.getAttribute('aria-disabled') === 'true';

    return !hidden && !disabled;
  }, { timeout: 10000 });

  const stopVisible = await stopBtn.isVisible().catch(() => false);
  console.log(`🔎 Stop visible after recording start: ${stopVisible}`);

  await expect(stopBtn).toBeVisible({ timeout: 10000 });
  await expect(stopBtn).toBeEnabled({ timeout: 10000 });

  await page.waitForTimeout(500);
  await stopBtn.click({ force: true });
  console.log('🛑 Recording stopped');

  /* ---------- Verify audio row appears ---------- */
  const audio = page.locator('audio').first();
  await expect(audio).toBeVisible({ timeout: 15000 });
  console.log('🎧 Audio element created');

  /* ---------- Play audio ---------- */
  await audio.evaluate(el => el.play());
  await page.waitForTimeout(2000);

  const isPlaying = await audio.evaluate(el => !el.paused && !el.ended);
  expect(isPlaying).toBeTruthy();

  console.log('✅ Voice recording working');
});