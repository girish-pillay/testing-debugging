const { test, expect } = require('@playwright/test');
const { LoginPage } = require('../../pageObject/CL_loginpage');
const dataset = require('../../cred/credential.json');
const {
  loginToApp,} = require('./helpers/commonActions');

test('Mother-CHild-Form', async ({ page, context, browserName }) => {
  test.setTimeout(90000);

  const loginPage = new LoginPage(page);

  /* LOGIN */
  await loginToApp(loginPage, dataset);
  await loginPage.cuetree();
  
  await page.locator('#add_new_journey').click();

  await page.getByText('Register a mother (mother-child nutrition case)').click();

    // ---------- Adoption date ----------
  const adoptionDateInput = page
    .locator('input.form-input.form-input-gray.form-input-full')
    .first();

  await adoptionDateInput.click();
  await page.locator('[aria-label="Choose Wednesday, April 1st, 2026"]').click();

  // ---------- Mother Name ----------
  await page.locator('#mother_name').fill('Test Mother');



  // ---------- Who is involved ----------
await page.locator('#type_of_case').click();
await page.getByText('A mother who already delivered her baby', { exact: true }).click();

await expect(page.getByText('What was the delivery date?')).toBeVisible();

// ---------- Delivery date = 8 April ----------
const deliveryDateField = page.getByText('What was the delivery date?', { exact: true })
  .locator('xpath=following::input[1]');

await deliveryDateField.scrollIntoViewIfNeeded();
await deliveryDateField.click();
await page.waitForTimeout(500);

await page.locator('[aria-label="Choose Wednesday, April 8th, 2026"]:visible').click();
await expect(deliveryDateField).not.toHaveValue('');

  // ---------- Mother Age = 27 ----------
  await page.locator('#mother_age').click();
  await page.getByText('27', { exact: true }).click();

  // ---------- Mother Weight = 48 ----------
  await page.locator('#mother_weight').click();
  await page.getByText('48', { exact: true }).click();

  // ---------- Mother Height = 135 ----------
  await page.locator('#mother_height').click();
  await page.getByText('135', { exact: true }).click();

  // ---------- Diet Type = Vegetarian ----------
  await page.locator('#diet_type').click();
  await page.getByText('Vegetarian', { exact: true }).click();

  // ---------- Mobile Number ----------
  await page.locator('#cell_number').fill('1234567890');


// helper
async function selectCustomDropdown(page, inputSelector, optionText) {
  const input = page.locator(inputSelector);

  await input.scrollIntoViewIfNeeded();
  await page.waitForTimeout(300);

  await input.evaluate(el => el.click());
  await page.waitForTimeout(500);

  await page.getByRole('listitem').filter({ hasText: optionText }).first().click();
  await page.waitForTimeout(300);
}

// ---------- Mother Education ----------
await selectCustomDropdown(page, '#mothers_education', 'Class 5');

// ---------- Ration Card ----------
await selectCustomDropdown(page, '#income_category', 'Orange');

// ---------- Family Type ----------
await selectCustomDropdown(page, '#family_type', 'Nuclear family');

// ---------- Social Category ----------
await selectCustomDropdown(page, '#social_category', 'Scheduled Caste (SC)');

// ---------- Submit ----------
await page.locator('#f_submit_btn').click();

// ---------- Confirmation modal ----------
await expect(page.getByText('Confirm this information that you entered')).toBeVisible();
await page.getByRole('button', { name: 'Update' }).click();
}
)