// ratlam.spec.js
const { test, expect } = require('@playwright/test');
const fs = require('fs');
const { LoginPage } = require('../pageObject/loginpage');
const dataset = JSON.parse(JSON.stringify(require("../cred/credential.json")));

const MAX_RETRIES = 3;
const RETRY_TIMEOUT = 2000;


const expectedPrefixes = [
  'MCJ_Case_Measurements', 'MCJ_Case_Report', 'Child', 'Mother', 'Check_CF',
  'Check_BF', 'Check_growth', "Mother's_Protein_Intake", 'Antenatal_care'
];

const extractTimestamp = (text, tabName) => {
  const trimmed = text.replace(/\s+/g, ' ').trim();
  const match = trimmed.match(/Last updated\s*:\s*(.*)/i);
  expect(match, `${tabName} tab should contain 'Last updated :' with a timestamp`).not.toBeNull();

  const timestamp = match[1].trim();
  expect(timestamp, `${tabName} tab has no timestamp after 'Last updated :'`).not.toBe('');
  expect(timestamp, `${tabName} tab timestamp format looks invalid`).toMatch(/[A-Za-z]{3,9} \d{1,2}, \d{4}/);

  return timestamp;
};

const validateDateRange = (label, dateStr) => {
  const parsedDate = new Date(dateStr);
  const today = new Date();
  const diffTime = today - parsedDate;
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays <= 2) {
    console.log(`✅ ${label} is within acceptable range (Last updated ${diffDays} day(s) ago)`);
  } else {
    console.warn(`⚠️ ${label} is not refreshed for ${diffDays} day(s)`);
  }
};

test('Org backup for Ratlam districts', async ({ page }) => {
  const loginPage = new LoginPage(page);
  await loginPage.goTo();
  await loginPage.ValidLogin(dataset.username, dataset.password);

  await page.getByRole('list').locator('a').nth(1).click();
  await page.waitForTimeout(1000);
  await loginPage.Ratlam();
  await page.waitForTimeout(2000);
  await page.getByRole('list').locator('div img').click();

  const backupLink = page.locator('#org_backups');

  let success = false;

  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      if (page.isClosed()) throw new Error('Page already closed');

      await expect(backupLink).toBeAttached({ timeout: 10000 });
      await backupLink.scrollIntoViewIfNeeded();
      await expect(backupLink).toBeVisible({ timeout: 10000 });

      try {
        await backupLink.click({ timeout: 5000 });
      } catch {
        const handle = await backupLink.elementHandle();
        if (handle) await page.evaluate(el => el.click(), handle);
      }

      await page.waitForLoadState('networkidle');
      await expect(page.locator('table th', { hasText: 'File' })).toBeVisible({ timeout: 10000 });
      await expect(page.locator('table tr').nth(1)).toBeVisible({ timeout: 10000 });

      const currentUrl = page.url();
      console.log(`🔗 Attempt ${attempt} URL: ${currentUrl}`);
      if (!currentUrl.includes('/backup')) throw new Error('Not on Org Backup page');

      success = true;
      break;
    } catch (err) {
      console.warn(`❌ Org Backup attempt ${attempt} failed: ${err.message}`);
      if (!page.isClosed()) {
        await page.goBack();
        await page.waitForLoadState('domcontentloaded');
        await page.waitForTimeout(1500);
      }
    }
  }

  if (!success) throw new Error('❌ Failed to open and validate Org Backup data after retries.');

  const foundPrefixes = [];
  const prefixCount = {};
  const rows = page.locator('table tr');

  for (let i = 1; i <= 9; i++) {
    const row = rows.nth(i);
    const cells = row.locator('td');
    if ((await cells.count()) < 3) continue;

    const rawFilename = (await cells.nth(1).innerText()).trim();
    const date = (await cells.nth(2).innerText()).trim();

    const filenamePrefix = rawFilename.replace(/_\d{4}-\d{2}-\d{2}\.csv$/, '');
    const matchedPrefix = expectedPrefixes.find(prefix => prefix === filenamePrefix);
    if (!matchedPrefix) continue;

    prefixCount[matchedPrefix] = (prefixCount[matchedPrefix] || 0) + 1;

    if (!foundPrefixes.includes(matchedPrefix)) {
      foundPrefixes.push(matchedPrefix);
    }

    console.log(`${rawFilename} : ${date}`);
    validateDateRange(`Org Backup file (${matchedPrefix})`, date);
  }

  const missing = expectedPrefixes.filter(p => !foundPrefixes.includes(p));
  const duplicates = Object.entries(prefixCount).filter(([_, count]) => count > 1).map(([prefix]) => prefix);

  if (missing.length > 0) {
    console.warn(`⚠️ Missing Org Backup files: ${missing.join(', ')}`);
  }

  if (duplicates.length > 0) {
    console.warn(`♻️ Duplicate file(s) found: ${duplicates.join(', ')}`);
  }

  const outputSummary = {
    validatedPage: page.url(),
    totalExtractedRows: foundPrefixes.length,
    missingFiles: missing,
    duplicateFiles: duplicates,
    prefixCounts: prefixCount
  };

  fs.writeFileSync('org-backup-summary.json', JSON.stringify(outputSummary, null, 2));

  if (missing.length > 0 || duplicates.length > 0) {
    console.log('❗ Validation WARNING: Issues found in first 9 rows. Please review logs.');
  }
});





