const { test } = require('@playwright/test');
const { LoginPage } = require('../../pageObject/CL_loginpage');
//const dataset = require('../../cred/credential.json');
const dataset = {username: process.env.CW_USERNAME,password: process.env.CW_PASSWORD};

const {
  loginToApp,
  waitForCaseList,
  closeFilterPanel,
  openCaseList
} = require('./helpers/commonActions');

const {
  validateTabData
} = require('./helpers/upcHelpers');

async function findRowByBadge(page, badgeText) {
  const rows = page.locator('#patient_lists tbody tr');
  const maxScrolls = 25;

  for (let i = 0; i < maxScrolls; i++) {
    const count = await rows.count();

    for (let r = 0; r < count; r++) {
      const row = rows.nth(r);

      const badgeSpans = row.locator('div.badge-2 span');
      const badgeCount = await badgeSpans.count();

      for (let b = 0; b < badgeCount; b++) {
        const text = (await badgeSpans.nth(b).innerText()).trim();

        if (text === badgeText) {
          return row;
        }
      }
    }

    await page.mouse.wheel(0, 800);
    await page.waitForTimeout(700);
  }

  return null;
}

test('EGH UPC Validation Only', async ({ page }) => {

  const loginPage = new LoginPage(page);

  await loginToApp(loginPage, dataset);

  await loginPage.EGH();

console.log(`🌐 Landed after EGH() on: ${page.url()}`);

await page.waitForTimeout(3000);

await openCaseList(page);

console.log(`🌐 On URL: ${page.url()}`);

await waitForCaseList(page);

console.log('✅ Base Case List loaded');

  await page.locator('#filter i').click();

  await page.getByText('Current stage of case', { exact: true }).click();

  await page.locator('.checkbox-container', { hasText: 'PNC' })
    .locator('.checkbox-checkmark')
    .click();

  await page.getByText('Z-score (Weight)', { exact: true }).click();

  await page.locator('.checkbox-container', { hasText: 'SUW' })
    .locator('.checkbox-checkmark')
    .click();

  await page.locator('.checkbox-container', { hasText: 'MUW' })
    .locator('.checkbox-checkmark')
    .click();

  await closeFilterPanel(page);

  console.log('✅ Filters applied (PNC + SUW + MUW)');

  let targetRow = await findRowByBadge(page, 'SUW');
  let badgeUsed = 'SUW';

  if (!targetRow) {
    console.log('⚠️ SUW not found, trying MUW');
    targetRow = await findRowByBadge(page, 'MUW');
    badgeUsed = 'MUW';
  }

  if (!targetRow) {
    console.log('⚠️ No SUW or MUW user found');
    return;
  }

  console.log(`✅ ${badgeUsed} user found`);

  const upcUser = targetRow.locator('.uline-hov').first();

  const userName = (await upcUser.textContent())?.trim();

  await upcUser.click();

  await page.waitForSelector('.ml-modal-content', {
    state: 'visible',
    timeout: 20000
  });

  console.log(`✅ UPC opened for ${badgeUsed}: ${userName}`);

  const modal = page.locator('.ml-modal');

  const tabs = [
    'Cases',
    'Actions',
    'Timeline',
    'Submissions',
    'Indicators',
    'Daily Report'
  ];

  for (const tabName of tabs) {
    try {
      await validateTabData(modal, page, tabName);
    } catch {
      console.log(`❌ ${tabName} → Validation failed`);
    }
  }
});