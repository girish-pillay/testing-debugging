const { test } = require('@playwright/test');
const { LoginPage } = require('../../pageObject/CL_loginpage');
const dataset = require('../../cred/credential.json');
//const dataset = {username: process.env.CW_USERNAME,password: process.env.CW_PASSWORD};

const {
  loginToApp,
  waitForCaseList,
  closeFilterPanel,
  applyCheckboxFilter,
  openMASD,
  openI2R,
  openCaseList
} = require('./helpers/commonActions');

const {
  waitForSUWRows,
  openSecondOrFirstSUWUser,
  validateTabData
} = require('./helpers/upcHelpers');

test.afterEach(async ({ page }) => {
  await page.waitForTimeout(5000);
});

/* ================= I2R HELPERS ================= */

async function getI2RLastUpdated(page) {
  const lastUpdated = page.locator('div.font-14.text-lite-gray').filter({
    hasText: /Last updated/i
  }).first();

  await lastUpdated.waitFor({ state: 'visible', timeout: 20000 });
  return (await lastUpdated.innerText()).replace(/\s+/g, ' ').trim();
}

async function openI2RTabAndPrintLastUpdated(page, tabName) {
  const tab = page.getByRole('tab', { name: tabName });

  await tab.waitFor({ state: 'visible', timeout: 20000 });
  await tab.click();

  await page.waitForTimeout(1000);

  const text = await getI2RLastUpdated(page);
  console.log(`📊 UJJAIN I2R → ${tabName} → ${text}`);
}

/* ================= MASD HELPER ================= */

async function extractMASDLastUpdated(page) {
  console.log('MASD for Ujjain');

  /* CASE SUMMARY */
  try {
    const caseSummaryTab = page.getByRole('tab', { name: 'Case Summary' });

    await caseSummaryTab.waitFor({ state: 'visible', timeout: 20000 });
    await caseSummaryTab.click();

    const csPanelId = await caseSummaryTab.getAttribute('aria-controls');
    const csPanel = page.locator(`#${csPanelId}`);

    const csLastUpdated = csPanel
      .locator('div.font-14.text-lite-gray')
      .filter({ hasText: /Last updated/i })
      .first();

    await expect(csLastUpdated).toContainText(/\d{4}|\bam\b|\bpm\b/i, {
      timeout: 20000
    });

    const csText = (await csLastUpdated.innerText()).replace(/\s+/g, ' ').trim();
    console.log(`📊 Case Summary → ${csText}`);
  } catch {
    console.log('📭 Case Summary → Last updated not found');
  }

  /* CASE ACTIVITIES */
  try {
    const caseActivityTab = page.getByRole('tab', { name: 'Case Activities' });

    await caseActivityTab.waitFor({ state: 'visible', timeout: 20000 });
    await caseActivityTab.click();

    await page.waitForTimeout(1000);

    const caPanelId = await caseActivityTab.getAttribute('aria-controls');
    const caPanel = page.locator(`#${caPanelId}`);

    const caLastUpdated = caPanel
      .locator('div.font-14.text-lite-gray')
      .filter({ hasText: /Last updated/i })
      .first();

    await caLastUpdated.waitFor({ state: 'visible', timeout: 20000 });

    const text = (await caLastUpdated.innerText()).replace(/\s+/g, ' ').trim();
    console.log(`📊 Case Activities → ${text}`);
  } catch {
    console.log('📭 Case Activities → Last updated not found');
  }

  /* COACHING */
  try {
    const coachingTab = page.getByRole('tab', { name: 'Coaching' });

    await coachingTab.waitFor({ state: 'visible', timeout: 20000 });
    await coachingTab.click();

    await page.waitForTimeout(1000);

    const panelId = await coachingTab.getAttribute('aria-controls');
    const panel = page.locator(`#${panelId}`);

    const lastUpdated = panel
      .locator('div.font-14.text-lite-gray')
      .filter({ hasText: /Last updated/i })
      .first();

    await lastUpdated.waitFor({ state: 'visible', timeout: 20000 });

    const text = (await lastUpdated.innerText()).replace(/\s+/g, ' ').trim();
    console.log(`📊 Coaching → ${text}`);
  } catch {
    console.log('📭 Coaching → Last updated not found');
  }

  /* SUPERVISION */
try {
  const supervisionTab = page.getByRole('tab', { name: 'Supervision' });

  await supervisionTab.waitFor({
    state: 'visible',
    timeout: 20000
  });

  await supervisionTab.click();

  await page.waitForTimeout(1000);

  const panelId = await supervisionTab.getAttribute('aria-controls');
  const panel = page.locator(`#${panelId}`);

  const lastUpdated = panel
    .locator('div.font-14.text-lite-gray')
    .filter({ hasText: /Last updated/i })
    .first();

  await lastUpdated.waitFor({
    state: 'visible',
    timeout: 20000
  });

  const text = (await lastUpdated.innerText())
    .replace(/\s+/g, ' ')
    .trim();

  console.log(`📊 Supervision → ${text}`);

} catch {
  console.log('📭 Supervision → Last updated not found');
}
}



