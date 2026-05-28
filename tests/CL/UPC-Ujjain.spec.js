

const { test, expect } = require('@playwright/test');
const { LoginPage } = require('../../pageObject/CL_loginpage');
//const dataset = require('../../cred/credential.json');
const dataset = {
  username: process.env.CW_USERNAME,
  password: process.env.CW_PASSWORD
  };
const {
  loginToApp,
  waitForCaseList,
  closeFilterPanel,
  applyCheckboxFilter,
  openMASD,
  openI2R
} = require('./helpers/commonActions');

test.afterEach(async ({ page }) => {
  await page.waitForTimeout(10000);
});

async function getI2RLastUpdated(page) {
  const lastUpdated = page.locator('div.font-14.text-lite-gray').filter({
    hasText: /Last updated/i
  }).first();

  await lastUpdated.waitFor({ state: 'visible', timeout: 15000 });
  return (await lastUpdated.innerText()).replace(/\s+/g, ' ').trim();
}

async function openI2RTabAndPrintLastUpdated(page, tabName) {
  const tab = page.getByRole('tab', { name: tabName });
  await tab.waitFor({ state: 'visible', timeout: 15000 });
  await tab.click();
  await page.waitForTimeout(800);

  const text = await getI2RLastUpdated(page);
  console.log(`📊 UJJAIN I2R → ${tabName} → ${text}`);
}


async function waitForSUWRows(page) {
  let suwRows;
  let suwCount = 0;

  await expect
    .poll(
      async () => {
        suwRows = page.locator('#patient_lists tbody tr', { hasText: 'SUW' });
        suwCount = await suwRows.count();
        //console.log(`🔎 SUW row count check: ${suwCount}`);
        return suwCount;
      },
      {
        timeout: 20000,
        intervals: [1000, 1500, 2000, 2500]
      }
    )
    .toBeGreaterThan(0);

  return { suwRows, suwCount };
}

async function openSecondOrFirstSUWUser(page, suwRows, suwCount) {
  const targetRow = suwCount > 1 ? suwRows.nth(1) : suwRows.first();

  await targetRow.scrollIntoViewIfNeeded().catch(() => {});
  await expect(targetRow).toBeVisible({ timeout: 10000 });

  const upcUser = targetRow.locator('.uline-hov').first();
  const userName = (await upcUser.textContent())?.trim() || 'Unknown User';

  await upcUser.click();

  await page.waitForSelector('.ml-modal-content', {
    state: 'visible',
    timeout: 20000
  });

  console.log(`✅ UPC opened for: ${userName}`);
}

