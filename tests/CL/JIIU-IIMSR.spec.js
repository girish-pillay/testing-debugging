const { test } = require('@playwright/test');
const { LoginPage } = require('../../pageObject/CL_loginpage');
const dataset = require('../../cred/credential.json');
const { loginToApp, openMASD } = require('./helpers/commonActions');

test('JIIU IIMSR MASD', async ({ page }) => {
  const loginPage = new LoginPage(page);

  await loginToApp(loginPage, dataset);
  await loginPage.JIIU_IIMSR();
  await openMASD(page);
});