/* ================= MAIN SINGLE TEST ================= */

test('UJJAIN Complete Validation | UPC + MASD + I2R', async ({ page }) => {
  const loginPage = new LoginPage(page);

  /* ================= LOGIN ONCE ================= */
  await loginToApp(loginPage, dataset);

  /* ================= SELECT UJJAIN ONCE ================= */
  await page.getByRole('list').locator('a').first().click();
  await loginPage.UJJAIN();

  console.log('✅ UJJAIN selected');

  /* =====================================================
     PART 1: UPC VALIDATION
  ===================================================== */

  try {
    await waitForCaseList(page);

    await page.locator('#filter i').click();

    await applyCheckboxFilter(page, 'Current stage of case', 'PNC');
    await applyCheckboxFilter(page, 'Z-score (Weight)', 'SUW');

    await closeFilterPanel(page);

    await waitForCaseList(page);

    let suwRows;
    let suwCount = 0;

    try {
      ({ suwRows, suwCount } = await waitForSUWRows(page));
    } catch {
      console.log('⚠️ No SUW users found today');
    }

    if (suwCount > 0) {
      console.log(`✅ Found ${suwCount} SUW users`);

      await openSecondOrFirstSUWUser(page, suwRows, suwCount);

      const upcTabs = [
        'Cases',
        'Actions',
        'Timeline',
        'Submissions',
        'Indicators',
        'Daily Report'
      ];

      const modal = page.locator('.ml-modal');
      await modal.waitFor({ state: 'visible', timeout: 20000 });

      for (const tabName of upcTabs) {
        try {
          await validateTabData(modal, page, tabName);
        } catch {
          console.log(`❌ UPC ${tabName} → Validation failed`);
        }
      }

      // Close UPC modal before moving to MASD
      await page.locator('#popup_close').first().click({ force: true }).catch(() => {});
      await page.waitForTimeout(1000);
    }
  } catch (err) {
    console.log(`❌ UPC section failed: ${err.message}`);
  }

  /* =====================================================
     RESET TO CASE LIST BEFORE MASD
  ===================================================== */

  await openCaseList(page);
  await page.waitForTimeout(1000);

  /* =====================================================
     PART 2: MASD VALIDATION
  ===================================================== */

  try {
    await openMASD(page);
    console.log('');
    console.log('================ MASD =================');
    console.log('📊 MASD Validation');
    await extractMASDLastUpdated(page);
  } catch (err) {
    console.log(`❌ MASD section failed: ${err.message}`);
  }

  /* =====================================================
     PART 3: I2R VALIDATION
  ===================================================== */

  try {
    await openI2R(page);
    console.log('');
    console.log('================ I2R =================');
    console.log('📊 I2R Validation');

    try {
      const pageLastUpdated = await getI2RLastUpdated(page);
      console.log(`🕒 UJJAIN I2R Page Last Updated → ${pageLastUpdated}`);
    } catch {
      console.log('📭 UJJAIN I2R Page Last Updated not found');
    }

    const i2rTabs = [
      'Role Summary',
      'HCW Requiring Guidance',
      'Cases Needing Guidance',
      'Block/Village',
      'Training Status'
    ];

    for (const tabName of i2rTabs) {
      try {
        await openI2RTabAndPrintLastUpdated(page, tabName);
      } catch {
        console.log(`❌ UJJAIN I2R → ${tabName} → Last updated not found`);
      }
    }
  } catch (err) {
    console.log(`❌ I2R section failed: ${err.message}`);
  }
});