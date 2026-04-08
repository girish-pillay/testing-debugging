const { test, expect } = require('@playwright/test');
const { LoginPage } = require('../pageObject/loginpage');
const dataset = JSON.parse(JSON.stringify(require('../cred/credential.json')));

const MAX_RETRIES = 2;
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

        const timestamp = page.locator(`#${panelId}`).locator('div.font-14.text-lite-gray', { hasText: 'Last updated' }).first();
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

const ngos = [
  { method: 'KCorpAROEHAN', label: 'AROEHAN' },
  { method: 'KCorp_BAIF', label: 'BAIF' },
  { method: 'KCorp_BRB', label: 'BRB' },
  { method: 'KCorp_CRY', label: 'CRY' },
  { method: 'KCorp_UWM', label: 'UWM' },
];

test('KCorp: MASD + Org Backup with retry logic', async ({ page }) => {
  const loginPage = new LoginPage(page);
  await loginPage.goTo();
  await loginPage.ValidLogin(dataset.username, dataset.password);

  for (const { method, label } of ngos) {
    let success = false;
    for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
      try {
        console.log(`🔁 Running MASD for KCorp_${label} (Attempt ${attempt})`);

        await page.getByRole('list').locator('a').nth(1).click();
        await page.waitForTimeout(1000);
        await loginPage[method]();
        await page.waitForTimeout(1000);
        await page.getByRole('list').locator('div img').click();
        await page.waitForTimeout(1000);

        const masdLink = page.getByRole('link', { name: /Member Activity Summary/i });
        await expect(masdLink).toBeVisible({ timeout: 10000 });
        await masdLink.evaluate(el => el.click());

        await page.waitForLoadState('networkidle');
        await expect(page.locator('.rc-tabs-nav')).toBeVisible({ timeout: 20000 });
        await expect(page.locator('.rc-tabs-nav-wrap')).toBeVisible({ timeout: 20000 });

        const tabs = ['Case Summary', 'Case Activities', 'Coaching'];
        await validateTabs(page, tabs);

        success = true;
        break;
      } catch (err) {
        console.error(`❌ MASD failed for ${label} on attempt ${attempt}: ${err.message}`);
        if (attempt === MAX_RETRIES) throw err;
      }
    }
    console.log('⏳ Waiting 10 seconds before next NGO...');
    await page.waitForTimeout(10000);
  }

  // Org Backup Check
  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      console.log(`📦 Starting Org Backup check (Attempt ${attempt})...`);
      await page.getByRole('list').locator('a').nth(1).click();
      await loginPage.KCorpAROEHAN();
      await page.getByRole('button', { name: '⨉' }).click();
      await page.getByRole('list').locator('div img').click();

      const backupLink = page.getByRole('link', { name: 'Org Backup Data' });
      await expect(backupLink).toBeVisible({ timeout: 30000 });
      await backupLink.evaluate(el => el.click());
      await page.waitForTimeout(3000);

      const currentUrl = page.url();
      if (!currentUrl.includes('/backup')) throw new Error('Not on Org Backup page');

      console.log(`✅ Org Backup page opened successfully on attempt ${attempt}`);
      const rows = page.locator('table tr');
      await expect(rows.first()).toBeVisible({ timeout: 30000 });

      const filenames = [];
      const dates = [];

      for (let pageNum = 1; pageNum <= 2; pageNum++) {
        const rowCount = await rows.count();
        for (let j = 0; j < rowCount; j++) {
          const cells = rows.nth(j).locator('td');
          if (await cells.count() < 3) continue;

          const filename = await cells.nth(1).innerText();
          const date = await cells.nth(2).innerText();
          filenames.push(filename.trim());
          dates.push(date.trim());
        }
        if (pageNum === 1) {
          await page.locator('li.pagination-item').filter({ hasText: /^2$/ }).click();
          await page.waitForTimeout(3000);
        }
      }

      console.log(`Total filenames collected: ${filenames.length}`);
      for (let i = 0; i < filenames.length; i++) {
        console.log(`${filenames[i].padEnd(60)} ${dates[i]}`);
      }
      break;
    } catch (err) {
      console.warn(`❌ Org Backup failed on attempt ${attempt}: ${err.message}`);
      if (attempt === MAX_RETRIES) throw err;
    }
  }
});
