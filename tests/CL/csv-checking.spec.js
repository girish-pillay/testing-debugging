const { test, expect } = require('@playwright/test');
const { LoginPage } = require('../../pageObject/loginpage');
const dataset = require('../../cred/credential.json');
const fs = require('fs');
const path = require('path');
const csv = require('csv-parser');



async function readCSV(filePath) {
  const rows = [];

  return new Promise((resolve, reject) => {
    fs.createReadStream(filePath)
      .pipe(csv())
      .on('data', row => rows.push(row))
      .on('end', () => resolve(rows))
      .on('error', reject);
  });
}
function checkDuplicateSubmitId(rows, fileName) {
  const counts = {};

  for (const row of rows) {
    const submitId = row.Submission_ID?.trim();
    const caseId = row['Case ID']?.trim();

    if (!submitId) continue;

    if (!counts[submitId]) {
      counts[submitId] = {
        count: 0,
        caseIds: new Set()
      };
    }

    counts[submitId].count++;
    
    if (caseId) {
      counts[submitId].caseIds.add(caseId);
    }
  }

  const duplicates = Object.entries(counts)
    .filter(([_, data]) => data.count > 1);

  if (duplicates.length === 0) {
    console.log(`✅ ${fileName} -> No duplicate submit_ID`);
  } else {
    console.log(`❌ ${fileName} -> Duplicate submit_ID found`);

    for (const [submitId, data] of duplicates) {
      console.log(
        `submit_ID: ${submitId} -> ${data.count} times | Case ID: ${[...data.caseIds].join(', ')}`
      );
    }
  }
}

test('Org Backup File Check for SMDT', async ({ page }) => {
  const loginPage = new LoginPage(page);
  await loginPage.goTo();
  await loginPage.ValidLogin(dataset.username, dataset.password);

  await page.getByRole('list').locator('a').nth(1).click();
  await page.waitForTimeout(1000);
  await loginPage.SMDT();
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

  await page.waitForSelector('table tr', { timeout: 15000 });

const downloadDir = path.join(process.cwd(), 'downloads');

if (!fs.existsSync(downloadDir)) {
    fs.rmSync(downloadDir, { recursive: true, force: true });
}

fs.mkdirSync(downloadDir, { recursive: true });

console.log('🧹 Old downloads cleared');

for (let i = 1; i <= 9; i++) {
  const row = page.locator('table tr').nth(i);
  const cells = row.locator('td');

  await expect(row).toBeVisible({ timeout: 10000 });

  const fileName = (await cells.nth(1).textContent()).trim();

  console.log(`⬇️ Downloading row ${i}: ${fileName}`);

  const downloadPromise = page.waitForEvent('download');

  await row.locator('[tooltip="Download CSV"]').click();

  const download = await downloadPromise;
  const filePath = path.join(downloadDir, fileName);

  await download.saveAs(filePath);

  console.log(`✅ Downloaded: ${fileName}`);

  const csvRows = await readCSV(filePath);

  checkDuplicateSubmitId(csvRows, fileName);
}

});







test('Org Backup File Check for Aroehan', async ({ page }) => {
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

  await page.waitForSelector('table tr', { timeout: 15000 });

const downloadDir = path.join(process.cwd(), 'downloads');

if (!fs.existsSync(downloadDir)) {
    fs.rmSync(downloadDir, { recursive: true, force: true });
}

fs.mkdirSync(downloadDir, { recursive: true });

console.log('🧹 Old downloads cleared');

for (let i = 1; i <= 9; i++) {
  const row = page.locator('table tr').nth(i);
  const cells = row.locator('td');

  await expect(row).toBeVisible({ timeout: 10000 });

  const fileName = (await cells.nth(1).textContent()).trim();

  console.log(`⬇️ Downloading row ${i}: ${fileName}`);

  const downloadPromise = page.waitForEvent('download');

  await row.locator('[tooltip="Download CSV"]').click();

  const download = await downloadPromise;
  const filePath = path.join(downloadDir, fileName);

  await download.saveAs(filePath);

  console.log(`✅ Downloaded: ${fileName}`);

  const csvRows = await readCSV(filePath);

  checkDuplicateSubmitId(csvRows, fileName);
}

});