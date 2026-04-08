const { test } = require('@playwright/test');
const lighthouse = require('lighthouse').default;
const chromeLauncher = require('chrome-launcher');
const fs = require('fs');
const path = require('path');

// List of URLs to audit
const urlsToAudit = [
  'https://global.iitm.ac.in/',
  'https://global.iitm.ac.in/about-us',
  'https://global.iitm.ac.in/startups',
  'https://demo.marketing.cuedwell.com/research',
  'https://demo.marketing.cuedwell.com/ip',
  'https://demo.marketing.cuedwell.com/academic',
  'https://demo.marketing.cuedwell.com/membership',
  'https://demo.marketing.cuedwell.com/contact-us',
];

// Directory for single combined report
const outputDir = path.join(__dirname, 'lighthouse-reports');
if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir);

// Template for combined HTML
let combinedHtml = `
<html>
  <head>
    <title>Combined Lighthouse Report</title>
    <style>
      body { font-family: Arial, sans-serif; margin: 2rem; }
      h1 { text-align: center; }
      .report { margin-bottom: 2rem; border: 1px solid #ddd; padding: 1rem; border-radius: 8px; }
      iframe { width: 100%; height: 700px; border: none; }
    </style>
  </head>
  <body>
    <h1>Combined Lighthouse Report</h1>
`;

test('Single HTML: Combined Lighthouse Report', async () => {
  const chrome = await chromeLauncher.launch({ chromeFlags: ['--headless'] });
  const options = {
    port: chrome.port,
    output: 'html',
    logLevel: 'error',
    onlyCategories: ['seo', 'performance', 'accessibility'],
  };

  for (const url of urlsToAudit) {
    const result = await lighthouse(url, options);
    const htmlReport = result.report;

    const shortName = url.replace('https://', '').replace(/\W+/g, '_');
    const tempHtmlPath = path.join(outputDir, `${shortName}.html`);

    fs.writeFileSync(tempHtmlPath, htmlReport);
    console.log(`✅ Audited: ${url}`);

    combinedHtml += `
      <div class="report">
        <h2>${url}</h2>
        <iframe src="${shortName}.html"></iframe>
      </div>
    `;
  }

  combinedHtml += `
  </body>
</html>
`;

  const combinedHtmlPath = path.join(outputDir, 'combined-report.html');
  fs.writeFileSync(combinedHtmlPath, combinedHtml);
  console.log(`📄 Combined report saved at: ${combinedHtmlPath}`);

  await chrome.kill();
});
