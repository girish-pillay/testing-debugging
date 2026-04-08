const { test, expect } = require('@playwright/test');
const { LoginPage } = require('../pageObject/loginpage');
const dataset = JSON.parse(JSON.stringify(require("../cred/credential.json")));

const MAX_RETRIES = 3;
const RETRY_TIMEOUT = 2000;

const extractTimestamp = (text, tabName, district) => {
  const trimmed = text.replace(/\s+/g, ' ').trim();
  const match = trimmed.match(/Last updated\s*:\s*(.*)/i);
  if (!match || !match[1] || match[1].trim() === '') {
    throw new Error(`${district} > ${tabName} has no timestamp`);
  }
  const timestamp = match[1].trim();
  expect(timestamp, `${district} > ${tabName} timestamp format looks invalid`).toMatch(/[A-Za-z]{3,9} \d{1,2}, \d{4}/);
  return timestamp;
};

const expectedOrgBackupPrefixes = [
  'MCJ_Case_Measurements', 'MCJ_Case_Report', 'Child', 'Mother', 'Check_CF',
  'Check_BF', 'Check_growth', "Mother's_Protein_Intake", 'Antenatal_care'
];

const districts = [
  { name: 'Barwani', method: 'Barwani' },
  { name: 'Chhatarpur', method: 'Chhatarpur' },
  { name: 'Jashpur', method: 'Jashpur' },
  { name: 'Ratlam', method: 'Ratlam' },
  { name: 'Sheopur', method: 'Sheopur' },
  { name: 'Singrauli', method: 'Singrauli' },
  { name: 'Vidisha', method: 'Vidisha' },
  { name: 'Nanded', method: 'Nanded' },
];