async function validateTabData(modal, page, tabName) {
  const tab = modal.getByRole('tab', { name: tabName });
  await tab.waitFor({ state: 'visible', timeout: 15000 });
  await tab.click();

  const panelId = await tab.getAttribute('aria-controls');
  if (!panelId) {
    console.log(`📭 ${tabName} → No linked panel found`);
    return;
  }

  const panel = modal.locator(`#${panelId}`);
  await panel.waitFor({ state: 'attached', timeout: 20000 });
  await page.waitForTimeout(800);

  if (tabName === 'Cases') {
    const text = ((await panel.textContent()) || '').trim();
    console.log(text.length > 20 ? `📊 Cases → Data present` : `📭 Cases → No data in tab`);
    return;
  }

  if (tabName === 'Actions') {
    const rows = panel.locator('table tbody tr');
    const count = await rows.count();

    if (count > 0) {
      const firstRow = rows.first();
      await firstRow.waitFor({ state: 'visible', timeout: 10000 }).catch(() => {});
      const name = ((await firstRow.locator('td.text-gray').first().textContent()) || '').trim();
      console.log(name ? `📊 Actions → User: ${name}` : `📭 Actions → No data in tab`);
    } else {
      console.log(`📭 Actions → No data in tab`);
    }
    return;
  }

  if (tabName === 'Timeline') {
    const rows = panel.locator('table tbody tr');
    const count = await rows.count();

    if (count > 0) {
      const name = ((await rows.first().locator('td').first().textContent()) || '').trim();
      console.log(name ? `📊 Timeline → User: ${name}` : `📭 Timeline → No data in tab`);
    } else {
      console.log(`📭 Timeline → No data in tab`);
    }
    return;
  }

  if (tabName === 'Submissions') {
    const rows = panel.locator('table tbody tr');
    const count = await rows.count();

    if (count > 0) {
      const name = ((await rows.first().locator('td').first().textContent()) || '').trim();
      console.log(name ? `📊 Submissions → User: ${name}` : `📭 Submissions → No data in tab`);
    } else {
      console.log(`📭 Submissions → No data in tab`);
    }
    return;
  }

  if (tabName === 'Indicators') {
    const rows = panel.locator('table tbody tr');
    const count = await rows.count();

    if (count > 0) {
      const firstRow = rows.first();
      await firstRow.waitFor({ state: 'visible', timeout: 10000 }).catch(() => {});
      const name = ((await firstRow.locator('td').first().textContent()) || '').trim();
      console.log(name ? `📊 Indicators → User: ${name}` : `📭 Indicators → No data in tab`);
    } else {
      console.log(`📭 Indicators → No data in tab`);
    }
    return;
  }

  if (tabName === 'Daily Report') {
    try {
      const dailyText = page.locator('text=/Your activity for/i').first();
      await dailyText.waitFor({ timeout: 15000 });

      const proof = ((await dailyText.textContent()) || '').split('\n')[0].trim();
      console.log(proof ? `📊 Daily Report → ${proof}` : `📭 Daily Report → No data in tab`);
    } catch {
      console.log(`📭 Daily Report → No data in tab`);
    }
  }
}

/* ================= UPC TEST ================= */

test('Ujjain | PNC |SUW |UPC | Tab-wise Validation', async ({ page }) => {
  const loginPage = new LoginPage(page);

  /* ================= LOGIN ================= */
  await loginToApp(loginPage, dataset);
  /* ================= NAVIGATION ================= */
  await page.getByRole('list').locator('a').first().click();
  await loginPage.UJJAIN();

 // console.log(`🌐 On URL: ${page.url()}`);

  /* ================= ENSURE CASE LIST ================= */
  await waitForCaseList(page);
 // console.log('✅ Base Case List loaded');
 await page.waitForLoadState('networkidle');
 await page.waitForTimeout(1500);

  /* ================= APPLY FILTERS ================= */
  await page.locator('#filter i').click();

  await applyCheckboxFilter(page, 'Current stage of case', 'PNC');
  await applyCheckboxFilter(page, 'Z-score (Weight)', 'SUW');

  await closeFilterPanel(page);
  //console.log('✅ Filters applied');

  await waitForCaseList(page);
  //console.log('🔁 Case List refreshed after filter');

  /* ================= FIND SUW USERS ================= */
  let suwRows;
  let suwCount = 0;

 try {
   ({ suwRows, suwCount } = await waitForSUWRows(page));
} catch {
   console.log('⚠️ No SUW users found today');
   test.skip();
   return;
}

  console.log(`✅ Found ${suwCount} SUW users`);

  /* ================= OPEN UPC ================= */
  await openSecondOrFirstSUWUser(page, suwRows, suwCount);

  /* ================= TAB VALIDATION ================= */
  const tabs = ['Cases', 'Actions', 'Timeline', 'Submissions', 'Indicators', 'Daily Report'];
  const modal = page.locator('.ml-modal');
  await modal.waitFor({ state: 'visible', timeout: 15000 });

  for (const tabName of tabs) {
    try {
      await validateTabData(modal, page, tabName);
    } catch (err) {
      console.warn(`❌ ${tabName} → Validation failed`);
    }
  }
});

/* ================= MASD TEST ================= */

