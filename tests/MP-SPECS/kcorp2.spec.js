// // const { test, expect } = require('@playwright/test');
// // const { LoginPage } = require('../pageObject/loginpage');
// // const dataset = JSON.parse(JSON.stringify(require('../cred/credential.json')));

// // const MAX_RETRIES = 5;
// // const RETRY_TIMEOUT = 2000;

// // const validateTabs = async (page, tabs) => {
// //   for (const tabName of tabs) {
// //     for (let i = 0; i < MAX_RETRIES; i++) {
// //       try {
// //         const tabBtn = page.getByRole('tab', { name: tabName });
// //         await expect(tabBtn).toBeVisible({ timeout: 15000 });

// //         const panelId = await tabBtn.getAttribute('aria-controls');
// //         if (!panelId) throw new Error(`Missing aria-controls on tab: ${tabName}`);

// //         await tabBtn.click();
// //         await page.waitForTimeout(1000);

// //         const timestamp = page.locator(`#${panelId}`).locator('div.font-14.text-lite-gray', { hasText: 'Last updated' }).first();
// //         await expect(timestamp).toBeVisible({ timeout: 10000 });

// //         const text = await timestamp.innerText();
// //         if (!text || text.trim().endsWith(':')) {
// //           throw new Error(`❌ ${tabName} tab has empty/invalid timestamp: "${text}"`);
// //         }

// //         console.log(`✅ ${tabName} Last updated : ${text}`);
// //         break;
// //       } catch (err) {
// //         console.warn(`⚠️ ${tabName} tab retry ${i + 1} failed: ${err.message}`);
// //         if (i === MAX_RETRIES - 1) {
// //           throw new Error(`❌ Failed to validate ${tabName} after ${MAX_RETRIES} retries.`);
// //         }
// //         await page.waitForTimeout(RETRY_TIMEOUT);
// //       }
// //     }
// //   }
// // };

// // const runMASDTest = (methodName, label) => {
// //   test(`MASD for KCorp_${label}`, async ({ page }) => {
// //     console.log(`⏳ Waiting 10s before starting ${label}...`);
// //     await page.waitForTimeout(10000);

// //     const loginPage = new LoginPage(page);
// //     await loginPage.goTo();
// //     await loginPage.ValidLogin(dataset.username, dataset.password);

// //     await page.getByRole('list').locator('a').nth(1).click();
// //     await page.waitForTimeout(1000);
// //     await loginPage[methodName]();
// //     await page.waitForTimeout(1000);
// //     await page.getByRole('list').locator('div img').click();
// //     await page.waitForTimeout(1000);

// //     const masdLink = page.getByRole('link', { name: /Member Activity Summary/i });
// //     await expect(masdLink).toBeVisible({ timeout: 10000 });
// //     await masdLink.evaluate(el => el.click());

// //     await page.waitForLoadState('networkidle');
// //     await expect(page.locator('.rc-tabs-nav')).toBeVisible({ timeout: 20000 });
// //     await expect(page.locator('.rc-tabs-nav-wrap')).toBeVisible({ timeout: 20000 });

// //     const tabs = ['Case Summary', 'Case Activities', 'Coaching'];
// //     await validateTabs(page, tabs);
// //   });
// // };

// // runMASDTest('KCorpAROEHAN', 'AROEHAN');
// // runMASDTest('KCorp_BAIF', 'BAIF');
// // runMASDTest('KCorp_BRB', 'BRB');
// // runMASDTest('KCorp_CRY', 'CRY');
// // runMASDTest('KCorp_UWM', 'UWM');

// // test('Org backup for KCorp', async ({ page }) => {
// //   const loginPage = new LoginPage(page);
// //   await loginPage.goTo();
// //   await loginPage.ValidLogin(dataset.username, dataset.password);

// //   await page.getByRole('list').locator('a').nth(1).click();
// //   await page.getByRole('heading', { name: 'KCorp Foundation -' }).click();
// //   await page.getByRole('heading', { name: 'KCorp Foundation - AROEHAN' }).click();
// //   await page.getByRole('button', { name: '⨉' }).click();
// //   await page.getByRole('list').locator('div img').click();

