const { test, expect } = require('@playwright/test');
const { LoginPage } = require('../../pageObject/CL_loginpage');
const dataset = require('../../cred/credential.json');
const { loginToApp } = require('./helpers/commonActions');

test('Measurement-Form', async ({ page }) => {
  test.setTimeout(180000);

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


  // ---------------- OPEN MEASUREMENT TAB ----------------
  await page.getByText('Measurement', { exact: true }).click();
  await page.waitForTimeout(1000);

  // ---------------- CLICK ADD ----------------
  const addButton = page.locator('#add_measure_growth');
  await expect(addButton).toBeVisible();
  await addButton.click();
  await page.waitForTimeout(1200);

  // ---------------- MODAL CHECK ----------------
  await expect(page.getByText("Measure child's weight and height", { exact: true })).toBeVisible();

  // ---------------- HELPERS ----------------
  async function closeAnyOpenDropdown() {
    await page.mouse.click(50, 50);
    await page.waitForTimeout(300);
  }

  async function selectExactDropdown(inputSelector, optionText) {
    const input = page.locator(inputSelector);

    await input.scrollIntoViewIfNeeded();
    await expect(input).toBeVisible();

    const current = (await input.inputValue().catch(() => '')).trim();
    if (current === optionText) return;

    await closeAnyOpenDropdown();
    await input.click({ force: true });
    await page.waitForTimeout(500);

    // searchable dropdown
    await input.fill(optionText);
    await page.waitForTimeout(500);

    const escaped = optionText.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

    const option = page
      .locator('li div:visible')
      .filter({ hasText: new RegExp(`^${escaped}$`) })
      .last();

    await option.waitFor({ state: 'visible', timeout: 8000 });
    await option.scrollIntoViewIfNeeded().catch(() => {});
    await option.click({ force: true });

    await expect(input).toHaveValue(optionText, { timeout: 5000 });
    await page.waitForTimeout(300);
  }

  async function setDateByCalendar(inputLocator, dayText = '9') {
    await inputLocator.scrollIntoViewIfNeeded();
    await inputLocator.click();
    await page.waitForTimeout(500);

    await page.locator(`.react-datepicker__day--0${dayText.padStart(2, '0')}:not(.react-datepicker__day--outside-month)`).click();
    await page.waitForTimeout(500);
  }

  // ---------------- MEASUREMENT DATE ----------------
  const measurementDate = page.locator('input.form-input.form-input-gray.form-input-full').first();
  await setDateByCalendar(measurementDate, '15');
  await expect(measurementDate).toHaveValue(/Apr 15(th)?, 2026/i);

  // ---------------- ABLE TO MEASURE ----------------
await selectExactDropdown('#yes_or_no', 'Yes');
await page.mouse.click(50, 50);
await page.waitForTimeout(300);

  // ---------------- LOCATION ----------------
  await selectExactDropdown('#location', "Mother's home");

  // ---------------- WEIGHT ----------------
  await selectExactDropdown('#baby_weight', '3.5');

  // ---------------- LENGTH ----------------
  await selectExactDropdown('#height_baby', '120');

  // ---------------- ILLNESS ----------------
  await selectExactDropdown('#illness', 'No');

  // ---------------- FED ANYTHING EXCEPT BREASTMILK ----------------
  await selectExactDropdown('#other_food', 'No');

  // ---------------- SUBMIT ----------------
  await page.locator('#f_submit_btn').scrollIntoViewIfNeeded();
  await page.locator('#f_submit_btn').click();

  // ---------- Confirmation modal ----------
await expect(page.getByText('Confirm this information that you entered')).toBeVisible();
await page.getByRole('button', { name: 'Update' }).click();


  await page.waitForLoadState('networkidle');
  console.log('✅ Measurement form submitted successfully');
});