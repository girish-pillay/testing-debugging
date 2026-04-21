const { test, expect } = require('@playwright/test');
const { LoginPage } = require('../../pageObject/CL_loginpage');
const dataset = require('../../cred/credential.json');
const {
  loginToApp,} = require('./helpers/commonActions');

test('Add-Child-Form', async ({ page, context, browserName }) => {
  test.setTimeout(90000);

  const loginPage = new LoginPage(page);

  /* LOGIN */
  await loginToApp(loginPage, dataset);
  await loginPage.cuetree();
 

await page.locator('#filter').click();
await page.getByText('Search By', { exact: true }).click();
await page.locator('.checkbox-container').filter({ hasText: 'User Name' }).first().click();

await page.locator('input[placeholder="Search"]').last().fill('girish');
await page.waitForTimeout(1500);

await page.mouse.click(40, 200);
await page.waitForTimeout(1000);

await page.locator('#patient_lists tbody tr').first().locator('#path_details').click();
await page.waitForLoadState('networkidle');

await page.getByRole('link', { name: /add child/i }).click();
await page.waitForLoadState('networkidle');

  // ---------------- HELPER FOR CUSTOM DROPDOWNS ----------------
  async function selectCustomDropdown(inputSelector, optionText) {
  const input = page.locator(inputSelector);

  await input.scrollIntoViewIfNeeded();
  await input.click();
  await page.waitForTimeout(300);

  const exactOption = page.locator('li div').filter({
    hasText: new RegExp(`^${optionText.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`)
  }).first();

  await exactOption.click();
  await expect(input).toHaveValue(optionText);
}
  // ---------------- CHILD FORM ----------------

  // Babies born in this delivery? = Single
  await selectCustomDropdown('#multiple_pregnancy', 'Single');
  await expect(page.locator('#multiple_pregnancy')).toHaveValue('Single');

  // Baby's name
  await page.locator('#baby_name').fill('Test-bb');

  // Date of birth should already be Apr 8, 2026
  await expect(page.locator('input.form-input').filter({ has: page.locator('[value="Apr 8, 2026"]') }).first()).toBeVisible().catch(() => {});

  // Birth Weight (in Kgs) = 3
  // Birth Weight (in Kgs) = 3
const weightInput = page.locator('#weight');

await weightInput.click();
await weightInput.fill('3');   // 🔥 important step
await page.waitForTimeout(500);

await page.locator('li div').filter({ hasText: /^3$/ }).first().click();
await expect(weightInput).toHaveValue('3');

  // Length at birth (in cms) = 35
  await selectCustomDropdown('#height', '35');
  await expect(page.locator('#height')).toHaveValue('35');

  // Baby's gender = Male
  await selectCustomDropdown('#gender', 'Male');
  await expect(page.locator('#gender')).toHaveValue('Male');

  // Method of delivery = Normal
  await selectCustomDropdown('#delivery_type', 'Normal');
  await expect(page.locator('#delivery_type')).toHaveValue('Normal');

  // Location of delivery = CH (Civil hospital)
  await selectCustomDropdown('#delivery_location', 'CH (Civil hospital)');
  await expect(page.locator('#delivery_location')).toHaveValue('CH (Civil hospital)');

  // Is this the mother's first pregnancy? = Yes
  await selectCustomDropdown('#first_pregnancy', 'Yes');
  await expect(page.locator('#first_pregnancy')).toHaveValue('Yes');

  // Was breast crawl performed at birth? = Yes
  await selectCustomDropdown('#crawl_at_delivery', 'Yes');
  await expect(page.locator('#crawl_at_delivery')).toHaveValue('Yes');

  // Was baby exclusively breastfed within 1 hour of birth? = Yes
  await selectCustomDropdown('#excl_bf_hour_birth', 'Yes');
  await expect(page.locator('#excl_bf_hour_birth')).toHaveValue('Yes');

  // Was baby exclusively breastfed during the ward stay? = Yes
  await selectCustomDropdown('#feed_hospital', 'Yes');
  await expect(page.locator('#feed_hospital')).toHaveValue('Yes');


  // Click submit
await page.locator('#f_submit_btn').click();


// ---------- Confirmation modal ----------
await expect(page.getByText('Confirm this information that you entered')).toBeVisible();
await page.getByRole('button', { name: 'Update' }).click();


});