// //   const backupLink = page.getByRole('link', { name: 'Org Backup Data' });
// //   await expect(backupLink).toBeVisible({ timeout: 30000 });

// //   let success = false;
// //   for (let i = 0; i < 3; i++) {
// //     await backupLink.evaluate(el => el.click());
// //     await page.waitForTimeout(3000);
// //     if (page.url().includes('/backup')) {
// //       success = true;
// //       console.log(`✅ Org Backup page opened successfully on attempt ${i + 1}`);
// //       break;
// //     } else {
// //       console.warn(`⚠️ Attempt ${i + 1} failed. Retrying...`);
// //       await page.goBack();
// //       await page.waitForTimeout(2000);
// //     }
// //   }

// //   if (!success) throw new Error('❌ Failed to open Org Backup page');

// //   console.log('✅ Confirmed Org Backup URL');

// //   const filenames = [];
// //   const dates = [];

// //   for (let pageNum = 1; pageNum <= 2; pageNum++) {
// //     const rows = page.locator('table tr');
// //     await expect(rows.first()).toBeVisible({ timeout: 30000 });

// //     const rowCount = await rows.count();
// //     for (let j = 0; j < rowCount; j++) {
// //       const cells = rows.nth(j).locator('td');
// //       if (await cells.count() < 3) continue;

// //       const id = await cells.nth(0).innerText(); // column index 0 = row number
// //       const filename = await cells.nth(1).innerText();
// //       const date = await cells.nth(2).innerText();

// //       filenames.push(filename.trim());
// //       dates.push(date.trim());

// //       if (pageNum === 2 && id === '10') {
// //         console.log('✅ Reached row 10 on page 2 — stopping early.');
// //         pageNum = 99; // force outer loop break
// //         break;
// //       }
// //     }

// //     if (pageNum === 1) {
// //       const page2Btn = page.locator('li.pagination-item', { hasText: '2' });
// //       if (await page2Btn.isVisible({ timeout: 5000 })) {
// //         await page2Btn.click();
// //         await page.waitForTimeout(3000);
// //       } else {
// //         console.log('ℹ️ No second page found — exiting pagination.');
// //         break;
// //       }
// //     }
// //   }

// //   console.log(`Total filenames collected: ${filenames.length}`);
// //   for (let i = 0; i < filenames.length; i++) {
// //     console.log(`${filenames[i].padEnd(60)} ${dates[i]}`);
// //   }
// // });





// const { test, expect } = require('@playwright/test');
// const { LoginPage } = require('../pageObject/loginpage');
// const dataset = JSON.parse(JSON.stringify(require('../cred/credential.json')));

// // --- Constants ---
// const NGOs = ['BAIF_BISLD', 'AROEHAN', 'Bal_Raksha_Bharat', 'CRY', 'United_Way_Mumbai'];
// const PREFIXES = [
//   'MCJ_Case_Measurements',
//   'MCJ_Case_Report',
//   'Check_baby_indicators',
//   'Child_delivery',
//   'Mother',
//   'ANC_Follow_Up',
//   'ANC'
// ];

// test('Org Backup Full File Extraction with Timestamps', async ({ page }) => {
//   const loginPage = new LoginPage(page);
//   await loginPage.goTo();
//   await loginPage.ValidLogin(dataset.username, dataset.password);

//   await page.getByRole('list').locator('a').nth(1).click();
//   await page.getByRole('heading', { name: 'KCorp Foundation -' }).click();
//   await page.getByRole('heading', { name: 'KCorp Foundation - AROEHAN' }).click();
//   await page.getByRole('button', { name: '⨉' }).click();
//   await page.getByRole('list').locator('div img').click();

//   await page.getByRole('link', { name: /Org Backup Data/i }).click();
//   await expect(page).toHaveURL(/\/backup/);
//   await page.waitForTimeout(2000);
//   console.log('✅ Confirmed Org Backup URL');

//   const allFiles = [];

//   const extractFilesFromTable = async () => {
//     const activeTabPanel = page.locator('.rc-tabs-tabpane-active');
//     const rows = await activeTabPanel.locator('table.table-stripe tbody tr').all();

