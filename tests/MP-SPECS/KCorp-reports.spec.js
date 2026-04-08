const { test, expect } = require('@playwright/test');
const { LoginPage } = require('../pageObject/loginpage');
const dataset = require('../cred/credential.json');

const MAX_RETRIES = 5;
const RETRY_TIMEOUT = 2000;

const validateTabs = async (page, tabs) => {
  for (const tabName of tabs) {
    for (let i = 0; i < MAX_RETRIES; i++) {
      try {
        const tabBtn = page.getByRole('tab', { name: tabName });
        await expect(tabBtn).toBeVisible({ timeout: 15000 });

        const panelId = await tabBtn.getAttribute('aria-controls');
        if (!panelId) throw new Error(`Missing aria-controls on tab: ${tabName}`);

        await tabBtn.click();
        await page.waitForTimeout(1000);

        const timestamp = page.locator(`#${panelId} >> div.font-14.text-lite-gray`, { hasText: 'Last updated' }).first();
        await expect(timestamp).toBeVisible({ timeout: 10000 });

        const text = await timestamp.innerText();
        if (!text || text.trim().endsWith(':')) {
          throw new Error(`❌ ${tabName} tab has empty/invalid timestamp: "${text}"`);
        }

        console.log(`✅ ${tabName} Last updated : ${text}`);
        break;
      } catch (err) {
        console.warn(`⚠️ ${tabName} tab retry ${i + 1} failed: ${err.message}`);
        if (i === MAX_RETRIES - 1) {
          throw new Error(`❌ Failed to validate ${tabName} after ${MAX_RETRIES} retries.`);
        }
        await page.waitForTimeout(RETRY_TIMEOUT);
      }
    }
  }
};

test('MASD for all KCorp clusters in one login', async ({ page }) => {
  const loginPage = new LoginPage(page);
  await loginPage.goTo();
  await loginPage.ValidLogin(dataset.username, dataset.password);

  await page.getByRole('list').locator('a').nth(1).click();

  const clusters = [
    { label: 'AROEHAN', method: 'KCorpAROEHAN' },
    { label: 'BAIF', method: 'KCorp_BAIF' },
    { label: 'BRB', method: 'KCorp_BRB' },
    { label: 'CRY', method: 'KCorp_CRY' },
    { label: 'UWM', method: 'KCorp_UWM' }
  ];

  for (const cluster of clusters) {
    console.log(`\n🔁 Running MASD for KCorp_${cluster.label}`);

    await loginPage[cluster.method]();
    await page.waitForTimeout(1000);
    await page.getByRole('list').locator('div img').click();
    await page.waitForTimeout(1000);

    const masdLink = page.getByRole('link', { name: /Member Activity Summary/i });
    await expect(masdLink).toBeVisible({ timeout: 10000 });
    await masdLink.evaluate(el => el.click());

    await page.waitForLoadState('networkidle');
    await expect(page.locator('.rc-tabs-nav')).toBeVisible({ timeout: 20000 });

    const tabWrapper = page.locator('.rc-tabs-nav-wrap');
    await expect(tabWrapper).toBeVisible({ timeout: 20000 });

    const tabs = ['Case Summary', 'Case Activities', 'Coaching'];
    await validateTabs(page, tabs);
  }
});
