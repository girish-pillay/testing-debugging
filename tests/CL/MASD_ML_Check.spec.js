const { test, expect } = require('@playwright/test');
const { LoginPage } = require('../../pageObject/CL_loginpage');
const dataset = require('../../cred/credential.json');
const {
  loginToApp,
  waitForCaseList,
  closeFilterPanel,
  applyCheckboxFilter,
  openMASD
} = require('./helpers/commonActions');

const MAX_RETRIES = 1;
const RETRY_TIMEOUT = 2000;

test('EGH MASD Tab-wise Validation', async ({ page }) => {
  test.setTimeout(10 * 60 * 1000);
  const loginPage = new LoginPage(page);

  await loginToApp(loginPage, dataset);
  /* ================= NAVIGATION ================= */
  await page.getByRole('list').locator('a').first().click();
  await loginPage.EGH();

  await openMASD(page);
  await page.waitForLoadState('networkidle');

  const masdTabs = ['Case Summary', 'Case Activities', 'Coaching', 'Supervision'];
  const failedTabs = [];

  console.log('\n===== MASD Timestamp Summary =====');

  for (const tabName of masdTabs) {
    const tabLocator = page.getByRole('tab', { name: tabName });
    let success = false;

    for (let retries = 1; retries <= MAX_RETRIES; retries++) {
      try {
        await expect(tabLocator).toBeVisible({ timeout: 10000 });

        const isSelected = await tabLocator.getAttribute('aria-selected');

        if (isSelected !== 'true') {
          await tabLocator.click({ force: true });
          await expect(tabLocator).toHaveAttribute('aria-selected', 'true', { timeout: 8000 });
        }

        const panelId = await tabLocator.getAttribute('aria-controls');
        const panel = page.locator(`#${panelId}`);

        await expect(panel).toBeVisible({ timeout: 10000 });
        await expect(panel).toHaveAttribute('aria-hidden', 'false', { timeout: 10000 });

        const timestampLocator = panel.locator('div.font-14.text-lite-gray').filter({
          hasText: 'Last updated'
        }).first();

        await expect(timestampLocator).toBeVisible({ timeout: 10000 });

        const rawText = (await timestampLocator.innerText()).trim();
        const timestamp = extractTimestamp(rawText);

        // ✅ CLEAN OUTPUT ONLY
        console.log(`${tabName.padEnd(18)} : ${timestamp}`);

        success = true;
        break;

      } catch (error) {
        if (retries < MAX_RETRIES) {
          await page.waitForTimeout(RETRY_TIMEOUT);
        }
      }
    }

    if (!success) {
      failedTabs.push(tabName);
      console.log(`${tabName.padEnd(18)} : ❌ Not Found`);
    }
  }

  expect(failedTabs, `Timestamp missing in tabs: ${failedTabs.join(', ')}`).toHaveLength(0);
});


/* ================= HELPER ================= */

function extractTimestamp(rawText) {
  const cleaned = rawText.replace(/\s+/g, ' ').trim();
  const match = cleaned.match(/Last updated\s*:\s*(.+)$/i);

  if (!match || !match[1]) {
    throw new Error(`Invalid timestamp format: ${rawText}`);
  }

  return match[1].trim();
}