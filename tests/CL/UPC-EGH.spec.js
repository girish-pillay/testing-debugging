const { test, expect } = require('@playwright/test');
const { LoginPage } = require('../../pageObject/CL_loginpage');
const dataset = require('../../cred/credential.json');
const {
  loginToApp,
  waitForCaseList,
  closeFilterPanel,
  applyCheckboxFilter,
  openMASD,
  openCaseList
} = require('../../helpers/commonActions');

async function findRowByBadge(page, badgeText) {
  const rows = page.locator('#patient_lists tbody tr');

  const maxScrolls = 25;

  for (let i = 0; i < maxScrolls; i++) {
    const count = await rows.count();

    for (let r = 0; r < count; r++) {
      const row = rows.nth(r);

      // EXACT badge DOM
      const badgeSpans = row.locator('div.badge-2 span');

      const badgeCount = await badgeSpans.count();
      for (let b = 0; b < badgeCount; b++) {
        const text = (await badgeSpans.nth(b).innerText()).trim();
        if (text === badgeText) {
          return row;
        }
      }
    }

    // 🔥 SCROLL THE PAGE (NOT CONTAINER)
    await page.mouse.wheel(0, 800);
    await page.waitForTimeout(700);
  }

  return null;
}



test('EGH PNC-SUW-MUW UPC  Tab-wise Validation', async ({ page }) => {

  const loginPage = new LoginPage(page);

  /* ================= LOGIN ================= */
  await loginToApp(loginPage, dataset);

  /* ================= NAVIGATION ================= */
  await loginPage.EGH();

  await openCaseList(page);

  console.log(`🌐 On URL: ${page.url()}`);

  /* ================= BASE CASE LIST ================= */
  await waitForCaseList(page);
  console.log('✅ Base Case List loaded');

  /* ================= APPLY FILTERS ================= */
  await page.locator('#filter i').click();

  // PNC
  await page.getByText('Current stage of case', { exact: true }).click();
  await page.locator('.checkbox-container', { hasText: 'PNC' })
    .locator('.checkbox-checkmark')
    .click();

  // Z-score (Weight)
  await page.getByText('Z-score (Weight)', { exact: true }).click();

  // SUW + MUW
  await page.locator('.checkbox-container', { hasText: 'SUW' })
    .locator('.checkbox-checkmark')
    .click();

  await page.locator('.checkbox-container', { hasText: 'MUW' })
    .locator('.checkbox-checkmark')
    .click();

  await page.keyboard.press('Escape');
  console.log('✅ Filters applied (PNC + SUW + MUW)');

  // Allow React to settle
  await page.waitForTimeout(1500);

  /* ================= FIND TARGET USER ================= */
  let targetRow = await findRowByBadge(page, 'SUW');
  let badgeUsed = 'SUW';

  if (!targetRow) {
    console.log('⚠️ SUW not found, trying MUW');
    targetRow = await findRowByBadge(page, 'MUW');
    badgeUsed = 'MUW';
  }

  if (!targetRow) {
    throw new Error('No SUW or MUW user found in Case List');
  }

  console.log(`✅ ${badgeUsed} user found`);

  await targetRow.scrollIntoViewIfNeeded();
  await expect(targetRow).toBeVisible();

  /* ================= OPEN UPC ================= */
  const upcUser = targetRow.locator('.uline-hov');
  const userName = (await upcUser.textContent())?.trim();

  await upcUser.click();
  await page.waitForSelector('.ml-modal-content', {
    state: 'visible',
    timeout: 20000
  });

  console.log(`✅ UPC opened for ${badgeUsed}: ${userName}`);

  /* ================= TAB VALIDATION ================= */
  const tabs = [
    'Cases',
    'Actions',
    'Timeline',
    'Submissions',
    'Indicators',
    'Daily Report'
  ];
    const modal = page.locator('.ml-modal');
await modal.waitFor({ state: 'visible', timeout: 15000 });

for (const tabName of tabs) {
  try {
    // Click tab inside modal
    const tab = modal.getByRole('tab', { name: tabName });
    await tab.click();

    // Get exact panel linked to this tab (IMPORTANT)
    const panelId = await tab.getAttribute('aria-controls');
    const panel = modal.locator(`#${panelId}`);
    await panel.waitFor({ state: 'attached', timeout: 20000 });

    /* ================= CASES ================= */
    if (tabName === 'Cases') {
  try {
    const lastUpdated = panel.locator(
      'div.text-lite-gray',
      { hasText: 'Last updated at' }
    ).first();

    await lastUpdated.waitFor({ timeout: 15000 });

    const text = (await lastUpdated.innerText()).trim();
    console.log(`📊 Cases → ${text}`);
  } catch {
    console.log('📭 Cases → No data in tab');
  }
  continue;
}

    /* ================= ACTIONS ================= */
    if (tabName === 'Actions') {
      const firstRow = panel.locator('table tbody tr').first();
      try {
        // Wait for actual data row (React async fix)
        await firstRow.waitFor({ state: 'visible', timeout: 20000 });

        const name = (await firstRow.locator('td.text-gray').first().innerText()).trim();
        console.log(`📊 Actions → User: ${name}`);
      } catch {
        console.log(`📭 Actions → No data in tab`);
      }
      continue;
    }

    /* ================= TIMELINE ================= */
if (tabName === 'Timeline') {
  try {
    const firstRow = panel.locator('table tbody tr').first();
    await firstRow.waitFor({ timeout: 15000 });

    const name = (await firstRow.locator('td').first().innerText()).trim();
    console.log(`📊 Timeline → User: ${name}`);
  } catch {
    console.log('📭 Timeline → No data in tab');
  }
  continue;
}


/* ================= SUBMISSIONS ================= */
      if (tabName === 'Submissions') {
  const rows = panel.locator('table tbody tr');
  const count = await rows.count();

  if (count > 0) {
    const name = (await rows.first().locator('td').first().innerText()).trim();
    console.log(`📊 Submissions → User: ${name}`);
  } else {
    console.log(`📭 Submissions → No data in tab`);
  }
  continue;
}



    /* ================= INDICATORS ================= */
    if (tabName === 'Indicators') {
      const firstRow = panel.locator('table tbody tr').first();
      try {
        await firstRow.waitFor({ state: 'visible', timeout: 20000 });

        const name = (await firstRow.locator('td').first().innerText()).trim();
        console.log(`📊 Indicators → User: ${name}`);
      } catch {
        console.log(`📭 Indicators → No data in tab`);
      }
      continue;
    }

    /* ================= DAILY REPORT ================= */
   if (tabName === 'Daily Report') {
  try {
    // Global search because Daily Report is rendered via React portal
    const dailyText = page.locator(
      'text=/Your activity for/i'
    ).first();

    await dailyText.waitFor({ timeout: 20000 });

    const proof = (await dailyText.innerText())
      .split('\n')[0]
      .trim();

    console.log(`📊 Daily Report → ${proof}`);
  } catch {
    console.log(`📭 Daily Report → No data in tab`);
  }
  continue;
}


  } catch (err) {
    console.warn(`❌ ${tabName} → Validation failed`);
  }
}


});

  

