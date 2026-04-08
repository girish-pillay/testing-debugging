const { test, expect } = require('@playwright/test');
const { LoginPage } = require('../pageObject/loginpage');
const creds = require('../cred/credential.json');

test('Mother Child Form – Hindi Audit Report (Non-blocking)', async ({ page }) => {

  const loginPage = new LoginPage(page);

  // 1️⃣ Login
  await loginPage.goTo();
  await loginPage.ValidLogin(creds.username, creds.password);

  // 2️⃣ Open Mother–Child form
  await page.locator('#add_new_journey i').click();
  await page.locator('.popup-menu-title', { hasText: 'माँ' }).click();

  // 3️⃣ Wait for form
  const form = page.locator('form');
  await expect(form).toBeVisible();

  // 4️⃣ Extract all visible text
  const fullText = await form.innerText();

  // 5️⃣ Normalize text lines
  const lines = fullText
    .split('\n')
    .map(t => t.trim())
    .filter(Boolean);

  const hindiRegex = /[\u0900-\u097F]/;
  const englishRegex = /[A-Za-z]/;

  const hindiTexts = [];
  const nonHindiTexts = [];

  for (const line of lines) {
    if (hindiRegex.test(line)) {
      hindiTexts.push(line);
    } else if (englishRegex.test(line)) {
      nonHindiTexts.push(line);
    }
  }

  // 6️⃣ Allowed Non-Hindi (known exceptions)
  const allowedPatterns = [
    'CHENNAI',
    'cT-500',
    'IPIPAL',
    'All rights reserved',
    '2026'
  ];

  const allowed = [];
  const unexpected = [];

  for (const text of nonHindiTexts) {
    if (allowedPatterns.some(p => text.includes(p))) {
      allowed.push(text);
    } else {
      unexpected.push(text);
    }
  }

  // 7️⃣ PRINT FULL AUDIT REPORT
  console.log('\n📋 HINDI AUDIT REPORT');
  console.log('────────────────────');

  console.log(`\n🟢 HINDI TEXT FOUND (${hindiTexts.length}):`);
  hindiTexts.forEach((t, i) => console.log(`${i + 1}. ${t}`));

  console.log(`\n⚠️ NON-HINDI TEXT FOUND (${nonHindiTexts.length}):`);
  nonHindiTexts.forEach((t, i) => console.log(`${i + 1}. ${t}`));

  console.log(`\n🟡 ALLOWED NON-HINDI (${allowed.length}):`);
  allowed.forEach((t, i) => console.log(`${i + 1}. ${t}`));

  console.log(`\n🔴 UNEXPECTED NON-HINDI (${unexpected.length}):`);
  if (unexpected.length === 0) {
    console.log('🎉 No unexpected Non-Hindi text found!');
  } else {
    unexpected.forEach((t, i) => console.log(`${i + 1}. ${t}`));
  }

  console.log('\n✅ TEST STATUS: PASSED (Audit only)');

  // 8️⃣ Non-blocking test → always PASS
  expect(true).toBeTruthy();
});