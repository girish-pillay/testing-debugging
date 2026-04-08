const { test, expect } = require('@playwright/test');
const { LoginPage } = require('../pageObject/loginpage');
const dataset = JSON.parse(JSON.stringify(require('../cred/credential.json')));

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


const extractTimestamp = (text, tabName) => {
  const trimmed = text.replace(/\s+/g, ' ').trim();
  const match = trimmed.match(/Last updated\s*:\s*(.*)/i);
  expect(match, `${tabName} tab should contain 'Last updated :' with a timestamp`).not.toBeNull();

  const timestamp = match[1].trim();
  expect(timestamp, `${tabName} tab has no timestamp after 'Last updated :'`).not.toBe('');

  expect(timestamp, `${tabName} tab timestamp format looks invalid`).toMatch(/[A-Za-z]{3,9} \d{1,2}, \d{4}/);

  return timestamp;
};


const runMASDTest = (methodName, label) => {
  test(`MASD for KCorp_${label}`, async ({ page }) => {
    console.log(`⏳ Waiting 10s before starting ${label}...`);
    await page.waitForTimeout(10000);

    const loginPage = new LoginPage(page);
    await loginPage.goTo();
    await loginPage.ValidLogin(dataset.username, dataset.password);

    await page.getByRole('list').locator('a').nth(1).click();
    await page.waitForTimeout(1000);
    await loginPage[methodName]();
    await page.waitForTimeout(1000);

    await page.getByRole('list').locator('div img').click();
    await page.waitForTimeout(1000);

    const masdLink = page.getByRole('link', { name: /Member Activity Summary/i });
    await expect(masdLink).toBeVisible({ timeout: 15000 });
    await masdLink.scrollIntoViewIfNeeded();
    await masdLink.click();

    await page.waitForLoadState('domcontentloaded');
    const tabNav = page.locator('.rc-tabs-nav');
    for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
      try {
        await expect(tabNav).toBeVisible({ timeout: 10000 });
        break;
      } catch (err) {
        console.warn(`⚠️ Attempt ${attempt} to detect tab nav failed.`);
        if (attempt === MAX_RETRIES) throw new Error('❌ Tabs not visible after retries.');
        await page.reload();
        await page.waitForLoadState('domcontentloaded');
      }
    }

    const tabs = ['Case Summary', 'Case Activities', 'Coaching'];
    await validateTabs(page, tabs);
  });
};

runMASDTest('KCorpAROEHAN', 'AROEHAN');
runMASDTest('KCorp_BAIF', 'BAIF');
runMASDTest('KCorp_BRB', 'BRB');
runMASDTest('KCorp_CRY', 'CRY');
runMASDTest('KCorp_UWM', 'UWM');
runMASDTest('KCorp_CYDA', 'CYDA');
































// test('Org backup for KCorp', async ({ page }) => {
//   const loginPage = new LoginPage(page);
//   await loginPage.goTo();
//   await loginPage.ValidLogin(dataset.username, dataset.password);

//   await page.getByRole('list').locator('a').nth(1).click();
//   await page.getByRole('heading', { name: 'KCorp Foundation -' }).click();
//   await page.getByRole('heading', { name: 'KCorp Foundation - AROEHAN' }).click();
//   await page.getByRole('button', { name: '⨉' }).click();
//   await page.getByRole('list').locator('div img').click();

//   const backupLink = page.getByRole('link', { name: 'Org Backup Data' });
//   await expect(backupLink).toBeVisible({ timeout: 30000 });

//   let success = false;
//   for (let i = 0; i < MAX_RETRIES; i++) {
//     await backupLink.scrollIntoViewIfNeeded();
//     await backupLink.click();
//     await page.waitForTimeout(3000);

//     const expectedTable = page.locator('table tr').nth(1).locator('td').nth(1);
//     const onCorrectPage = page.url().includes('/backup') && await expectedTable.isVisible();

//     if (onCorrectPage) {
//       success = true;
//       console.log(`✅ Org Backup page opened successfully on attempt ${i + 1}`);
//       break;
//     } else {
//       console.warn(`⚠️ Attempt ${i + 1} failed. Retrying...`);
//       await page.goBack();
//       await page.waitForTimeout(RETRY_TIMEOUT);
//     }
//   }

//   if (!success) throw new Error('❌ Failed to open Org Backup page');

//   console.log('✅ Confirmed Org Backup URL');

//   const filenames = [];
//   const dates = [];

//   for (let pageNum = 1; pageNum <= 2; pageNum++) {
//     const rows = page.locator('table tr');
//     const rowCount = await rows.count();
//     for (let j = 0; j < rowCount; j++) {
//       if (pageNum === 2 && filenames.length >= 10) break;

//       const cells = rows.nth(j).locator('td');
//       if (await cells.count() < 3) continue;

//       const filename = await cells.nth(1).innerText();
//       const date = await cells.nth(2).innerText();

//       filenames.push(filename.trim());
//       dates.push(date.trim());
//     }
//     if (filenames.length >= 10) break;
//     const nextPage = page.locator('li.pagination-item').filter({ hasText: /^2$/ });
//     if (await nextPage.isVisible()) {
//       await nextPage.click();
//       await page.waitForTimeout(3000);
//     }
//   }

//   console.log(`✅ Total Org Backup files: ${filenames.length}`);
//   for (let i = 0; i < filenames.length; i++) {
//     console.log(`${filenames[i].padEnd(60)} ${dates[i]}`);
//   }
// });
