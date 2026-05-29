const { test, expect } = require('@playwright/test');
const { LoginPage } = require('../../pageObject/loginpage');
//const dataset = JSON.parse(JSON.stringify(require('../../cred/credential.json')));
const dataset = {
  username: process.env.CW_USERNAME,
  password: process.env.CW_PASSWORD
  };

const EXPECTED_FILES = [
  'ANC',
  'ANC_Follow_Up',
  'Birth_History_(Gravida)',
  'Check_baby_indicators',
  'Child_delivery',
  'Family_details',
  'Immunization',
  'MCJ_Case_Measurements',
  'MCJ_Case_Report',
  'Mother',
  'PW_Mother_Education_Occupation'
];

function parseBackupDate(dateText) {
  return new Date(dateText);
}

function daysOld(fileDate) {
  const today = new Date();
  const diff = today - fileDate;
  return Math.floor(diff / (1000 * 60 * 60 * 24));
}

test('Validate consolidated report file names, size and date', async ({ page }) => {
  test.setTimeout(5 * 60 * 1000);

  const loginPage = new LoginPage(page);

  await loginPage.goTo();
  await loginPage.ValidLogin(dataset.username, dataset.password);

  await page.getByRole('list').locator('a').nth(0).click();
  await page.waitForTimeout(1000);

  await loginPage.KCorpAROEHAN();
  await page.waitForTimeout(2000);

  const orgBackupLink = page.getByRole('link', { name: /Org Backup Data/i });
  await expect(orgBackupLink).toBeVisible({ timeout: 10000 });

  const href = await orgBackupLink.getAttribute('href');
  if (!href) throw new Error('❌ Could not retrieve Org Backup link');

  const backupURL = new URL(href, page.url()).toString();

  await page.goto(backupURL, {
    waitUntil: 'load',
    timeout: 20000
  });

  await expect(page).toHaveURL(/\/backup/, { timeout: 10000 });
  console.log('✅ Backup page opened');

  const consolidatedTab = page.getByRole('tab', {
    name: /Consolidated Reports/i
  });

  await consolidatedTab.click();
  await page.waitForTimeout(1000);

  const panelId = await consolidatedTab.getAttribute('aria-controls');
  const consolidatedPanel = page.locator(`#${panelId}`);

  await consolidatedPanel.locator('tbody tr').first().waitFor({
    state: 'visible',
    timeout: 15000
  });

  const rowsCount = await consolidatedPanel.locator('tbody tr').count();

  const foundFiles = [];
  const staleFiles = [];
  const missingFiles = [];

  console.log('\n================================================');
  console.log('📊 CONSOLIDATED REPORT FILE STATUS');
  console.log('================================================\n');

  for (let i = 0; i < rowsCount; i++) {
    const row = consolidatedPanel.locator('tbody tr').nth(i);

    const fileName = ((await row.locator('td').nth(1).textContent()) || '').trim();
    const size = ((await row.locator('td').nth(2).textContent()) || '').trim();
    const dateText = ((await row.locator('td').nth(3).textContent()) || '').trim();

    if (!EXPECTED_FILES.includes(fileName)) continue;

    foundFiles.push(fileName);

    const fileDate = parseBackupDate(dateText);

    if (Number.isNaN(fileDate.getTime())) {
      staleFiles.push({ fileName, size, dateText, age: 'Invalid date' });
      console.log(`❌ Invalid date | ${fileName} | Size: ${size} | Date: ${dateText}`);
      continue;
    }

    const age = daysOld(fileDate);
    const status = age <= 2 ? '✅ Up to date' : '❌ Not up to date';

    console.log(`${status} | ${fileName} | Size: ${size} | Date: ${dateText} | Age: ${age} days`);

    if (age > 2) {
      staleFiles.push({ fileName, size, dateText, age });
    }
  }

  for (const expectedFile of EXPECTED_FILES) {
    if (!foundFiles.includes(expectedFile)) {
      missingFiles.push(expectedFile);
    }
  }

  console.log('\n================================================');
  console.log('📌 SUMMARY');
  console.log('================================================');

  console.log(`Total Expected Files: ${EXPECTED_FILES.length}`);
  console.log(`Total Found Files: ${foundFiles.length}`);
  console.log(`Missing Files: ${missingFiles.length}`);
  console.log(`Not Up To Date Files: ${staleFiles.length}`);

  if (missingFiles.length > 0) {
    console.log('\n❌ Missing Files:');
    missingFiles.forEach(file => console.log(`- ${file}`));
  }

  if (staleFiles.length > 0) {
    console.log('\n❌ Not Up To Date Files:');
    staleFiles.forEach(file => {
      console.log(`- ${file.fileName} | Size: ${file.size} | Date: ${file.dateText} | Age: ${file.age}`);
    });
  }

  expect(missingFiles.length).toBe(0);
  expect(staleFiles.length).toBe(0);

  console.log('\n✅ Consolidated report validation completed');
});