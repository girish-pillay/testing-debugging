// login-session-setup.spec.js
const { test, expect } = require('@playwright/test');
const { LoginPage } = require('../pageObject/loginpage'); // if you have a login page object
const dataset = require('../cred/credential.json');

test('Login and save session state', async ({ page }) => {
  const loginPage = new LoginPage(page);
  await loginPage.goTo();
  await loginPage.ValidLogin(dataset.username, dataset.password);

  // Optional: verify successful login (e.g. URL or dashboard element)
 await expect(page).toHaveURL(/health\/table/i);
  // Save the session
  await page.context().storageState({ path: 'auth/storageState.json' });

  console.log('✅ Login successful and session saved.');
});