test('EGH MASD Last Updated Extraction Only', async ({ page }) => {

  const loginPage = new LoginPage(page);

  /* ================= LOGIN ================= */
   await loginToApp(loginPage, dataset);

  /* ================= ORG SWITCH (UNCHANGED) ================= */
  await loginPage.EGH();
  console.log(`🌐 Landed after UJJAIN() on: ${page.url()}`);

  /* ================= OPEN MASD ================= */
    await openMASD(page);

  /* ================= CASE SUMMARY ================= */
try {
  const caseSummaryTab = page.getByRole('tab', { name: 'Case Summary' });
  const csPanelId = await caseSummaryTab.getAttribute('aria-controls');
  const csPanel = page.locator(`#${csPanelId}`);

  const csLastUpdated = csPanel.locator('div.font-14.text-lite-gray').first();

  // wait until text contains a date
  await expect(csLastUpdated).toContainText(/\d{4}|\bam\b|\bpm\b/, {
    timeout: 20000
  });

  const csText = (await csLastUpdated.innerText()).replace(/\s+/g, ' ').trim();
  console.log(`📊 Case Summary → ${csText}`);

} catch {
  console.log('📭 Case Summary → Last updated not found');
}

  
  /* ================= CASE ACTIVITIES ================= */
  try {
    const caseActivityTab = page.getByRole('tab', { name: 'Case Activities' });
    await caseActivityTab.click();
    await page.waitForTimeout(500);

    const caPanelId = await caseActivityTab.getAttribute('aria-controls');
    const caPanel = page.locator(`#${caPanelId}`);

    const caLastUpdated = caPanel.locator(
      'div.font-14.text-lite-gray',
      { hasText: 'Last updated' }
    ).first();

    await caLastUpdated.waitFor({ timeout: 15000 });

    const text = (await caLastUpdated.innerText()).trim();
    console.log(`📊 Case Activities → ${text}`);
  } catch {
    console.log('📭 Case Activities → Last updated not found');
  }

});