test('UJJAIN MASD Last Updated Extraction Only', async ({ page }) => {
  const loginPage = new LoginPage(page);

  /* ================= LOGIN ================= */
  await loginPage.goTo();
  await loginPage.ValidLogin(dataset.username, dataset.password);

  /* ================= ORG SWITCH ================= */
  //await loginPage.UJJAIN();
  //console.log(`🌐 Landed after UJJAIN() on: ${page.url()}`);

  /* ================= OPEN MASD ================= */
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

  /* ================= CASE SUMMARY ================= */
  try {
    const caseSummaryTab = page.getByRole('tab', { name: 'Case Summary' });
    const csPanelId = await caseSummaryTab.getAttribute('aria-controls');
    const csPanel = page.locator(`#${csPanelId}`);

    const csLastUpdated = csPanel.locator('div.font-14.text-lite-gray').first();

    await expect(csLastUpdated).toContainText(/\d{4}|\bam\b|\bpm\b/, {
      timeout: 20000
    });

    const csText = (await csLastUpdated.innerText()).replace(/\s+/g, ' ').trim();
    console.log('MASD for Ujjain')
    console.log(`📊 Case Summary → ${csText}`);
  } catch {
    console.log('📭 Case Summary → Last updated not found');
  }

  /* ================= CASE ACTIVITIES ================= */
  try {
    const caseActivityTab = page.getByRole('tab', { name: 'Case Activities' });
    await caseActivityTab.click();
    await page.waitForTimeout(800);

    const caPanelId = await caseActivityTab.getAttribute('aria-controls');
    const caPanel = page.locator(`#${caPanelId}`);

    const caLastUpdated = caPanel
      .locator('div.font-14.text-lite-gray', { hasText: 'Last updated' })
      .first();

    await caLastUpdated.waitFor({ timeout: 15000 });

    const text = (await caLastUpdated.innerText()).trim();
    console.log(`📊 Case Activities → ${text}`);
  } catch {
    console.log('📭 Case Activities → Last updated not found');
  }

  /* ================= SUPERVISION ================= */
try {
  const supervisionTab = page.getByRole('tab', { name: 'Coaching' });

  await supervisionTab.waitFor({ state: 'visible', timeout: 15000 });
  await supervisionTab.click();
  await page.waitForTimeout(800);

  const panelId = await supervisionTab.getAttribute('aria-controls');
  const panel = page.locator(`#${panelId}`);

  const lastUpdated = panel
    .locator('div.font-14.text-lite-gray', { hasText: 'Last updated' })
    .first();

  await lastUpdated.waitFor({ timeout: 15000 });

  const text = (await lastUpdated.innerText()).trim();
  console.log(`📊 Coaching → ${text}`);

} catch {
  console.log('📭 Coaching → Last updated not found');
}
});



/* ================= I2R TEST ================= */

test('UJJAIN I2R Last Updated Extraction Tab-wise', async ({ page }) => {
  const loginPage = new LoginPage(page);

  /* ================= LOGIN ================= */
  await loginToApp(loginPage, dataset);

  /* ================= ORG SWITCH ================= */
  //await loginPage.UJJAIN();
  //console.log(`🌐 Landed after UJJAIN() on: ${page.url()}`);

  /* ================= OPEN I2R ================= */
  await openI2R(page);
  //console.log('✅ UJJAIN Items To Review page opened');

  /* ================= PAGE LEVEL LAST UPDATED ================= */
  try {
    const pageLastUpdated = await getI2RLastUpdated(page);
    console.log(`🕒 UJJAIN I2R Page Last Updated → ${pageLastUpdated}`);
  } catch {
    console.log('📭 UJJAIN I2R Page Last Updated not found');
  }

  /* ================= TAB-WISE EXTRACTION ================= */
  const tabs = [
    'Role Summary',
    'HCW Requiring Guidance',
    'Cases Needing Guidance',
    'Block/Village',
    'Training Status'
  ];

  for (const tabName of tabs) {
    try {
      await openI2RTabAndPrintLastUpdated(page, tabName);
    } catch (err) {
      console.log(`❌ UJJAIN I2R → ${tabName} → Last updated not found`);
    }
  }
});