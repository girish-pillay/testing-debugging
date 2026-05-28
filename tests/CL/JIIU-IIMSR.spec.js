const { test, expect } = require('@playwright/test');
const { LoginPage } = require('../../pageObject/CL_loginpage');
//const dataset = require('../../cred/credential.json');
const dataset = {
  username: process.env.CW_USERNAME,
  password: process.env.CW_PASSWORD
  };
const { loginToApp, openMASD } = require('./helpers/commonActions');

async function extractMasdLastUpdated(page, tabName) {
  try {
    const tab = page.getByRole('tab', { name: tabName });
    await tab.waitFor({ state: 'visible', timeout: 15000 });
    await tab.click();
    await page.waitForTimeout(800);

    const panelId = await tab.getAttribute('aria-controls');
    const panel = page.locator(`#${panelId}`);

    await page.waitForLoadState('networkidle');
await page.waitForTimeout(1500);

const lastUpdated = panel
  .locator('div.font-14.text-lite-gray')
  .filter({ hasText: /Last updated/i })
  .first();

await lastUpdated.waitFor({
  state: 'visible',
  timeout: 20000
});

await expect(lastUpdated).toContainText(
  /\d{4}|\bam\b|\bpm\b/,
  { timeout: 20000 }
);

    const text = (await lastUpdated.innerText()).replace(/\s+/g, ' ').trim();
    console.log(`📊 JIIU IIMSR → ${tabName} → ${text}`);
  } catch {
    console.log(`📭 JIIU IIMSR → ${tabName} → Last updated not found`);
  }
}

test('JIIU IIMSR MASD Last Updated Extraction', async ({ page }) => {
  const loginPage = new LoginPage(page);

  /* ================= LOGIN ================= */
  await loginToApp(loginPage, dataset);

  /* ================= ORG SWITCH ================= */
  await loginPage.JIIU_IIMSR();
  console.log(`🌐 Landed after JIIU_IIMSR() on: ${page.url()}`);

  /* ================= OPEN MASD ================= */
  await openMASD(page);

  /* ================= TAB-WISE LAST UPDATED ================= */
  await extractMasdLastUpdated(page, 'Case Summary');
  await extractMasdLastUpdated(page, 'Case Activities');
  await extractMasdLastUpdated(page, 'Coaching');
});
