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

  await this.page.waitForSelector('text=Sign in with Email', {
    timeout: 15000
  });

  await this.signinicon.click();

  await this.username.fill(username);
  await this.password.fill(password);

  await this.signin.click();

  console.log('✅ Login button clicked');

  await this.page.waitForTimeout(3000);

  // Close button popup
  try {
    const closeBtn = this.page.getByRole('button', { name: /^Close$/i });

    if (await closeBtn.first().isVisible().catch(() => false)) {
      await closeBtn.first().click({ force: true });
      console.log('✅ Close popup handled');
    }
  } catch {}

  // Push Setting popup
  try {
    const popupClose = this.page.locator('#popup_close').first();

    if (await popupClose.isVisible().catch(() => false)) {
      await popupClose.click({ force: true });
      console.log('✅ Push Setting popup closed');
    }
  } catch {}

  // Cookie popup
  try {
    const acceptBtn = this.page.locator('button:has-text("Accept")').first();

    if (await acceptBtn.isVisible().catch(() => false)) {
      await acceptBtn.click({ force: true });
      console.log('✅ Cookie popup accepted');
    }
  } catch {}

  // Sometimes cookie popup appears late
  await this.page.waitForTimeout(2000);

  try {
    const acceptBtn = this.page.locator('button:has-text("Accept")').first();

    if (await acceptBtn.isVisible().catch(() => false)) {
      await acceptBtn.click({ force: true });
      console.log('✅ Late Cookie popup accepted');
    }
  } catch {}

  await this.page.waitForLoadState('networkidle').catch(() => {});
await this.page.waitForTimeout(3000);

try {
  await this.page.locator('li[data-tip] img').first().waitFor({
    state: 'visible',
    timeout: 30000
  });

  console.log('✅ Globe icon found');
} catch {
  console.log('❌ Globe icon NOT found after login');
}

console.log('🌐 Current URL:', this.page.url());

await this.page.screenshot({
  path: `after-login-${Date.now()}.png`,
  fullPage: true
});

