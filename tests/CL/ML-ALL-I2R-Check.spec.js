const { test } = require('@playwright/test');
const { LoginCheck } = require('../../pageObject/CL_logincheck');
const { openI2R } = require('./helpers/commonActions');
//const dataset = require('../../cred/credential.json');
const dataset = {username: process.env.CW_USERNAME,password: process.env.CW_PASSWORD};

test('All Meghalaya orgs -> I2R -> print last updated from each tab', async ({ page }) => {
  test.setTimeout(10 * 60 * 1000);

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

  const I2R_TABS = [
    'Role Summary',
    'HCW Requiring Guidance',
    'Cases Needing Guidance',
    'Block/Village',
    'Training Status'
  ];

  async function getI2RLastUpdated(page) {
    const lastUpdated = page
      .locator('div.font-14.text-lite-gray')
      .filter({ hasText: /Last updated/i })
      .first();

    await lastUpdated.waitFor({
      state: 'visible',
      timeout: 20000
    });

    return (await lastUpdated.innerText())
      .replace(/\s+/g, ' ')
      .trim();
  }

  async function openI2RTabAndPrint(page, tabName) {
    const tab = page.getByRole('tab', { name: tabName });

    await tab.waitFor({
      state: 'visible',
      timeout: 20000
    });

    await tab.click();

    await page.waitForTimeout(1000);

    const text = await getI2RLastUpdated(page);

    console.log(`📊 ${tabName} -> ${text}`);
  }

  for (const org of ORGS) {

    console.log('\n==============================');
    console.log(`ORG: ${org.parent} -> ${org.child}`);
    console.log('==============================');

    try {
      await lc.selectOrg(org.parent, org.child);
      console.log(`🏢 Org selected -> ${org.child}`);
    } catch (err) {
      console.log(`❌ Org switch failed -> ${org.child}: ${err.message}`);
      continue;
    }

    try {

      await openI2R(page);

      const pageLastUpdated = await getI2RLastUpdated(page);

      console.log(`🕒 I2R Page -> ${pageLastUpdated}`);

      for (const tabName of I2R_TABS) {
        try {
          await openI2RTabAndPrint(page, tabName);
        } catch {
          console.log(`❌ ${tabName} -> Last updated missing`);
        }
      }

    } catch (err) {
      console.log(`❌ I2R failed -> ${err.message}`);
    }

    await page.goto(
      'https://demo.cuedwell.com/health/table',
      {
        waitUntil: 'domcontentloaded'
      }
    );

    await page.waitForTimeout(1500);
  }
});