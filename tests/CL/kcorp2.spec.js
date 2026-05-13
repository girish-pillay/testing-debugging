


const { test, expect } = require('@playwright/test');
const { LoginPage } = require('../../pageObject/loginpage');
const dataset = {
  username: process.env.CW_USERNAME,
  password: process.env.CW_PASSWORD
};

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
  'Family_details',
  'Immunization'
];

const NGO_NAMES = [
  'BAIF_BISLD',
  'AROEHAN',
  'Bal_Raksha_Bharat',
  'CRY',
  'United_Way_Mumbai',
  'CYDA',
  'Armman'
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

  const MAX_PAGES = 4;
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

    const rows = await page.$$eval(
  'tbody tr',
  (trs, pageNum) =>
    trs
      .slice(0, pageNum === 4 ? 2 : trs.length)
      .map(tr => {
        const cells = tr.querySelectorAll('td');
        return {
          filename: cells[1]?.textContent.trim() || '',
          dateStr: cells[2]?.textContent.trim() || ''
        };
      })
      .filter(r => r.filename),
  pageNum
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