console.log('✅ Login completed');
}

 


  
  async Jashpur() {
    
    const heading = this.page.locator('h5.pointer', { hasText: 'Jashpur District -' });
    await heading.scrollIntoViewIfNeeded();
    await heading.click();
    console.log('✅ Clicked MP Jashpur ');
    const child = this.page.locator('h5', { hasText: 'Jeetu Toli Mini' });
    await child.scrollIntoViewIfNeeded();
    await child.click();
  
    // Close the modal
    await this.page.getByRole('button', { name: '⨉' }).click();
  }


  async Barwani() {
    
    const heading = this.page.locator('h5.pointer', { hasText: 'MP Barwani -' });
    await heading.scrollIntoViewIfNeeded();
    await heading.click();
    console.log('✅ Clicked MP Barwani heading');
    const child = this.page.locator('h5', { hasText: 'AADIWASHI BEDIPURA KRMANK 07' });
    await child.scrollIntoViewIfNeeded();
    await child.click();
  
    // Close the modal
    await this.page.getByRole('button', { name: '⨉' }).click();
  }
  
  

  

 async Chhatarpur() {
    const heading = this.page.locator('h5.pointer', { hasText: 'MP Chhatarpur - 2373' });
    await heading.scrollIntoViewIfNeeded();
    await heading.click();
    console.log('✅ Clicked MP Chhatarpur heading');
  
    // Then click the nested entry (child location or project)
    const child = this.page.locator('h5', { hasText: 'MP Chhatarpur - 14 Satai' });
    await child.scrollIntoViewIfNeeded();
    await child.click();
  
    // Close the modal
    await this.page.getByRole('button', { name: '⨉' }).click();
  }
  

  async Dindori() {
    const heading = this.page.locator('h5.pointer', { hasText: 'MP Dindori' });
    await heading.scrollIntoViewIfNeeded();
    await heading.click();
    console.log('✅ Clicked MP Dindori');
  
    // Then click the nested entry (child location or project)
    const child = this.page.locator('h5', { hasText: '(IMLI TOLA) MADHOPUR' });
    await child.scrollIntoViewIfNeeded();
    await child.click();
  
    // Close the modal
    await this.page.getByRole('button', { name: '⨉' }).click();
  }
  
 
 async Ratlam() {
    // Target the correct heading with class `pointer` and expected text
    const heading = this.page.locator('h5.pointer', { hasText: 'MP Ratlam - 2382' });
    await heading.scrollIntoViewIfNeeded();
    await heading.click();
    console.log('✅ Clicked MP Ratlam');
  
    // Select the specific location within the district
    const location = this.page.locator('h5', { hasText: '1 Naya Malipura' });
    await location.scrollIntoViewIfNeeded();
    await location.click();
  
    // Close the modal
    await this.page.getByRole('button', { name: '⨉' }).click();
  }

  async Sheopur() {
    const heading = this.page.locator('h5.pointer', { hasText: 'MP Sheopur -' });
    await heading.scrollIntoViewIfNeeded();
    await heading.click();
    console.log('✅ Clicked MP Sheopur');
  
    // Then click the nested entry (child location or project)
    const child = this.page.locator('h5', { hasText: 'MP Sheopur - "Balwirpura, morawan' });
    await child.scrollIntoViewIfNeeded();
    await child.click(); 	
  
    // Close the modal
    await this.page.getByRole('button', { name: '⨉' }).click();
  }
  

  async Singrauli() {
    const heading = this.page.locator('h5', { hasText: 'MP Singrauli -' });
    await heading.scrollIntoViewIfNeeded();
    await heading.click();
    console.log('✅ Clicked MP Singrauli');
  
    // Then click the nested entry (child location or project)
    const child = this.page.getByRole('heading', { name: 'MP Singrauli - Aadiwasi' });
    await child.scrollIntoViewIfNeeded();
    await child.click(); 	
  
    // Close the modal
    await this.page.getByRole('button', { name: '⨉' }).click();
  }


  async Vidisha() {
    const heading = this.page.locator('h5.pointer', { hasText: 'MP Vidisha -' });
    await heading.scrollIntoViewIfNeeded();
    await heading.click();
    console.log('✅ Clicked MP Vidisha');
  
    // Then click the nested entry (child location or project)
    const child = this.page.locator('h5', { hasText: /^MP Vidisha - 1$/ });
    await child.scrollIntoViewIfNeeded();
    await child.click(); 	
  
    // Close the modal
    await this.page.getByRole('button', { name: '⨉' }).click();
  }
  

 
  async Nanded() {
    const heading = this.page.locator('h5.pointer', { hasText: 'Nanded District' });
    await heading.scrollIntoViewIfNeeded();
    await heading.click();
    console.log('✅ Clicked Nanded');
  
    // Then click the nested entry (child location or project)
    const child = this.page.locator('h5', { hasText: 'ALUR' }).first();
    await child.scrollIntoViewIfNeeded();
    await child.click(); 	
  
    // Close the modal
    await this.page.getByRole('button', { name: '⨉' }).click();
  }
  

     async KCorpAROEHAN() {

  const globe = this.page.locator('li[data-tip] img').first();

  await globe.waitFor({
    state: 'visible',
    timeout: 15000
  });

  await globe.click({ force: true });

  await this.page.waitForTimeout(2000);

  // Click parent exactly as old code used to do
  const heading = this.page.locator('h5.pointer', {
    hasText: 'KCorp Foundation -'
  });

  await heading.waitFor({
    state: 'visible',
    timeout: 30000
  });

  await heading.click();

  await this.page.waitForTimeout(3000);

  // Child org
  const child = this.page.locator('h5', {
    hasText: 'KCorp Foundation - AROEHAN'
  });

  await child.waitFor({
    state: 'visible',
    timeout: 20000
  });

  await child.click();

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