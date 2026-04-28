const { expect } = require('@playwright/test');

async function loginToApp(loginPage, dataset) {
  await loginPage.goTo();
  await loginPage.ValidLogin(dataset.username, dataset.password);
}

async function waitForCaseList(page) {
  await expect(page.locator('#patient_lists')).toBeVisible({ timeout: 30000 });
  await page.waitForSelector('#patient_lists tbody tr', { timeout: 30000 });
}

async function openCaseList(page) {
  await page.goto('https://demo.cuedwell.com/health/table', {
    waitUntil: 'domcontentloaded'
  });
  await expect(page).toHaveURL(/\/health\/table/, { timeout: 30000 });
}

async function closeFilterPanel(page) {
  try {
    await page.keyboard.press('Escape');
  } catch {}

  try {
    await page.mouse.click(50, 200);
  } catch {}

  await page.waitForTimeout(500);
}

async function applyCheckboxFilter(page, sectionText, optionText) {
  await page.getByText(sectionText, { exact: true }).click();

  const option = page
    .locator('.checkbox-container', { hasText: optionText })
    .locator('.checkbox-checkmark');

  await option.scrollIntoViewIfNeeded().catch(() => {});
  await option.click({ timeout: 10000 });
  await page.waitForTimeout(500);
}

async function openMASD(page) {
   // 🔥 CLOSE POPUP FIRST
  const popup = page.locator('#popup_close').first();
  if (await popup.isVisible().catch(() => false)) {
    await popup.click({ force: true });
    await page.waitForTimeout(800);
  }
  const menuIcon = page.locator('li[data-tip="View main menu"] img');
  await menuIcon.waitFor({ state: 'visible', timeout: 15000 });
  await menuIcon.click();

  const masdLink = page.locator('a#member_ppt_process_report[href="/members/mcj/activity"]');
  await masdLink.waitFor({ state: 'visible', timeout: 20000 });

  await Promise.all([
    page.waitForURL(/\/members\/mcj\/activity/, { timeout: 30000 }),
    masdLink.click()
  ]);

  await page.waitForSelector('[role="tab"]', { timeout: 30000 });
}

/* ================= OPEN I2R ================= */
async function openI2R(page) {
  // Close popup if present
  const popup = page.locator('#popup_close').first();

  if (await popup.isVisible().catch(() => false)) {
    await popup.click({ force: true });
    await page.waitForTimeout(1000);
  }

  // Directly open I2R page
  await page.goto('https://demo.cuedwell.com/health/comment_review/page', {
    waitUntil: 'domcontentloaded'
  });

  await expect(page).toHaveURL(/\/health\/comment_review\/page/, {
    timeout: 30000
  });

  // Wait for I2R tabs
  const i2rReady = page.locator('[role="tab"]').filter({
    hasText: /Role Summary|HCW Requiring Guidance|Cases Needing Guidance|Block\/Village|Training Status/i
  }).first();

  await expect(i2rReady).toBeVisible({ timeout: 30000 });

  // Confirm Last updated exists
  const lastUpdated = page.locator('div.font-14.text-lite-gray').filter({
    hasText: /Last updated/i
  }).first();

  await expect(lastUpdated).toContainText(/\d{4}|\bam\b|\bpm\b/i, {
    timeout: 30000
  });
}

module.exports = {
  loginToApp,
  waitForCaseList,
  closeFilterPanel,
  applyCheckboxFilter,
  openMASD,
  openCaseList,
  openI2R
};
