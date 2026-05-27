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
  await this.page.waitForLoadState('networkidle');
  await this.page.waitForSelector('text=Sign in with Email', { timeout: 10000 });

  await this.signinicon.click();
  await this.username.fill(username);
  await this.username.press('Tab');
  await this.password.fill(password);
  await this.signin.click();

  if (await this.closebtn.isVisible().catch(() => false)) {
  await this.closebtn.click();
}

  // ✅ Close Push Setting popup immediately after login
  await this.page.waitForTimeout(1000);

  const popupClose = this.page.locator('#popup_close').first();

  if (await popupClose.isVisible().catch(() => false)) {
    console.log('⚠️ Push setting popup detected after login');
    await popupClose.click({ force: true });
    await this.page.waitForTimeout(800);
    console.log('✅ Push setting popup closed');
  }

  // ✅ Cookie Accept popup
const acceptBtn = this.page.locator('button:has-text("Accept")');

if (await acceptBtn.isVisible().catch(() => false)) {
  await acceptBtn.click({ force: true });
  console.log('✅ Cookie popup accepted');
}
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
    const heading = this.page.locator('h5.pointer', { hasText: 'KCorp Foundation -' });
    await heading.scrollIntoViewIfNeeded();
    await heading.click();
    console.log('✅ Clicked KCorpAROEHAN');
  
    // Then click the nested entry (child location or project)
    const child = this.page.locator('h5', { hasText: 'KCorp Foundation - AROEHAN' });
    await child.scrollIntoViewIfNeeded();
    await child.click(); 	
  
    // Close the modal
    await this.page.getByRole('button', { name: '⨉' }).click();
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