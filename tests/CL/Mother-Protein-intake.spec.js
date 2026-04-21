const { test, expect } = require('@playwright/test');
const { LoginPage } = require('../../pageObject/CL_loginpage');
const dataset = require('../../cred/credential.json');
const { loginToApp } = require('./helpers/commonActions');

test('Mother-Protein-intake-Form', async ({ page }) => {
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

  // ---------------- OPEN TAB ----------------
  await page.getByText("Mother's Protein Intake", { exact: true }).click();
  await page.waitForTimeout(800);

  await page.getByRole('button', { name: 'Add' }).click();
  await page.waitForTimeout(1200);

  // ---------------- HELPERS ----------------

  async function closeAnyOpenDropdown() {
    await page.mouse.click(50, 50);
    await page.waitForTimeout(250);
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

    const escaped = optionText.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

    // Use LAST visible matching option because old hidden menus may remain in DOM
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

  async function setDayAndWeek(daySelector, weekSelector, dayValue = '1', weekValue = '4 days') {
    await selectExactDropdown(daySelector, dayValue);
    await selectExactDropdown(weekSelector, weekValue);
  }

  // ---------------- TOP FIELDS ----------------

  const assessmentDate = page.locator('input.form-input.form-input-gray.form-input-full').first();
  await assessmentDate.scrollIntoViewIfNeeded();
  await assessmentDate.click();
  await page.waitForTimeout(500);

  await page.locator('.react-datepicker__day--009:not(.react-datepicker__day--outside-month)').click();
  await expect(assessmentDate).toHaveValue(/Apr 9, 2026/i);

  await selectExactDropdown('#diet_type', 'Vegetarian');
  await selectExactDropdown('#mother_status', 'Lactating Mother (PNC stage)');

  // ---------------- DETAILS ABOUT PULSES ----------------
  await setDayAndWeek(
    '#c_sprouts_taken_per_day_container input.dd-button',
    '#c_sprouts_taken_per_week_container input.dd-button',
    '1',
    '4 days'
  );

  await setDayAndWeek(
    '#c_beans_taken_per_day_container input.dd-button',
    '#c_beans_taken_per_week_container input.dd-button',
    '1',
    '4 days'
  );

  // ---------------- DETAILS ABOUT MILK PRODUCTS ----------------
  await setDayAndWeek(
    '#c_curd_taken_per_day_container input.dd-button',
    '#c_curd_taken_per_week_container input.dd-button',
    '1',
    '4 days'
  );

  await setDayAndWeek(
    '#c_paneer_taken_per_day_container input.dd-button',
    '#c_paneer_taken_per_week_container input.dd-button',
    '1',
    '4 days'
  );

  await setDayAndWeek(
    '#c_milk_taken_per_day_container input.dd-button',
    '#c_milk_taken_per_week_container input.dd-button',
    '1',
    '4 days'
  );

  // ---------------- DETAILS ABOUT GRAINS AND MILLETS ----------------
  await setDayAndWeek(
    '#c_roti_taken_per_day_container input.dd-button',
    '#c_roti_taken_per_week_container input.dd-button',
    '1',
    '4 days'
  );

  await setDayAndWeek(
    '#c_rice_taken_per_day_container input.dd-button',
    '#c_rice_taken_per_week_container input.dd-button',
    '1',
    '4 days'
  );

await setDayAndWeek(
  '#c_paratha_taken_per_day_container input.dd-button',
  '#c_paratha_taken_per_week_container input.dd-button',
  '1',
  '4 days'
);

  await setDayAndWeek(
    '#c_millets_taken_per_day_container input.dd-button',
    '#c_millets_taken_per_week_container input.dd-button',
    '1',
    '4 days'
  );

  // ---------------- DETAILS ABOUT GREEN LEAFY VEGETABLES ----------------
  await setDayAndWeek(
    '#c_dry_taken_per_day_container input.dd-button',
    '#c_dry_taken_per_week_container input.dd-button',
    '1',
    '4 days'
  );

  await setDayAndWeek(
    '#c_cooked_taken_per_day_container input.dd-button',
    '#c_cooked_taken_per_week_container input.dd-button',
    '1',
    '4 days'
  );

    // ---------------- DETAILS ABOUT OTHER VEGETABLES ----------------
  await setDayAndWeek(
    '#c_drycooked_taken_per_day_container input.dd-button',
    '#c_drycooked_taken_per_week_container input.dd-button',
    '1',
    '4 days'
  );

  await setDayAndWeek(
    '#c_othercooked_taken_per_day_container input.dd-button',
    '#c_othercooked_taken_per_week_container input.dd-button',
    '1',
    '4 days'
  );

  // ---------------- DETAILS ABOUT ROOTS AND TUBERS ----------------
  await setDayAndWeek(
    '#c_roots_taken_per_day_container input.dd-button',
    '#c_roots_taken_per_week_container input.dd-button',
    '1',
    '4 days'
  );

  await setDayAndWeek(
    '#c_rootscooked_taken_per_day_container input.dd-button',
    '#c_rootscooked_taken_per_week_container input.dd-button',
    '1',
    '4 days'
  );

  // ---------------- DETAILS ABOUT NUTS AND SEEDS ----------------
  await setDayAndWeek(
    '#c_nuts_taken_per_day_container input.dd-button',
    '#c_nuts_taken_per_week_container input.dd-button',
    '1',
    '4 days'
  );

  // ---------------- CALCULATED FIELDS ----------------
await expect(page.getByText('Total protein from all foods (grams)', { exact: true }).first()).toBeVisible();
await expect(page.getByText('Excellent and high quality protein (grams)', { exact: true }).first()).toBeVisible();

  // ---------------- SUBMIT ----------------
  await page.locator('#f_submit_btn').click();
  await page.waitForLoadState('networkidle');

  console.log("✅ Mother's Protein Intake form submitted successfully");
});