const { test, expect } = require('@playwright/test');
const { LoginPage } = require('../../pageObject/CL_loginpage');
const dataset = require('../../cred/credential.json');
const { loginToApp } = require('./helpers/commonActions');

test('Check BF Form', async ({ page }) => {
  test.setTimeout(240000);

  const loginPage = new LoginPage(page);

  /* LOGIN */
  await loginToApp(loginPage, dataset);
  await loginPage.cuetree();

  // ---------------- SEARCH USER ----------------
  await page.locator('#filter').click();
  await page.getByText('Search By', { exact: true }).click();
  await page.locator('.checkbox-container').filter({ hasText: 'User Name' }).first().click();

  await page.locator('input[placeholder="Search"]').last().fill('girish');
  await page.waitForTimeout(1500);

  await page.mouse.click(40, 200);
  await page.waitForTimeout(1000);

  await page.locator('#patient_lists tbody tr').first().locator('#path_details').click();
  await page.waitForLoadState('networkidle');
  


  // ---------------- OPEN CHECK BF TAB ----------------
await page.getByText('Check BF', { exact: true }).click();

// wait for active panel
const checkBfPanel = page.locator('#rc-tabs-1-panel-assess_bf');
await expect(checkBfPanel).toBeVisible({ timeout: 10000 });

// correct Add button inside Check BF panel
const addBtn = checkBfPanel.locator('#bf_add_btn');
await expect(addBtn).toBeVisible({ timeout: 10000 });
await addBtn.click({ force: true });

await page.waitForTimeout(1500);

  // ---------------- MODAL CHECK ----------------
  await expect(page.getByText(/Assess breastfeeding/i)).toBeVisible();

  // ---------------- HELPERS ----------------
  async function clickSafe(locator, name = 'element') {
    await locator.scrollIntoViewIfNeeded().catch(() => {});
    await expect(locator).toBeVisible({ timeout: 10000 });
    await locator.click({ force: true });
    await page.waitForTimeout(400);
    console.log(`✅ Clicked ${name}`);
  }

  async function setAssessmentDate() {
    const dateInput = page.locator('input.form-input.form-input-gray.form-input-full').first();
    await dateInput.scrollIntoViewIfNeeded();
    await expect(dateInput).toBeVisible();

    // If date already present, keep it
    const currentVal = await dateInput.inputValue().catch(() => '');
    if (currentVal?.trim()) {
      console.log(`✅ Assessment date already present: ${currentVal}`);
      return;
    }

    await dateInput.click({ force: true });
    await page.waitForTimeout(400);

    // Adjust if needed for your datepicker
    const today = page.locator('.react-datepicker__day--today').first();
    if (await today.count()) {
      await today.click({ force: true });
    } else {
      await page.keyboard.press('ArrowDown').catch(() => {});
      await page.keyboard.press('Enter').catch(() => {});
    }

    await page.waitForTimeout(500);
    console.log('✅ Assessment date set');
  }

  async function selectYesIfPresent(section) {
    const yesLabel = section.locator('label.radio-container', { hasText: /^Yes$/i }).first();
    if (await yesLabel.count()) {
      await clickSafe(yesLabel.locator('.radio-checkmark').first(), 'Yes option');
      return true;
    }

    const yesSpan = section.locator('span', { hasText: /^Yes$/i }).first();
    if (await yesSpan.count()) {
      await clickSafe(yesSpan, 'Yes option');
      return true;
    }

    return false;
  }

  async function selectFirstRadio(section) {
    const firstRadioMark = section.locator('.radio-checkmark').first();
    if (await firstRadioMark.count()) {
      await clickSafe(firstRadioMark, 'first radio option');
      return true;
    }

    const firstRadioLabel = section.locator('label.radio-container').first();
    if (await firstRadioLabel.count()) {
      await clickSafe(firstRadioLabel, 'first radio label');
      return true;
    }

    return false;
  }

  async function selectFirstCheckbox(section) {
    const firstCheckboxMark = section.locator('.checkbox-checkmark').first();
    if (await firstCheckboxMark.count()) {
      await clickSafe(firstCheckboxMark, 'first checkbox option');
      return true;
    }

    const firstCheckbox = section.locator('input[type="checkbox"]').first();
    if (await firstCheckbox.count()) {
      await firstCheckbox.check({ force: true });
      console.log('✅ Checked first checkbox');
      return true;
    }

    return false;
  }

  async function fillCurrentField(fieldId) {
    const shortId = fieldId.replace(/^field_/, '');

    // The actual question block on right side usually matches the short id
    const section = page.locator(`#${shortId}`).first();

    if (!(await section.count())) {
      console.log(`⚠️ No section found for ${fieldId}, skipping`);
      return;
    }

    await section.scrollIntoViewIfNeeded().catch(() => {});
    await page.waitForTimeout(300);

    // Priority 1: Yes if available
    if (await selectYesIfPresent(section)) return;

    // Priority 2: First radio option
    if (await selectFirstRadio(section)) return;

    // Priority 3: First checkbox option
    if (await selectFirstCheckbox(section)) return;

    console.log(`⚠️ No selectable option found for ${fieldId}`);
  }

  async function clickNextOrSubmit() {
    const nextBtn = page.getByRole('button', { name: /^Next$/i });
    if (await nextBtn.count()) {
      await clickSafe(nextBtn.first(), 'Next button');
      return 'next';
    }

    const submitBtn =
      page.getByRole('button', { name: /submit|update|save/i }).first();

    if (await submitBtn.count()) {
      await clickSafe(submitBtn, 'Submit/Update button');
      return 'submit';
    }

    return 'none';
  }

  // ---------------- FIELD 1 : ASSESSMENT DATE ----------------
  await setAssessmentDate();

  // ---------------- GET LEFT PANEL FIELDS ----------------
  const fieldMenuItems = page.locator('#fields_panel > div[id^="field_"]');
  const totalFields = await fieldMenuItems.count();
  console.log(`📌 Total fields found in Check BF form: ${totalFields}`);

  // Start from index 1 because index 0 is assessment date
  for (let i = 1; i < totalFields; i++) {
    const menuItem = fieldMenuItems.nth(i);
    const fieldId = await menuItem.getAttribute('id');

    if (!fieldId) continue;

    await clickSafe(menuItem, `menu item ${fieldId}`);
    await page.waitForTimeout(500);

    await fillCurrentField(fieldId);

    const action = await clickNextOrSubmit();
    await page.waitForTimeout(700);

    if (action === 'submit') {
      console.log('✅ Final submit/update triggered');
      break;
    }
  }

  // Optional confirmation popup
  const updateBtn = page.getByRole('button', { name: /^Update$/i });
  if (await updateBtn.count()) {
    await clickSafe(updateBtn.first(), 'confirmation Update');
  }

  await page.waitForLoadState('networkidle');
  console.log('✅ Check BF form completed successfully');
});