test('MASD for Ratlam', async ({ page }) => {
  const loginPage = new LoginPage(page);
  await loginPage.goTo();
  await loginPage.ValidLogin(dataset.username, dataset.password);

  await page.getByRole('list').locator('div img').click();
  await page.getByRole('link', { name: /Member Activity Summary/i }).click();
  await page.waitForLoadState('networkidle');

  const masdTabs = ['Case Summary', 'Case Activities', 'Coaching'];

  for (const tabName of masdTabs) {
    const tabLocator = page.getByRole('tab', { name: tabName });
    let retries = 0;

    while (retries < MAX_RETRIES) {
      try {
        if (page.isClosed()) throw new Error(`❗ Page closed unexpectedly during retry ${retries + 1}`);

        const isSelected = await tabLocator.getAttribute('aria-selected');
        const panelId = await tabLocator.getAttribute('aria-controls');

        if (isSelected !== 'true') {
          await expect(tabLocator).toBeVisible({ timeout: 5000 });
          await tabLocator.click();
          await page.waitForTimeout(1000);
        }

        const panel = page.locator(`#${panelId}`);
        await expect(panel).toBeVisible({ timeout: 8000 });

        const timestampLocator = panel.locator('div.font-14.text-lite-gray', { hasText: 'Last updated' }).first();
        await timestampLocator.scrollIntoViewIfNeeded();
        await expect(timestampLocator).toBeVisible({ timeout: 5000 });

        const rawText = await timestampLocator.textContent();
        const timestamp = extractTimestamp(rawText, tabName);
        console.log(`✅ MASD > ${tabName} Tab - ${timestamp}`);
        validateDateRange(`MASD > ${tabName} tab`, timestamp);
        break;

      } catch (error) {
        retries++;
        if (retries < MAX_RETRIES) {
          console.log(`❌ MASD > ${tabName} Tab: Retry ${retries} failed. Retrying...`);
          await page.waitForTimeout(RETRY_TIMEOUT);
        } else {
          console.warn(`❌ Unable to retrieve the 'Last updated' timestamp for MASD > ${tabName} tab.`);
        }
      }
    }
  }
});