//     console.log(`🔎 Found ${rows.length} rows in table`);
//     for (const row of rows) {
//       const fileCell = row.locator('td').nth(1);
//       const dateCell = row.locator('td').nth(2);
//       const filename = (await fileCell.textContent())?.trim();
//       const fileDate = (await dateCell.textContent())?.trim();
//       if (filename) {
//         //console.log(`📄 Found: ${filename} | Date: ${fileDate}`);
//         allFiles.push(filename);
//       }
//     }
//   };

//   // Extract Page 1
//   //console.log('🧩 Extracting Page 1 files...');
//   await extractFilesFromTable();

//   // Try Page 2
//   const page2Button = page.getByRole('listitem').filter({ hasText: /^2$/ });
//   await page2Button.dblclick();  // instead of click({ force: true })

//   if (await page2Button.count() === 1 && await page2Button.first().isVisible()) {
//     let clicked = false;
//     for (let attempt = 1; attempt <= 3 && !clicked; attempt++) {
//       try {
//         await page2Button.first().scrollIntoViewIfNeeded();
//         await page.waitForTimeout(500);
//         await page2Button.first().click({ timeout: 5000, force: true });
//         clicked = true;
//         console.log('🧩 Extracting Page 2 files...');
//         await page.waitForTimeout(2000);
//         await extractFilesFromTable();
//       } catch (error) {
//         console.warn(`🔁 Retry ${attempt}: Failed to click Page 2 button`);
//         if (page.isClosed()) {
//           console.error('❌ Page is already closed. Stopping retries.');
//           break;
//         }
//         await page.waitForTimeout(1000);
//       }
//     }
//   }

//   console.log(`📦 Total Org Backup files found: ${allFiles.length}\n`);

//   // Detect latest date
//   const dateMatches = allFiles
//     .map(f => f.match(/\d{4}-\d{2}-\d{2}/))
//     .filter(Boolean)
//     .map(m => m[0]);

//   let FILE_DATE = '';
//   if (dateMatches.length) {
//     FILE_DATE = dateMatches.sort().reverse()[0];
//     console.log(`🗓️  Using latest file date for comparison: ${FILE_DATE}`);
//   } else {
//     throw new Error('❌ No valid date found in filenames');
//   }

//   // Generate expected filenames using latest date
//   const EXPECTED_FILES = [];
//   for (const ngo of NGOs) {
//     for (const prefix of PREFIXES) {
//       EXPECTED_FILES.push(`${prefix}_${ngo}_${FILE_DATE}.csv`);
//     }
//   }

//   // Compare actual vs expected
//   const foundSet = new Set(allFiles);

//   const dayjs = require('dayjs');
// const now = dayjs();
// console.log(`\n🕒 Test Run Timestamp: ${now.format('YYYY-MM-DD HH:mm:ss')}`);

// console.log('\n📋 Org Backup File Check (prefix+NGO matching):');
// let totalMatched = 0;
// let totalMissing = 0;

// for (const ngo of NGOs) {
//   console.log(`\n🔹 NGO: ${ngo}`);
//   let matched = 0;
//   let missing = 0;

//   for (const prefix of PREFIXES) {
//     const expectedFile = `${prefix}_${ngo}_${FILE_DATE}.csv`;
//     const datePart = FILE_DATE;
//     const fileDate = dayjs(datePart);
//     const ageInDays = now.diff(fileDate, 'day');
//     const freshnessMark = ageInDays <= 2 ? '✅' : '❌';

//     if (foundSet.has(expectedFile)) {
//       console.log(`   ${freshnessMark} ${expectedFile} → Found`);
//       matched++;
//     } else {
//       console.log(`   ❌ ${expectedFile} → Not Found`);
//       missing++;
//     }
//   }

//   console.log(`   📊 Summary for ${ngo}: Available = ${matched}, Missing = ${missing}`);
//   totalMatched += matched;
//   totalMissing += missing;
// }

// console.log(`\n🧮 Grand Total Matched: ${totalMatched}/${EXPECTED_FILES.length}`);
// console.log(`🧮 Grand Total Missing: ${totalMissing}/${EXPECTED_FILES.length}`);

// });


const { test, expect } = require('@playwright/test');
const { LoginPage } = require('../pageObject/loginpage');
const dataset = JSON.parse(JSON.stringify(require('../cred/credential.json')));

