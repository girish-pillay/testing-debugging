const { test, expect } = require('@playwright/test');
const { LoginCheck } = require('../../pageObject/CL_logincheck');

test('All Meghalaya orgs -> MASD -> print last updated from each tab', async ({ page }) => {
  const lc = new LoginCheck(page);
  await lc.login();

  const ORGS = [
    { parent: 'ML East Garo Hills', child: 'Agalgre Awc' },
    { parent: 'ML East Jaintia Hills', child: 'Bamkhosngi' },
    { parent: 'ML East Khasi Hills', child: '29-Contonment Anjalee I' },
    { parent: 'ML Eastern West Khasi Hills', child: 'BLOSSOM CLF' },
    { parent: 'ML North Garo Hills', child: 'Abanda' },
    { parent: 'ML Ri Bhoi', child: '0 Point A' },
    { parent: 'ML South Garo Hills', child: 'AMAN CHIGA CLF' },
    { parent: 'ML South West Garo Hills', child: 'AGIPE DOROA CLF' },
    { parent: 'ML South West Khasi Hills', child: 'Alekwareng' },
    { parent: 'ML West Garo Hills', child: 'Chisakgre' },
    { parent: 'ML West Jaintia Hills', child: 'Amjalong' },
    { parent: 'ML West Khasi Hills', child: '15 Shnong CLF' }
  ];

  // Keep tab names exactly as app shows
  const MASD_TABS = [
    'Case Summary',
    'Case Activities',
    'Coaching',
    'Supervision'
  ];

  async function safeClickTab(page, tabName) {
    const tab = page.getByRole('tab', { name: new RegExp(`^${tabName}$`, 'i') }).first();

    if (await tab.count() === 0) {
      return { ok: false, reason: 'tab not found in DOM' };
    }

    try {
      await tab.scrollIntoViewIfNeeded();
      await tab.click({ timeout: 10000 });
      await page.waitForTimeout(1500); // keep small stabilization
      return { ok: true };
    } catch (err) {
      return { ok: false, reason: `tab click failed: ${err.message}` };
    }
  }


   async function getLastUpdatedFromCurrentTab(page) {
  const activePanel = page.locator('div[role="tabpanel"][aria-hidden="false"]').first();

  try {
    await activePanel.waitFor({ state: 'visible', timeout: 10000 });

    const text = await activePanel.evaluate((panel) => {
      const match = panel.innerText.match(/Last\s*updated\s*:?\s*[A-Za-z]{3}\s+\d{1,2},\s+\d{4}\s+\d{1,2}:\d{2}\s*(am|pm)/i);
      return match ? match[0] : null;
    });

    return text ? text.replace(/\s+/g, ' ').trim() : null;
  } catch {
    return null;
  }
}

  async function waitForMasdTabs(page) {
    const tabList = page.locator('[role="tab"]');
    try {
      await tabList.first().waitFor({ state: 'visible', timeout: 15000 });
      return true;
    } catch {
      return false;
    }
  }

  for (const org of ORGS) {
    console.log(`\n==============================`);
    console.log(`ORG: ${org.parent} -> ${org.child}`);
    console.log(`==============================`);

    try {
      await lc.selectOrg(org.parent, org.child);
      console.log(`🏢 Org selected -> ${org.child}`);
    } catch (err) {
      console.log(`❌ Org switch failed -> ${org.child}: ${err.message}`);
      continue;
    }

    try {
      await lc.gotoMASD();
    //  console.log(`📊 MASD opened`);
    } catch (err) {
      console.log(`❌ MASD open failed for ${org.child}: ${err.message}`);
      continue;
    }

    const tabsVisible = await waitForMasdTabs(page);

    if (!tabsVisible) {
      console.log(`⚠️ All tabs missing for ${org.child}`);
      continue;
    }

    let foundAnyTab = false;

    for (const tabName of MASD_TABS) {
      const result = await safeClickTab(page, tabName);

      if (!result.ok) {
        console.log(`⚠️ ${tabName} -> missing`);
        continue;
      }

      foundAnyTab = true;

      const lastUpdated = await getLastUpdatedFromCurrentTab(page);

      if (lastUpdated) {
        console.log(`✅ ${tabName} -> ${lastUpdated}`);
      } else {
        console.log(`⚠️ ${tabName} -> Last updated missing`);
      }
    }

    if (!foundAnyTab) {
      console.log(`⚠️ All tabs missing for ${org.child}`);
    }
  }
});