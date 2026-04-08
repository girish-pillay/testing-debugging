class LoginPage {

  constructor(page) {
    this.page = page;

    this.signinicon = page.getByText('Sign in with Email');
    this.username = page.getByRole('textbox', { name: 'Enter your email' });
    this.password = page.getByRole('textbox', { name: 'password' });
    this.signin = page.getByRole('button', { name: 'Sign in', exact: true });
  }

  async goTo() {
  const baseUrl = process.env.BASE_URL || 'https://demo.cuedwell.com';

  await this.page.goto(baseUrl, {
    waitUntil: 'domcontentloaded'
  });
}


  async ValidLogin(username, password) {
    await this.page.waitForSelector('text=Sign in with Email', { timeout: 15000 });
    await this.signinicon.click();

    await this.username.fill(username);
    await this.password.fill(password);
    await this.signin.click();

    // Close welcome popup
    await this.page.getByRole('button', { name: 'Close' }).click();
    await this.page.waitForLoadState('networkidle');
  }

  /* =========================
     SWITCH TO EGH (ROBUST)
     ========================= */
  async EGH() {

    // Ensure Case List page
    if (!this.page.url().includes('/health/table')) {
      await this.page.goto('https://demo.cuedwell.com/health/table', {
        waitUntil: 'domcontentloaded'
      });
    }

    /* ---------- OPEN ORG SELECTOR ---------- */
    const globe = this.page.locator('li[data-tip] img');
    await globe.first().waitFor({ state: 'visible', timeout: 15000 });
    await globe.first().click();
    console.log('🌍 Org selector opened');

    /* ---------- WAIT FOR ORG LIST ---------- */
    const orgItem = this.page.locator('.organization-item');
    await orgItem.first().waitFor({ state: 'visible', timeout: 20000 });

    /* ---------- CLICK EGH ---------- */
    const parentOrg = this.page.locator('.organization-item h5')
      .filter({ hasText: 'ML East Garo Hills' })
      .first();

    await parentOrg.scrollIntoViewIfNeeded();
    await parentOrg.click();
    console.log('🏢 Clicked parent org: EGH');

    /* ---------- CLICK AWC ---------- */
    const block = this.page.locator('h5', { hasText: 'Agalgre Awc' }).first();
    await block.waitFor({ state: 'visible', timeout: 15000 });
    await block.click();
    console.log('📍 Clicked block: Agalgre Awc');

    /* ---------- CLOSE MODAL ---------- */
    const closeBtn = this.page.locator('#popup_close');
    await closeBtn.waitFor({ state: 'visible', timeout: 10000 });
    await closeBtn.click();

    // Confirm switch completed
    await this.page.waitForSelector('.organization-item', {
      state: 'detached',
      timeout: 15000
    });

    console.log('✅ Organization switched to EGH');
  }




async UJJAIN() {

  /* ---------- OPEN ORG SELECTOR ---------- */
  const globe = this.page.locator('li[data-tip] img');
  await globe.first().waitFor({ state: 'visible', timeout: 15000 });
  await globe.first().click();
  console.log('🌍 Org selector opened');

  /* ---------- SELECT PARENT ORG ---------- */
  const parentOrg = this.page
    .locator('h5.pointer')
    .filter({ hasText: 'MP Ujjain - 2457' })
    .first();

  await parentOrg.waitFor({ state: 'visible', timeout: 20000 });
  await parentOrg.click();
  console.log('🏢 Clicked parent org: MP Ujjain - 2457');

  /* ---------- SELECT CHILD ORG ---------- */
  const block = this.page
    .locator('h5')
    .filter({ hasText: 'MP Ujjain - 1A' })
    .first();

  await block.waitFor({ state: 'visible', timeout: 20000 });
  await block.click();
  console.log('📍 Clicked block: MP Ujjain - 1A');

  /* ---------- CLOSE ORG MODAL ---------- */
  const closeBtn = this.page.locator('#popup_close');
  await closeBtn.waitFor({ state: 'visible', timeout: 10000 });
  await closeBtn.click();

  console.log('✅ Organization switched to UJJAIN');

  /* ---------- FORCE HARD RESET (CRITICAL) ---------- */
  await this.page.reload({ waitUntil: 'domcontentloaded' });

  /* ---------- OPEN MAIN MENU ---------- */
  const menuIcon = this.page.locator('li[data-tip="View main menu"] img');
  await menuIcon.waitFor({ state: 'visible', timeout: 15000 });
  await menuIcon.click();
  console.log('📂 Main menu opened');

  /* ---------- CLICK HOME (CASE LIST) ---------- */
  const homeLink = this.page.locator('a#dashboard[href="/health/table"]');
  await homeLink.waitFor({ state: 'visible', timeout: 15000 });
  await homeLink.click();
  console.log('🏠 Navigated to Case List');

  /* ---------- CONFIRM CASE LIST LOADED ---------- */
  
 await this.page.locator('li[data-tip="View main menu"]').waitFor({
  state: 'detached',
  timeout: 15000
}).catch(() => {});

// Now wait for Case List DOM
await this.page.waitForFunction(() => {
  const el = document.querySelector('#patient_lists');
  return el && el.offsetHeight > 0;
}, { timeout: 30000 });
  console.log('✅ UJJAIN Case List ready');
}


/* =========================
   SWITCH TO KCORP → NGO
   ========================= */
async KCORP_NGO(ngoName = 'AROEHAN') {

  // Ensure base page
  if (!this.page.url().includes('/health/table')) {
    await this.page.goto('https://demo.cuedwell.com/health/table', {
      waitUntil: 'domcontentloaded'
    });
  }

  /* ---------- OPEN ORG SELECTOR ---------- */
  const globe = this.page.locator('li[data-tip] img');
  await globe.first().waitFor({ state: 'visible', timeout: 15000 });
  await globe.first().click();
  console.log('🌍 Org selector opened');

  /* ---------- WAIT FOR ORG LIST ---------- */
  const orgItem = this.page.locator('.organization-item');
  await orgItem.first().waitFor({ state: 'visible', timeout: 20000 });

  /* ---------- SELECT KCORP PARENT ---------- */
  const parentOrg = this.page.locator('.organization-item h5')
    .filter({ hasText: 'KCorp Foundation' })
    .first();

  await parentOrg.scrollIntoViewIfNeeded();
  await parentOrg.click();
  console.log('🏢 Clicked parent org: KCORP Foundation');

  /* ---------- SELECT NGO ---------- */
  const childOrg = this.page.locator('h5')
    .filter({ hasText: new RegExp(ngoName, 'i') })
    .first();

  await childOrg.waitFor({ state: 'visible', timeout: 15000 });
  await childOrg.click();
  console.log(`📍 Clicked NGO: ${ngoName}`);

  /* ---------- CLOSE MODAL ---------- */
  const closeBtn = this.page.locator('#popup_close');
  await closeBtn.waitFor({ state: 'visible', timeout: 10000 });
  await closeBtn.click();

  /* ---------- CONFIRM SWITCH ---------- */
  await this.page.waitForSelector('.organization-item', {
    state: 'detached',
    timeout: 15000
  });

  console.log(`✅ Organization switched to KCORP → ${ngoName}`);
}




async cuetree() {

  /* ---------- OPEN ORG SELECTOR ---------- */
  const globe = this.page.locator('li[data-tip] img');
  await globe.first().waitFor({ state: 'visible', timeout: 15000 });
  await globe.first().click();
  console.log('🌍 Org selector opened');

  /* ---------- SELECT PARENT ORG ---------- */
  const parentOrg = this.page.getByRole('heading', {
    name: /Cuetree.*2/i
  });

  await parentOrg.waitFor({ state: 'visible', timeout: 20000 });
  await parentOrg.click();
  console.log('🏢 Clicked parent org: Cuetree');

  /* ---------- SELECT CHILD ORG ---------- */
  const childOrg = this.page.getByRole('heading', {
    name: /Library Center/i
  });

  await childOrg.waitFor({ state: 'visible', timeout: 20000 });
  await childOrg.click();
  console.log('📍 Clicked child org: Library Center');

  /* ---------- CLOSE ORG MODAL ---------- */
  const closeBtn = this.page.locator('#popup_close');
  await closeBtn.waitFor({ state: 'visible', timeout: 10000 });
  await closeBtn.click();

  console.log('✅ Organization switched to Cuetree');
}

}
module.exports = {LoginPage};