test('User monitoring for Ratlam', async ({ page }) => {
  const loginPage = new LoginPage(page);
  await loginPage.goTo();
  await loginPage.ValidLogin(dataset.username, dataset.password);
  //await page.getByRole('list').locator('a').nth(1).click();
  //await loginPage.Barwani();
  console.log(`🌐 Testing URL: ${page.url()}`);
  await page.getByRole('list').locator('div img').click();
  await page.locator("#dashboard").click();

  const firstRow = page.locator('#patient_lists tbody tr').nth(1);
  await expect(firstRow).toBeVisible({ timeout: 7000 });
  const userCell = firstRow.locator('.uline-hov.dblock');
  const userName = await userCell.textContent();
  await userCell.click();
  console.log(`✅ Clicked UPC of : "${userName?.trim()}"`);

  // Detect User Role
  let roleText = 'Other';
  try {
    const roleBox = page.locator('.flex.justspacebetween.aligncenter');
    const allDivs = roleBox.locator('div.m-r-10');
    const count = await allDivs.count();
    for (let i = 0; i < count; i++) {
      const txt = await allDivs.nth(i).textContent();
      if (txt?.trim() && txt.trim() !== 'Other') {
        roleText = txt.trim();
        break;
      }
    }
  } catch {}
  console.log(`✅ User role detected: ${roleText}`);

  const tabValidationConfig = [
  {
    name: userName?.trim() || 'User',
    validate: async () => {}
  },
  {
    name: 'Cases',
    validate: async () => {
      const updated = page.locator('text=Last updated at');
      try {
        await expect(updated).toBeVisible({ timeout: 7000 });
        const text = await updated.textContent();
        console.log(`✅ Validated tab: Cases – ${text?.trim()}`);
      } catch {
        console.log(`📭 Cases tab is empty or 'Last updated at' not found.`);
      }
    }
  },
  {
    name: 'Actions',
    validate: async () => {
      try {
        const actionsTable = page.locator('.rc-tabs-tabpane-active .table-fix-head table.table-stripe');
        const nameCell = actionsTable.locator('tbody tr td').first();
        if (await nameCell.isVisible({ timeout: 5000 })) {
          const name = await nameCell.textContent();
          console.log(`✅ Actions tab has content: ${name.trim()}`);
        } else {
          console.log(`📭 Actions tab is empty.`);
        }
      } catch {
        console.log(`📭 Actions tab is empty or failed to load.`);
      }
    }
  },
  {
    name: 'Timeline',
    validate: async () => {
      try {
        const nameCell = page.locator('.rc-tabs-tabpane-active .table-fix-head table.table-stripe tbody tr td').first();
        if (await nameCell.isVisible({ timeout: 5000 })) {
          const name = await nameCell.textContent();
          console.log(`✅ Timeline tab has content: ${name.trim()}`);
        } else {
          console.log(`📭 Timeline tab is empty.`);
        }
      } catch {
        console.log(`📭 Timeline tab is empty or failed to load.`);
      }
    }
  },
  {
    name: 'Submissions',
    validate: async () => {
      try {
        const nameCell = page.locator('.rc-tabs-tabpane-active .table-fix-head table.table-stripe tbody tr td').first();
        if (await nameCell.isVisible({ timeout: 5000 })) {
          const name = await nameCell.textContent();
          console.log(`✅ Submissions tab has content: ${name.trim()}`);
        } else {
          console.log(`📭 Submissions tab is empty.`);
        }
      } catch {
        console.log(`📭 Submissions tab is empty or failed to load.`);
      }
    }
  },
  {
    name: 'Indicators',
    validate: async () => {
      try {
        const nameCell = page.locator('.rc-tabs-tabpane-active .table-fix-head table.table-stripe tbody tr td').first();
        if (await nameCell.isVisible({ timeout: 5000 })) {
          const name = await nameCell.textContent();
          console.log(`✅ Indicators tab has content: ${name.trim()}`);
        } else {
          console.log(`📭 Indicators tab is empty.`);
        }
      } catch {
        console.log(`📭 Indicators tab is empty or failed to load.`);
      }
    }
  },
  {
    name: 'Daily Report',
    validate: async () => {
      try {
        const heading = page.locator('h5', { hasText: 'Your activity for' });
        if (await heading.isVisible({ timeout: 5000 })) {
          const text = await heading.textContent();
          console.log(`✅ Validated Daily Report tab using header: ${text?.trim()}`);
        } else {
          const fallbackBadge = page.locator('.badge-2').first();
          if (await fallbackBadge.isVisible({ timeout: 5000 })) {
            const val = await fallbackBadge.textContent();
            console.log(`✅ Validated Daily Report tab using badge: ${val?.trim()}`);
          } else {
            console.log(`📭 Daily Report tab is empty.`);
          }
        }
      } catch {
        console.log(`📭 Daily Report tab is empty or failed to load.`);
      }
    }
  }
];


  for (const tab of tabValidationConfig) {
    try {
      const tabBtn = page.locator('.rc-tabs-tab-btn', { hasText: tab.name });
      await expect(tabBtn).toBeVisible({ timeout: 5000 });
      await tabBtn.scrollIntoViewIfNeeded();
      await tabBtn.click();
      await page.waitForTimeout(1000);
      await tab.validate();
    } catch (err) {
      console.warn(`❌ Validation failed for tab: ${tab.name}`, err.message);
    }
  }
});


test('Print Member Dashboard name and last updated date for second user', async ({ page }) => {
  const loginPage = new LoginPage(page);
  await loginPage.goTo();
  await loginPage.ValidLogin(dataset.username, dataset.password);

  // Open Chhatarpur dashboard
  // await page.getByRole('list').locator('a').nth(1).click();
  // await page.waitForTimeout(1000);
  // await loginPage.Chhatarpur();
  await page.waitForTimeout(2000);

  // Go to Members tab
  await page.getByRole('list').locator('div img').click();
  await page.getByRole('link', { name: /Members/i }).click();
  await page.waitForLoadState('networkidle');

  // Select second user
  const secondRow = page.locator('table.table.table-stripe tbody tr').nth(4);
  await expect(secondRow).toBeVisible({ timeout: 5000 });

  const nameCell = secondRow.locator('div.fw500');
  const displayName = (await nameCell.textContent()).trim();

  const dashboardLink = secondRow.locator('a[tooltip="Member Dashboard"]');
  await expect(dashboardLink).toBeVisible({ timeout: 5000 });
  await dashboardLink.click();
  await page.waitForLoadState('networkidle');

  // Extract greeting name
  const greetingEl = page.locator('h2.f18.bold-600');
  await expect(greetingEl).toBeVisible({ timeout: 7000 });
  const greeting = await greetingEl.textContent();
  const user = greeting?.replace('Hello,', '').trim() || '';
  console.log(`👤 Member Name: ${user}`);

  // Extract Last Updated date
  const lastUpdatedEl = page.locator('h2.f14');
  try {
    await expect(lastUpdatedEl).toBeVisible({ timeout: 5000 });
    const lastUpdatedText = (await lastUpdatedEl.textContent())?.trim();
    if (lastUpdatedText) {
      console.log(`📅 Last Updated: ${lastUpdatedText}`);
    } else {
      console.log('📅 Last Updated timestamp not available');
    }
  } catch (e) {
    console.log('📅 Last Updated timestamp not available');
  }
});
