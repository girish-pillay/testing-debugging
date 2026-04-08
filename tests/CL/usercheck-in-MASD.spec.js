// ====================== FINAL TEST (ALL ML DISTRICTS ONLY) ======================
const { test } = require('@playwright/test');
const { LoginCheck } = require('../../pageObject/CL_logincheck');
const dataset = require('../../cred/credential.json');





test('All ML districts → MASD → Dept Other + Role Cuedwell → print users', async ({ page }) => {

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

  for (const org of ORGS) {

    console.log(`\n===== ${org.parent} → ${org.child} =====`);

    /* ---------- ORG ---------- */
    await lc.selectOrg(org.parent, org.child);
    console.log(`🏢 Org selected → ${org.child}`);

    /* ---------- MASD ---------- */
    await lc.gotoMASD();
    //console.log('📊 MASD opened');

    /* ---------- APPLY FILTER ---------- */
    await lc.applyMASDFilter();

    /* ---------- SMALL DELAY (DO NOT REMOVE) ---------- */
    await page.waitForTimeout(1500);

    /* ---------- EXTRACT LIST OF MEMBERS ---------- */
    const membersHeader = page.locator('text=/List of Members/i').first();
    await membersHeader.waitFor({ state: 'visible', timeout: 20000 });

    const headerText = await membersHeader.innerText();
    // Example: "List of Members - 0 Page - 1/0"

    const match = headerText.match(/List of Members\s*-\s*(\d+)/i);
    const memberCount = match ? Number(match[1]) : 0;

    console.log(`👥 Filtered List of Members count: ${memberCount}`);
  }
});