const EXPECTED_PREFIXES = [
  'MCJ_Case_Measurements',
  'MCJ_Case_Report',
  'Check_baby_indicators',
  'Child_delivery',
  'Mother',
  'ANC_Follow_Up',
  'ANC',
  'PW_Mother_Education_Occupation',
  'Birth_History_(Gravida)',
  'Family_details'
];

const NGO_NAMES = [
  'BAIF_BISLD',
  'AROEHAN',
  'Bal_Raksha_Bharat',
  'CRY',
  'United_Way_Mumbai',
  'CYDA'
];

function daysBetween(date1, date2) {
  const diffTime = Math.abs(date2 - date1);
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

test('Org Backup File Check (Match key, check age)', async ({ page }) => {
  const loginPage = new LoginPage(page);
  await loginPage.goTo();
  await loginPage.ValidLogin(dataset.username, dataset.password);

  await page.getByRole('list').locator('a').nth(1).click();
  await page.waitForTimeout(1000);
  await loginPage.KCorpAROEHAN();
  await page.waitForTimeout(2000);

  const orgBackupLink = page.getByRole('link', { name: /Org Backup Data/i });
  await expect(orgBackupLink).toBeVisible({ timeout: 10000 });

  const href = await orgBackupLink.getAttribute('href');
  if (!href) throw new Error('❌ Could not retrieve href from Org Backup link');

  const backupURL = new URL(href, page.url()).toString();
  console.log(`🔗 Navigating directly to Org Backup URL: ${backupURL}`);
  await page.goto(backupURL, { waitUntil: 'load', timeout: 20000 });
  await expect(page).toHaveURL(/\/backup/, { timeout: 10000 });
  console.log('✅ Confirmed Org Backup URL');

  const allRows = [];

  const MAX_PAGES = 3;
  await page.waitForSelector('tbody tr', { timeout: 10000 });

  for (let pageNum = 1; pageNum <= MAX_PAGES; pageNum++) {
    if (pageNum > 1) {
      console.log(`⏭️ Navigating to Page ${pageNum}...`);

      const button = page.locator('.pagination-item', { hasText: `${pageNum}` }).first();
      await expect(button).toBeVisible({ timeout: 7000 });
      await button.click();

      await page.waitForSelector('tbody tr', { timeout: 10000 });
      await page.waitForTimeout(1000);
    }

    const rows = await page.$$eval('tbody tr', trs =>
      trs.map(tr => {
        const cells = tr.querySelectorAll('td');
        return {
          filename: cells[1]?.textContent.trim() || '',
          dateStr: cells[2]?.textContent.trim() || ''
        };
      }).filter(r => r.filename)
    );

    if (rows.length === 0) {
      console.warn(`⚠️ Page ${pageNum} had 0 rows`);
    } else {
      console.log(`📄 Page ${pageNum}: Found ${rows.length} rows`);
      allRows.push(...rows);
    }
  }

  console.log(`\n📄 Extracted Filenames (${allRows.length} total):`);
  allRows.forEach((row, i) => {
    console.log(`${String(i + 1).padStart(2, '0')}. ${row.filename} (${row.dateStr})`);
  });

  console.log(`📦 Total files extracted: ${allRows.length}\n`);
  const today = new Date();

  for (const ngo of NGO_NAMES) {
    console.log(`🔹 NGO: ${ngo}`);

    let matched = 0;
    let missing = 0;

    for (const prefix of EXPECTED_PREFIXES) {
      const key = `${prefix}_${ngo}`;
      const match = allRows.find(row => row.filename.startsWith(key));
      if (match) {
        const fileDate = new Date(match.dateStr);
        const isFresh = daysBetween(fileDate, today) <= 2;
        const freshness = isFresh ? '✅' : '❌';
        console.log(`   ✅ ${freshness}  ${key} → Found on ${match.dateStr}`);
        matched++;
      } else {
        console.log(`   ❌ ❌  ${key} → Missing`);
        missing++;
      }
    }

    console.log(`\n   📊 Summary for ${ngo}: ✅ Available = ${matched}, ❌ Missing = ${missing}\n`);
  }

  const timestamp = new Date().toISOString().replace('T', ' ').split('.')[0];
  console.log(`\n🕒 Run Timestamp: ${timestamp}`);
});
