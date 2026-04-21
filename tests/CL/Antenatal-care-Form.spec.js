const { test, expect } = require('@playwright/test');
const { LoginPage } = require('../../pageObject/CL_loginpage');
const dataset = require('../../cred/credential.json');
const {
  loginToApp,} = require('./helpers/commonActions');

test('Antenatal-care-Form', async ({ page, context, browserName }) => {
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

await page.getByText('Antenatal care', { exact: true }).click();

await page.getByRole('button', { name: 'Add' }).click();
await page.waitForTimeout(1000);


// ---------- Assessment date ----------

const assessmentDate = page.locator('input.form-input.form-input-gray.form-input-full').first();

await assessmentDate.scrollIntoViewIfNeeded();
await assessmentDate.click();
await page.waitForTimeout(500);

await page.locator('.react-datepicker__day--009:not(.react-datepicker__day--outside-month)').click();

await expect(assessmentDate).toHaveValue(/Apr 9, 2026/i);


async function selectDropdown(page, selector, value) {
  const input = page.locator(selector);
  await input.scrollIntoViewIfNeeded();
  await input.click();
  await input.fill(value);   // important for searchable dropdown
  await page.waitForTimeout(300);

  await page.locator('li div').filter({ hasText: new RegExp(`^${value}$`) }).first().click();
  await expect(input).toHaveValue(value);
}

await selectDropdown(page, '#gestational_week', '4');

await selectDropdown(page, '#mother_weight', '45');

const foodInput = page.locator('#junk_food');

await foodInput.scrollIntoViewIfNeeded();
await foodInput.click();
await page.waitForTimeout(300);

await page.getByText('Tea/coffee', { exact: true }).click();
await page.waitForTimeout(300);

await selectDropdown(page, '#iron_supp', 'Yes');

await selectDropdown(page, '#folic_supp', 'Yes');

await selectDropdown(page, '#place_of_delivery', 'Private hospital');

const nextAncDate = page.getByText('Next Antenatal checkup date', { exact: true })
  .locator('xpath=following::input[contains(@class,"form-input")][1]');

await nextAncDate.scrollIntoViewIfNeeded();
await nextAncDate.click();
await page.waitForTimeout(500);

// Select month
await page.locator('.react-datepicker__month-select').selectOption('May');

// Select year
await page.locator('.react-datepicker__year-select').selectOption('2026');

// Select day 9
await page.locator('.react-datepicker__day--009:not(.react-datepicker__day--outside-month)').click();

// Validate
await expect(nextAncDate).toHaveValue(/May 9, 2026/i);

  // Click submit
await page.locator('#f_submit_btn').click();

});