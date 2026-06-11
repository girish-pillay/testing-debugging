class LoginPage {

constructor(page)
{
    
      
      this.page = page; 
      this.signinicon = page.getByText('Sign in with Email');
      this.username = page.getByRole('textbox', { name: 'Enter your email' });
      this.password = page.getByRole('textbox', { name: 'password' });
      this.signin = page.getByRole('button', { name: 'Sign in', exact: true });
      this.closebtn =  page.getByRole('button', { name: 'Close' });
      this.Xbtn = page.getByRole('button', { name: '⨉' });
}

async goTo()
{

  await this.page.goto("https://demo.cuedwell.com");
    
    
}


async ValidLogin(username, password) {

  await this.page.waitForLoadState('networkidle').catch(() => {});
  await this.page.waitForTimeout(10000);

  // Open Email Login using real mouse click
  const emailLogin = this.page.getByText('Sign in with Email', {
    exact: true
  });

  await emailLogin.waitFor({
    state: 'visible',
    timeout: 30000
  });

  await emailLogin.scrollIntoViewIfNeeded();

  const box = await emailLogin.boundingBox();

  if (!box) {
    throw new Error('Sign in with Email bounding box not found');
  }

  await this.page.mouse.click(
    box.x + box.width / 2,
    box.y + box.height / 2
  );

  // Fill credentials
  await this.username.waitFor({
    state: 'visible',
    timeout: 30000
  });

  await this.username.fill(username);
  await this.username.press('Tab');

  await this.password.fill(password);

  await this.signin.click();

  await this.page.waitForTimeout(5000);

  // Welcome popup
  const closeBtn = this.page.getByRole('button', {
    name: 'Close'
  });

  try {
    await closeBtn.waitFor({
      state: 'visible',
      timeout: 5000
    });

    await closeBtn.click({ force: true });

    console.log('✅ Close popup clicked');

  } catch {
    console.log('⚠️ Close popup not shown');
  }

  await this.page.waitForLoadState('domcontentloaded').catch(() => {});
  await this.page.waitForTimeout(1000);

  // Push setting popup
  const popupClose = this.page.locator('#popup_close').first();

  if (await popupClose.isVisible().catch(() => false)) {

    console.log('⚠️ Push setting popup detected after login');

    await popupClose.click({ force: true });

    await this.page.waitForTimeout(1000);

    console.log('✅ Push setting popup closed');
  }

  // Cookie popup
  const acceptBtn = this.page.locator(
    'button:has-text("Accept")'
  );

  if (await acceptBtn.isVisible().catch(() => false)) {

    await acceptBtn.click({ force: true });

    await this.page.waitForTimeout(1000);

    console.log('✅ Cookie popup accepted');
  }

  // Second popup
  const secondPopup = this.page.locator('#popup_close').first();

  if (await secondPopup.isVisible().catch(() => false)) {

    console.log('⚠️ Second popup detected');

    await secondPopup.click({ force: true });

    await this.page.waitForTimeout(2000);
  }
}
 


  



  

    
async KCorpAROEHAN() {

  // Close any remaining popup
  const popupClose = this.page.locator('#popup_close').first();

  if (await popupClose.isVisible().catch(() => false)) {
    await popupClose.click({ force: true });
    await this.page.waitForTimeout(1000);
  }

  // Click globe
  const globe = this.page.locator('li[data-tip] img').first();

  await globe.waitFor({
    state: 'visible',
    timeout: 15000
  });


  for (let i = 0; i < 5; i++) {

  const popupClose = this.page.locator('#popup_close').first();

  if (await popupClose.isVisible().catch(() => false)) {
    console.log(`Closing popup ${i + 1}`);
    await popupClose.click({ force: true });
    await this.page.waitForTimeout(1500);
  } else {
    break;
  }
}  
  await globe.click({ force: true });

  // CRITICAL: Wait for organization popup
  const orgItem = this.page.locator('.organization-item');

  await orgItem.first().waitFor({
    state: 'visible',
    timeout: 20000
  });

  console.log('✅ Organization popup opened');

  // Click KCORP
  const parentOrg = this.page.locator('.organization-item h5')
    .filter({ hasText: 'KCorp Foundation' })
    .first();

  await parentOrg.waitFor({
    state: 'visible',
    timeout: 20000
  });

  await parentOrg.scrollIntoViewIfNeeded();
  await parentOrg.click({ force: true });

  console.log('✅ KCorp clicked');

  await this.page.waitForTimeout(2000);

  // Click AROEHAN
  const childOrg = this.page.locator('h5')
    .filter({ hasText: /AROEHAN/i })
    .first();

  await childOrg.waitFor({
    state: 'visible',
    timeout: 20000
  });

  await childOrg.scrollIntoViewIfNeeded();
  await childOrg.click({ force: true });

  console.log('✅ AROEHAN clicked');

  // Close org selector
  const closeBtn = this.page.locator('#popup_close').first();

  if (await closeBtn.isVisible().catch(() => false)) {
    await closeBtn.click({ force: true });
  }

  console.log('✅ Switched to KCORP → AROEHAN');
}







  

  async KCorp_BAIF() {
    const heading = this.page.locator('h5.pointer', { hasText: 'KCorp Foundation -' });
    await heading.scrollIntoViewIfNeeded();
    await heading.click();
    console.log('✅ Clicked KCorp_BAIF');
  
    // Then click the nested entry (child location or project)
    const child = this.page.locator('h5', { hasText: 'KCorp Foundation - BAIF BISLD' });
    await child.scrollIntoViewIfNeeded();
    await child.click(); 	
  
    // Close the modal
    await this.page.getByRole('button', { name: '⨉' }).click();
  }
  

  async KCorp_BRB() {
    const heading = this.page.locator('h5.pointer', { hasText: 'KCorp Foundation -' });
    await heading.scrollIntoViewIfNeeded();
    await heading.click();
    console.log('✅ Clicked KCorp_BRB');
  
    // Then click the nested entry (child location or project)
    const child = this.page.locator('h5', { hasText: 'Bal Raksha Bharat' });
    await child.scrollIntoViewIfNeeded();
    await child.click(); 	
  
    // Close the modal
    await this.page.getByRole('button', { name: '⨉' }).click();
  }

  async KCorp_CRY() {
    const heading = this.page.locator('h5.pointer', { hasText: 'KCorp Foundation -' });
    await heading.scrollIntoViewIfNeeded();
    await heading.click();
    console.log('✅ Clicked KCorp_CRY');
  
    // Then click the nested entry (child location or project)
    const child = this.page.locator('h5', { hasText: 'CRY' });
    await child.scrollIntoViewIfNeeded();
    await child.click(); 	
  
    // Close the modal
    await this.page.getByRole('button', { name: '⨉' }).click();
  }
  

  async KCorp_UWM() {
    const heading = this.page.locator('h5.pointer', { hasText: 'KCorp Foundation -' });
    await heading.scrollIntoViewIfNeeded();
    await heading.click();
    console.log('✅ Clicked KCorp_UWM');
  
    // Then click the nested entry (child location or project)
    const child = this.page.locator('h5', { hasText: 'United Way Mumbai' });
    await child.scrollIntoViewIfNeeded();
    await child.click(); 	
  
    // Close the modal
    await this.page.getByRole('button', { name: '⨉' }).click();
  }


    async KCorp_CYDA() {
    const heading = this.page.locator('h5.pointer', { hasText: 'KCorp Foundation -' });
    await heading.scrollIntoViewIfNeeded();
    await heading.click();
    console.log('✅ Clicked KCorp_UWM');
  
    // Then click the nested entry (child location or project)
    const child = this.page.locator('h5', { hasText: ' CYDA ' });
    await child.scrollIntoViewIfNeeded();
    await child.click(); 	
  
    // Close the modal
    await this.page.getByRole('button', { name: '⨉' }).click();
  }


  async SMDT() {

  // Expand parent org
  const heading = this.page.locator('h5.pointer', {
    hasText: 'SMDT - 1'
  });

  await heading.scrollIntoViewIfNeeded();
  await heading.click();

  console.log('✅ Clicked SMDT parent');

  // Click child org
  const child = this.page.locator('h5', {
    hasText: 'Tilaknagar Site'
  });

  await child.scrollIntoViewIfNeeded();
  await child.click();

  console.log('✅ Selected SMDT -> Tilaknagar Site');

  // Close modal
  await this.page.getByRole('button', { name: '⨉' }).click();
}


}
module.exports = {LoginPage};
