// authenticated-crawler.spec.js
const { test, expect, chromium } = require('@playwright/test');
const fs = require('fs');

const baseURL = 'https://demo.cuedwell.com';
const urls = [
  '/dashboard',
  '/orgs/stats',
  '/backup',
  '/member-activity-summary',
  '/members',
  '/case-list',
  '/health/table'
];

test('Crawl authenticated pages', async ({ page }) => {
  for (const path of urls) {
    const url = `${baseURL}${path}`;
    console.log(`🔍 Crawling: ${url}`);
    await page.goto(url, { waitUntil: 'networkidle' });

    // Wait for content to render
    await page.waitForTimeout(3000); // Optional: you can replace with smarter logic

    // Try to extract page title and headings
    const title = await page.title();
    const h1s = await page.$$eval('h1', els => els.map(el => el.innerText.trim()));
    const h2s = await page.$$eval('h2', els => els.map(el => el.innerText.trim()));

    console.log(`📄 Page Title: ${title}`);
    console.log(`📝 H1s: ${h1s.join(', ') || 'None'}`);
    console.log(`📝 H2s: ${h2s.join(', ') || 'None'}`);
  }
});
