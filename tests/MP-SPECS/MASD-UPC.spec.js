const { test, expect } = require('@playwright/test');
const { LoginPage } = require('../pageObject/loginpage');
const dataset = JSON.parse(JSON.stringify(require("../cred/credential.json")));

test('Print Member Dashboard name and last updated date for second user', async ({ page }) => {
  const loginPage = new LoginPage(page);
  await loginPage.goTo();
  await loginPage.ValidLogin(dataset.username, dataset.password);

  // Open Chhatarpur dashboard
  await page.getByRole('list').locator('a').nth(1).click();
  await page.waitForTimeout(1000);
  await loginPage.Chhatarpur();
  await page.waitForTimeout(2000);

  // Go to Members tab
  await page.getByRole('list').locator('div img').click();
  await page.getByRole('link', { name: /Members/i }).click();
  await page.waitForLoadState('networkidle');

  // Select second user
  const secondRow = page.locator('table.table.table-stripe tbody tr').nth(1);
  await expect(secondRow).toBeVisible({ timeout: 5000 });

  const nameCell = secondRow.locator('div.fw500');
  const displayName = (await nameCell.textContent()).trim();

  const dashboardLink = secondRow.locator('a[tooltip="Member Dashboard"]');
  await expect(dashboardLink).toBeVisible({ timeout: 5000 });
  await dashboardLink.click();
  await page.waitForLoadState('networkidle');

  // Extract greeting name
  const greetingEl = page.locator('h2.f18.bold-600');
  await expect(greetingEl).toBeVisible({ timeout: 7000 });
  const greeting = await greetingEl.textContent();
  const user = greeting?.replace('Hello,', '').trim() || '';
  console.log(`👤 Member Name: ${user}`);

  // Extract Last Updated date
  const lastUpdatedEl = page.locator('h2.f14');
  await expect(lastUpdatedEl).toBeVisible({ timeout: 5000 });
  const lastUpdated = await lastUpdatedEl.textContent();
  console.log(`📅 Last Updated: ${lastUpdated.trim()}`);
});





test('Start Rating Last Updated Timestamp', async ({ page }) => {
  const loginPage = new LoginPage(page);
  await loginPage.goTo();
  await loginPage.ValidLogin(dataset.username, dataset.password);

  // Open Chhatarpur dashboard
  await page.getByRole('list').locator('a').nth(1).click();
  await page.waitForTimeout(1000);
  await loginPage.Barwani();
  await page.waitForTimeout(2000);

  // Go to Members tab
  await page.getByRole('list').locator('div img').click();
  await page.locator("#dashboard").click();
  const firstRow = page.locator('#patient_lists tbody tr').nth(3);
  await expect(firstRow).toBeVisible({ timeout: 7000 });
  const userCell = firstRow.locator('#path_details');
  await userCell.click();
  await page.locator("#case_ratings").click();
  const modalDateLocator = page.locator('div.p-10.f16');
  await expect(modalDateLocator).toBeVisible({ timeout: 5000 });

  const textContent = await modalDateLocator.textContent();
  const dateMatch = textContent.match(/(\w+ \d{2} \d{4})/); // matches "June 05 2025"

  if (dateMatch) {
  console.log(`📅 Star Rating Last Updated: ${dateMatch[1]}`);
  } else {
  console.warn('❌ Date not found in the modal');
 }

});


  
  