for (const district of districts) {
  const isBarwani = district.name === 'Barwani';

  test.describe(`${district.name} District Suite`, () => {

    test.beforeAll(async () => {
      console.log(`🕒 Waiting 20s before starting tests for ${district.name}`);
      await new Promise(resolve => setTimeout(resolve, 20000));
    });

    if (isBarwani) {
      test(`${district.name}: MPD Tabs`, async ({ page }) => {
        const loginPage = new LoginPage(page);
        await loginPage.goTo();
        await loginPage.ValidLogin(dataset.username, dataset.password);
        await page.getByRole('list').locator('a').nth(1).click();
        await loginPage[district.method]();
        await page.getByRole('list').locator('div img').click();
        await Promise.all([
          page.waitForNavigation({ waitUntil: 'domcontentloaded' }),
          page.getByRole('link', { name: /Master Project Dashboard/i }).click()
        ]);
        await page.waitForLoadState('networkidle');
        await expect(page.locator('.rc-tabs-nav')).toBeVisible({ timeout: 20000 });

        const tabNames = ['Status', 'Registration', 'Assessments', 'Field Selection', 'Case Work'];
        for (const name of tabNames) {
          const tab = page.getByRole('tab', { name });
          await tab.scrollIntoViewIfNeeded();
          await expect(tab).toBeVisible({ timeout: 10000 });
          if ((await tab.getAttribute('aria-selected')) !== 'true') await tab.click();
          await page.waitForTimeout(1500);

          let timestampText = '';
          for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
            try {
              const ts = await page.locator('.font-14.text-lite-gray').last();
              await expect(ts).toBeVisible({ timeout: 7000 });
              const raw = await ts.textContent();
              timestampText = extractTimestamp(raw, name, district.name);
              break;
            } catch (e) {
              if (attempt === MAX_RETRIES) throw e;
              await page.waitForTimeout(RETRY_TIMEOUT);
            }
          }

          console.log(`✅ ${district.name} > MPD > ${name} - ${timestampText}`);
        }
      });
    }

    test(`${district.name}: MASD Tabs`, async ({ page }) => {
      const loginPage = new LoginPage(page);
      await loginPage.goTo();
      await loginPage.ValidLogin(dataset.username, dataset.password);
      await page.getByRole('list').locator('a').nth(1).click();
      await loginPage[district.method]();
      await page.getByRole('list').locator('div img').click();
      await page.getByRole('link', { name: /Member Activity Summary/i }).click();
      await page.waitForLoadState('networkidle');

      const masdTabs = ['Case Summary', 'Case Activities', 'Coaching'];
      for (const tabName of masdTabs) {
        const tabLocator = page.getByRole('tab', { name: tabName });
        const panelId = await tabLocator.getAttribute('aria-controls');
        const panel = page.locator(`#${panelId}`);

        for (let retries = 0; retries < MAX_RETRIES; retries++) {
          try {
            if ((await tabLocator.getAttribute('aria-selected')) !== 'true') await tabLocator.click();
            await expect(panel).toBeVisible({ timeout: 8000 });

            const timestampLocator = panel.locator('div.font-14.text-lite-gray', { hasText: 'Last updated' }).first();
            await timestampLocator.scrollIntoViewIfNeeded();
            await expect(timestampLocator).toBeVisible({ timeout: 5000 });

            const rawText = await timestampLocator.innerText();
            const timestamp = extractTimestamp(rawText, tabName, district.name);
            console.log(`✅ ${district.name} > MASD > ${tabName} - ${timestamp}`);
            break;
          } catch (err) {
            if (retries === MAX_RETRIES - 1) throw err;
            await page.waitForTimeout(RETRY_TIMEOUT);
          }
        }
      }
    });

    test(`${district.name}: Org Backup`, async ({ page }) => {
      const loginPage = new LoginPage(page);
      await loginPage.goTo();
      await loginPage.ValidLogin(dataset.username, dataset.password);
      await page.getByRole('list').locator('a').nth(1).click();
      await loginPage[district.method]();
      await page.getByRole('list').locator('div img').click();

      const backupLink = page.getByRole('link', { name: /Org Backup Data/i });
      await expect(backupLink).toBeVisible({ timeout: 30000 });

      let success = false;
      for (let i = 0; i < 3; i++) {
        await Promise.all([
          page.waitForURL(/\/backup/, { timeout: 15000 }),
          backupLink.click()
        ]);
        const currentURL = page.url();
        if (currentURL.includes('/backup')) {
          success = true;
          break;
        } else {
          await page.goBack();
          await page.waitForTimeout(2000);
        }
      }
      if (!success) throw new Error(`❌ ${district.name} > Failed to open Org Backup page`);

      const rows = page.locator('table tr');
      await expect(rows.nth(1).locator('td').nth(1)).toBeVisible({ timeout: 11000 });

      const filenames = [];
      for (let i = 1; i <= 10; i++) {
        const row = rows.nth(i);
        const cells = row.locator('td');
        if ((await cells.count()) < 3) continue;
        const filename = (await cells.nth(1).innerText()).trim();
        const date = (await cells.nth(2).innerText()).trim();
        filenames.push(filename);
      }

      const validFiles = filenames.filter(name => expectedOrgBackupPrefixes.some(prefix => name.startsWith(prefix)));
      if (validFiles.length < 5) throw new Error(`❌ ${district.name} > Org Backup does not contain expected files.`);

      console.log(`📂 ${district.name} > Org Backup Files:\n` + filenames.join('\n'));
    });

    test(`${district.name}: User Monitoring`, async ({ page }) => {
      const loginPage = new LoginPage(page);
      await loginPage.goTo();
      await loginPage.ValidLogin(dataset.username, dataset.password);
      await page.getByRole('list').locator('a').nth(1).click();
      await loginPage[district.method]();
      await page.getByRole('list').locator('div img').click();
      await page.locator("#dashboard").click();

      const userCell = page.locator('#patient_lists tbody tr .uline-hov.dblock').first();
      await expect(userCell).toBeVisible({ timeout: 7000 });
      const userName = await userCell.textContent();
      await userCell.click();
      console.log(`👤 ${district.name} > Opened User: ${userName?.trim()}`);

      const tabs = ['Cases', 'Actions', 'Schedule', 'Timeline', 'Submissions', 'Indicators', 'Daily Report'];
      for (const tabName of tabs) {
        try {
          const tabBtn = page.locator('.rc-tabs-tab-btn', { hasText: tabName });
          await tabBtn.scrollIntoViewIfNeeded();
          await tabBtn.click();
          await page.waitForTimeout(500);

          const activePanel = page.locator('.rc-tabs-tabpane-active');
          if (await activePanel.innerText() !== '') {
            console.log(`✅ ${district.name} > ${tabName} tab has content.`);
          } else {
            console.log(`📭 ${district.name} > ${tabName} tab is empty.`);
          }
        } catch (e) {
          console.warn(`❌ ${district.name} > Error in ${tabName} tab:`, e.message);
        }
      }
    });
  });
}