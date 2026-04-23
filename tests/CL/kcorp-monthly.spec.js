const { test, expect } = require('@playwright/test');
const { LoginPage } = require('../../pageObject/loginpage');
const dataset = JSON.parse(JSON.stringify(require('../../cred/credential.json')));

test('Org backup for KCorp districts', async ({ page }) => {
  const loginPage = new LoginPage(page);
  await loginPage.goTo();
  await loginPage.ValidLogin(dataset.username, dataset.password);

  await page.getByRole('list').locator('a').nth(1).click();
  await page.waitForTimeout(1000);
  await loginPage.KCorpAROEHAN();
  await page.waitForTimeout(2000);
  await page.getByRole('list').locator('div img').click();
  await page.waitForTimeout(1000);

  // Click Org Backup and wait for redirect
  await Promise.all([
    page.waitForURL(/\/backup/, { timeout: 15000 }),
    page.getByRole('link', { name: /Org Backup Data/i }).click()
  ]);
  console.log('✅ Confirmed Org Backup URL');
// Step 1: Click Monthly Reports tab if not already selected
const monthlyTab = page.getByRole('tab', { name: 'Monthly Reports' });
await expect(monthlyTab).toBeAttached({ timeout: 10000 });
const isSelected = await monthlyTab.getAttribute('aria-selected');
if (isSelected !== 'true') {
  await monthlyTab.evaluate(el => el.click());
  console.log('✅ Clicked Monthly Reports tab');
} else {
  console.log('ℹ️ Monthly Reports tab already selected');
}

// Step 2: Get the corresponding tab panel ID dynamically
const panelId = await monthlyTab.getAttribute('aria-controls');
if (!panelId) throw new Error('❌ Could not find aria-controls for Monthly Reports tab');

const monthlyPanel = page.locator(`#${panelId}`);
await expect(monthlyPanel).toBeVisible({ timeout: 10000 });

// Step 3: Retry logic to ensure Monthly Reports table is loaded
const rows = monthlyPanel.locator('table tr');

let tableLoaded = false;
for (let attempt = 1; attempt <= 5; attempt++) {
  try {
    const rowCount = await rows.count();
    if (rowCount > 1) {
      const sampleText = await rows.nth(1).locator('td').nth(1).textContent();
      if (sampleText && sampleText.includes('.csv')) {
        tableLoaded = true;
        break;
      }
    }
  } catch (err) {
    // ignore and retry
  }
  console.warn(`⏳ Retry ${attempt}: waiting for Monthly Reports table to become visible...`);
  await page.waitForTimeout(3000);
}

if (!tableLoaded) {
  await page.screenshot({ path: 'screenshots/kcorp-monthly-table-timeout.png', fullPage: true });
  throw new Error('❌ Table did not become visible in Monthly Reports tab.');
}

// Step 4: Extract and print rows
const rowCount = await rows.count();
console.log(`📊 Found ${rowCount - 1} data rows. Printing up to 19:`);

for (let i = 1; i < Math.min(rowCount, 20); i++) {
  const row = rows.nth(i);
  const cells = row.locator('td');
  if ((await cells.count()) < 3) continue;

  const fileName = (await cells.nth(1).textContent()).trim();
  const fileDate = (await cells.nth(2).textContent()).trim();

  if (/\.csv$/.test(fileName)) {
    console.log(`${fileName.padEnd(70)}${fileDate}`);
  }
}

});
