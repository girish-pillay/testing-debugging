
const { LoginPage } = require('./CL_loginpage');
const dataset = require('../cred/credential.json');

class LoginCheck {
  constructor(page) {
    this.page = page;
    this.loginPage = new LoginPage(page);
  }

  /* ================= LOGIN (REUSED, SECURE) ================= */
  async login() {
    await this.loginPage.goTo();
    await this.loginPage.ValidLogin(
      dataset.username,
      dataset.password
    );
    console.log('✅ Logged in (via credential.json)');
  }

  /* ================= ORG SELECTOR ================= */
  async openOrgSelector() {
    const globe = this.page.locator('li[data-tip] img');
    await globe.first().waitFor({ state: 'visible', timeout: 15000 });
    await globe.first().click();
    await this.page.waitForSelector('.organization-item', { timeout: 20000 });
  }



  async selectOrg(parentText, childText) {

  /* ---------- OPEN ORG SELECTOR ---------- */
  const globe = this.page.locator('li[data-tip] img');
  await globe.first().waitFor({ state: 'visible', timeout: 15000 });
  await globe.first().click();

  /* ---------- WAIT FOR ORG MODAL ---------- */
  const modal = this.page.locator('.ml-modal');
  await modal.waitFor({ state: 'visible', timeout: 20000 });

  /* ---------- CLICK PARENT (FORCE) ---------- */
  const parent = modal
    .locator('h5')
    .filter({ hasText: parentText })
    .first();

  await parent.waitFor({ state: 'visible', timeout: 15000 });
  await parent.scrollIntoViewIfNeeded();
  await parent.click({ force: true });

  /* ---------- CLICK CHILD (FORCE) ---------- */
  const child = modal
    .locator('h5')
    .filter({ hasText: childText })
    .first();

  await child.waitFor({ state: 'visible', timeout: 15000 });
  await child.scrollIntoViewIfNeeded();
  await child.click({ force: true });

  /* ---------- CLOSE MODAL ---------- */
  const closeBtn = this.page.locator('#popup_close');
  await closeBtn.waitFor({ state: 'visible', timeout: 10000 });
  await closeBtn.click({ force: true });

  /* ---------- WAIT FOR MODAL TO GO ---------- */
  await modal.waitFor({ state: 'detached', timeout: 20000 });

  //console.log(`🏢 Org selected → ${childText}`);
}


  /* ================= MASD ================= */
  async gotoMASD() {
    const menuIcon = this.page.locator('li[data-tip="View main menu"] img');
    await menuIcon.waitFor({ state: 'visible', timeout: 15000 });
    await menuIcon.click();

    const masdLink = this.page.locator(
      'a[href="/members/mcj/activity"]'
    );
    await masdLink.waitFor({ state: 'visible', timeout: 20000 });
    await masdLink.click();

    await this.page.waitForSelector('table', { timeout: 30000 });
    console.log('📊 MASD opened');
  }
 
  
async applyMASDFilter() {

  /* ---------- OPEN FILTER (MASD) ---------- */
  const filterBtn = this.page.locator('span[data-tip="Filter"]');
  await filterBtn.waitFor({ state: 'visible', timeout: 15000 });
  await filterBtn.click();

  /* ================= DEPARTMENT ================= */
  await this.page.getByText('Department', { exact: true }).click();

  const otherCheck = this.page
    .locator('span.checkbox-container', { hasText: 'Other' })
    .locator('span.checkbox-checkmark');

  await otherCheck.waitFor({ state: 'visible', timeout: 15000 });
  await otherCheck.click();

  /* ================= ROLES ================= */
  await this.page.getByText('Roles', { exact: true }).click();

  const cuedwellCheck = this.page
    .locator('span.checkbox-container', { hasText: 'Cuedwell Support' })
    .locator('span.checkbox-checkmark');

  await cuedwellCheck.waitFor({ state: 'visible', timeout: 15000 });
  await cuedwellCheck.click();

  /* ---------- CLOSE FILTER ---------- */
 await this.page.locator('.app-content-section').first().click({ force: true });


  /* ---------- WAIT FOR TABLE UPDATE ---------- */
  await this.page.waitForTimeout(1500);



  console.log('🎯 MASD filter applied: Department=Other, Role=Cuedwell Support');
}




}

module.exports = { LoginCheck };
