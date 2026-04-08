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

test('Org backup for Barwani districts', async ({ page }) => {
  const loginPage = new LoginPage(page);
  await loginPage.goTo();
  await loginPage.ValidLogin(dataset.username, dataset.password);

  await page.getByRole('list').locator('a').nth(1).click();
  await page.waitForTimeout(1000);
  await loginPage.Barwani();
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
   
   

test('MASD for Barwani', async ({ page }) => {
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


test('MPD for All districts', async ({ page }) => {
  const loginPage = new LoginPage(page);
  await loginPage.goTo();
  await loginPage.ValidLogin(dataset.username, dataset.password);

  await page.getByRole('list').locator('div img').click();
  await Promise.all([
    page.waitForNavigation({ waitUntil: 'domcontentloaded' }),
    page.getByRole('link', { name: /Master Project Dashboard/i }).click()
  ]);

  await page.waitForLoadState('networkidle');
  await expect(page.locator('.rc-tabs-nav')).toBeVisible({ timeout: 21000 });
  console.log("✅ .rc-tabs-nav is visible and loaded.");

  const tabNames = ['Status', 'Registration', 'Assessments', 'Field Selection', 'Case Work'];

  for (const name of tabNames) {
    console.log(`⏳ Clicking "${name}" tab...`);
    const tab = page.getByRole('tab', { name });
    const isSelected = await tab.getAttribute('aria-selected');
    if (isSelected !== 'true') {
      await tab.click();
    }

    let lastUpdatedText = null;
    let retries = 0;
    while (retries < MAX_RETRIES) {
      try {
        const lastUpdatedLocator = page.locator('.font-14.text-lite-gray').last();
        await expect(lastUpdatedLocator).toBeVisible({ timeout: 11000 });
        lastUpdatedText = await lastUpdatedLocator.first().textContent();
        const timestamp = extractTimestamp(lastUpdatedText, name);
        console.log(`✅ ${name} Tab - ${timestamp}`);
        break;
      } catch (error) {
        retries++;
        if (retries < MAX_RETRIES) {
          console.log(`❌ MPD > ${name} Tab: Retry ${retries} failed. Retrying...`);
          await page.waitForTimeout(RETRY_TIMEOUT);
        } else {
          console.warn(`❌ Unable to retrieve the 'Last updated' timestamp for MPD > ${name} tab.`);
        }
      }
    }
  }
});






test('User monitoring for Barwani', async ({ page }) => {
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
  //await page.waitForTimeout(2000);

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




test('Star Rating from MASD and Case Portal Page', async ({ page }) => {
  const loginPage = new LoginPage(page);

  // Step 1: Login
  await loginPage.goTo();
  await loginPage.ValidLogin(dataset.username, dataset.password);

  // Step 2: Click 2nd item in side list (assumed district list)
  await page.getByRole('list').locator('a').nth(1).click();
  await page.waitForTimeout(1000);

  // Step 3: Go to Barwani dashboard
  await loginPage.Barwani();
  await page.waitForTimeout(2000);

  // Step 4: Locate 4th row (index 3) of Case List table
  const caseListRow = page.locator('table.table.table-stripe tbody tr').nth(3);
  await caseListRow.locator('span#path_details').click();

  // Step 5: Wait for modal/dialog to appear & click star icon
  await page.waitForSelector('i.far.fa-star', { timeout: 5000 });
  await expect(page.locator('i.far.fa-star')).toBeVisible({ timeout: 3000 });
  await page.locator('i.far.fa-star').click();

  // Step 6: Try to locate the "As of" date text
  const dateLocator = page.locator('div.p-10.f16', { hasText: 'As of' });
  try {
    await expect(dateLocator).toBeVisible({ timeout: 3000 });
    const starDateText = await dateLocator.textContent();
    console.log(`✅ Star rating for Case List page: ${starDateText.trim()}`);
  } catch {
    console.log('⭐ Star rating is not updated yet (Case List)');
  }

  // Step 7: Close the modal
  await page.locator('#popup_close').click();
  await page.waitForTimeout(1000);

  // Step 8: Navigate to MASD page
  await page.getByRole('list').locator('div img').click();
  await page.getByRole('link', { name: /Member Activity Summary/i }).click();
  await page.waitForLoadState('networkidle');

  // Step 9: Validate star presence for 4th user in MASD table
  const masdRow = page.locator('table.table.table-stripe tbody tr').nth(3);
  const masdUserName = await masdRow.locator('td').nth(1).locator('div.fw500').textContent();
  const masdStarCount = await masdRow.locator('i.star-icon.full').count();

  if (masdStarCount > 0) {
    console.log(`⭐ ${masdStarCount} star(s) present for ${masdUserName.trim()} (MASD page)`);
  } else {
    console.log(`❌ Star rating not updated for ${masdUserName.trim()} (MASD page)`);
  }

  // Step 10: Navigate to User Monitoring dashboard
  await page.getByRole('list').locator('div img').click();
  await page.locator('#dashboard').click();

  // Step 11: Click first UPC to open user profile
  const firstRow = page.locator('#patient_lists tbody tr').nth(1);
  await expect(firstRow).toBeVisible({ timeout: 7000 });

  const upcUserCell = firstRow.locator('.uline-hov.dblock');
  const upcUserName = await upcUserCell.textContent();
  await upcUserCell.click();
  console.log(`✅ Opened profile of: ${upcUserName?.trim()}`);

  // Step 12: Click the Timeline tab
  const timelineTab = page.getByRole('tab', { name: /Timeline/i });
  await expect(timelineTab).toBeVisible({ timeout: 5000 });
  await timelineTab.scrollIntoViewIfNeeded();
  await timelineTab.click();
  await page.waitForTimeout(1000);

  // Step 13: Check star rating for first entry in Timeline table
const timelineFirstRow = page.locator('.rc-tabs-tabpane-active table tbody tr').first();
await expect(timelineFirstRow).toBeVisible({ timeout: 5000 });

// ✅ Look for badge with number (inside badge-2 span)
const badge = timelineFirstRow.locator('span.badge-2');
let badgeText = '';
try {
  await expect(badge).toBeVisible({ timeout: 3000 });
  badgeText = await badge.textContent();
} catch {}

const timelineUserName = await timelineFirstRow.locator('td').first().textContent();

if (badgeText && /\d/.test(badgeText)) {
  console.log(`⭐ Star rating badge shows "${badgeText.trim()}" in Timeline for ${timelineUserName?.trim()}`);
} else {
  console.log(`❌ No star rating in Timeline for ${timelineUserName?.trim()}`);
}

});
