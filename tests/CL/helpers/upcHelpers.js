const { expect } = require('@playwright/test');

async function waitForSUWRows(page) {
  let suwRows;
  let suwCount = 0;

  await expect
    .poll(
      async () => {
        suwRows = page.locator('#patient_lists tbody tr', { hasText: 'SUW' });
        suwCount = await suwRows.count();
        console.log(`🔎 SUW row count check: ${suwCount}`);
        return suwCount;
      },
      {
        timeout: 20000,
        intervals: [1000, 1500, 2000, 2500]
      }
    )
    .toBeGreaterThan(0);

  return { suwRows, suwCount };
}

async function openSecondOrFirstSUWUser(page, suwRows, suwCount) {
  const targetRow = suwCount > 1 ? suwRows.nth(1) : suwRows.first();

  await targetRow.scrollIntoViewIfNeeded().catch(() => {});
  await expect(targetRow).toBeVisible({ timeout: 10000 });

  const upcUser = targetRow.locator('.uline-hov').first();
  const userName = (await upcUser.textContent())?.trim() || 'Unknown User';

  await upcUser.click();

  await page.waitForSelector('.ml-modal-content', {
    state: 'visible',
    timeout: 20000
  });

  console.log(`✅ UPC opened for: ${userName}`);
}

async function validateTabData(modal, page, tabName) {
  const tab = modal.getByRole('tab', { name: tabName });
  await tab.waitFor({ state: 'visible', timeout: 15000 });
  await tab.click();

  const panelId = await tab.getAttribute('aria-controls');
  if (!panelId) {
    console.log(`📭 ${tabName} → No linked panel found`);
    return;
  }

  const panel = modal.locator(`#${panelId}`);
  await panel.waitFor({ state: 'attached', timeout: 20000 });
  await page.waitForTimeout(800);

  if (tabName === 'Cases') {
    const text = ((await panel.textContent()) || '').trim();
    console.log(text.length > 20 ? `📊 Cases → Data present` : `📭 Cases → No data in tab`);
    return;
  }

  if (tabName === 'Actions') {
    const rows = panel.locator('table tbody tr');
    const count = await rows.count();

    if (count > 0) {
      const firstRow = rows.first();
      await firstRow.waitFor({ state: 'visible', timeout: 10000 }).catch(() => {});
      const name = ((await firstRow.locator('td.text-gray').first().textContent()) || '').trim();
      console.log(name ? `📊 Actions → User: ${name}` : `📭 Actions → No data in tab`);
    } else {
      console.log(`📭 Actions → No data in tab`);
    }
    return;
  }

  if (tabName === 'Timeline') {
    const rows = panel.locator('table tbody tr');
    const count = await rows.count();

    if (count > 0) {
      const name = ((await rows.first().locator('td').first().textContent()) || '').trim();
      console.log(name ? `📊 Timeline → User: ${name}` : `📭 Timeline → No data in tab`);
    } else {
      console.log(`📭 Timeline → No data in tab`);
    }
    return;
  }

  if (tabName === 'Submissions') {
    const rows = panel.locator('table tbody tr');
    const count = await rows.count();

    if (count > 0) {
      const name = ((await rows.first().locator('td').first().textContent()) || '').trim();
      console.log(name ? `📊 Submissions → User: ${name}` : `📭 Submissions → No data in tab`);
    } else {
      console.log(`📭 Submissions → No data in tab`);
    }
    return;
  }

  if (tabName === 'Indicators') {
    const rows = panel.locator('table tbody tr');
    const count = await rows.count();

    if (count > 0) {
      const firstRow = rows.first();
      await firstRow.waitFor({ state: 'visible', timeout: 10000 }).catch(() => {});
      const name = ((await firstRow.locator('td').first().textContent()) || '').trim();
      console.log(name ? `📊 Indicators → User: ${name}` : `📭 Indicators → No data in tab`);
    } else {
      console.log(`📭 Indicators → No data in tab`);
    }
    return;
  }

  if (tabName === 'Daily Report') {
    try {
      const dailyText = page.locator('text=/Your activity for/i').first();
      await dailyText.waitFor({ timeout: 15000 });

      const proof = ((await dailyText.textContent()) || '').split('\n')[0].trim();
      console.log(proof ? `📊 Daily Report → ${proof}` : `📭 Daily Report → No data in tab`);
    } catch {
      console.log(`📭 Daily Report → No data in tab`);
    }
  }
}

module.exports = {
  waitForSUWRows,
  openSecondOrFirstSUWUser,
  validateTabData
};