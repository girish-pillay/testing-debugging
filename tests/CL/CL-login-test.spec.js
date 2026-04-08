const { test, expect } = require('@playwright/test');
const fs = require('fs');

const { LoginPage } = require('../../pageObject/CL_loginpage');
const dataset = require('../../cred/Cuedlink-creds.json');


test('Cuedlink Login validation', async ({ page }) => {
  const loginPage = new LoginPage(page);

  await loginPage.goTo();
  await loginPage.ValidLogin(dataset.username, dataset.password);

  const currentUrl = page.url();
  console.log('Current URL:', currentUrl);

  expect(currentUrl).toContain('iitm');
});


test('Cuedlink wrong password validation', async ({ page }) => {
  const loginPage = new LoginPage(page);

  await loginPage.goTo();

  
  page.once('dialog', async (dialog) => {
    console.log('Alert message:', dialog.message());

    expect(dialog.message()).toContain(
      'The information provided is not valid'
    );

    await dialog.accept(); // click OK
  });

  
  await loginPage.ValidLogin(dataset.username, 'wrongPassword123');

  
});
